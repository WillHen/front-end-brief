/**
 * Content Discovery Agent
 *
 * Fetches articles from RSS feeds and analyzes them for newsletter inclusion.
 * Uses AI to score relevance and quality.
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import Parser from 'rss-parser';
import Anthropic from '@anthropic-ai/sdk';
import sources from '../sources.json';
import { scrapeArticles } from './scraper';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

const RSS_PARSER = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Front-end Brief Newsletter/1.0'
  }
});

interface Article {
  title: string;
  link: string;
  pubDate?: string;
  contentSnippet?: string;
  source: string;
  categories?: string[];
}

interface ScoredArticle extends Article {
  score: number;
  reasoning: string;
  suggestedSection: 'article' | 'tip' | 'tool' | 'text';
  freshness: number;
}

// Get date one week ago
function getOneWeekAgo(): Date {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date;
}

// Check if article is from the last week
function isRecent(pubDate: string | undefined): boolean {
  if (!pubDate) return false;
  const articleDate = new Date(pubDate);
  const oneWeekAgo = getOneWeekAgo();
  return articleDate >= oneWeekAgo;
}

// Calculate freshness score (0-1, where 1 is today)
function calculateFreshness(pubDate: string | undefined): number {
  if (!pubDate) return 0.5;
  const articleDate = new Date(pubDate);
  const now = new Date();
  const daysDiff =
    (now.getTime() - articleDate.getTime()) / (1000 * 60 * 60 * 24);

  // Articles from today = 1.0, 7 days ago = 0.3, older = 0
  if (daysDiff <= 0) return 1.0;
  if (daysDiff >= 7) return 0.3;
  return 1.0 - (daysDiff / 7) * 0.7;
}

// Fetch articles from all RSS feeds
async function fetchArticles(): Promise<Article[]> {
  const articles: Article[] = [];

  console.log('📡 Fetching articles from RSS feeds...\n');

  // Initialize Anthropic client for scraping
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  // Fetch from blogs
  for (const blog of sources.blogs) {
    console.log(`  Fetching: ${blog.name}`);

    if (blog.rss) {
      // Try RSS feed first
      try {
        const feed = await RSS_PARSER.parseURL(blog.rss);

        const recentArticles = feed.items
          .filter((item) => isRecent(item.pubDate))
          .map((item) => ({
            title: item.title || 'Untitled',
            link: item.link || '',
            pubDate: item.pubDate,
            contentSnippet:
              item.contentSnippet || item.content?.substring(0, 500),
            source: blog.name,
            categories: blog.categories
          }));

        articles.push(...recentArticles);
        console.log(`    ✓ Found ${recentArticles.length} recent articles`);
      } catch (error) {
        console.error(
          `    ✗ Error fetching RSS:`,
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    } else {
      // Fallback to AI-powered scraping
      try {
        const scrapedArticles = await scrapeArticles(
          blog.url,
          blog.name,
          anthropic
        );

        if (scrapedArticles.length > 0) {
          articles.push(
            ...scrapedArticles.map((a) => ({
              ...a,
              categories: blog.categories
            }))
          );
          console.log(`    ✓ Scraped ${scrapedArticles.length} articles`);
        } else {
          console.log(`    ⚠ No articles found via scraping`);
        }

        // Rate limit for AI scraping
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(
          `    ✗ Error scraping:`,
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }
  }

  console.log(`\n✅ Total articles fetched: ${articles.length}\n`);
  return articles;
}

// Score articles using AI
async function scoreArticles(articles: Article[]): Promise<ScoredArticle[]> {
  if (articles.length === 0) {
    console.log('⚠️  No articles to score\n');
    return [];
  }

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  console.log('🤖 Analyzing articles with AI...\n');

  const scoredArticles: ScoredArticle[] = [];

  // Process in batches to avoid rate limits
  const BATCH_SIZE = 10;
  for (let i = 0; i < articles.length; i += BATCH_SIZE) {
    const batch = articles.slice(i, i + BATCH_SIZE);

    console.log(
      `  Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(articles.length / BATCH_SIZE)}`
    );

    const prompt = `You are a newsletter curator for "Front-end Brief", a weekly newsletter for front-end developers.

Analyze these articles and score each one (0-100) based on:
1. Relevance to front-end development
2. Quality and depth of content
3. Actionability (can readers apply this?)
4. Timeliness (is this newsworthy/important now?)
5. Uniqueness (not just rehashing basics)

For each article, also suggest the best section type:
- "article": In-depth tutorials, guides, or analysis
- "tip": Quick tips, tricks, or best practices
- "tool": New tools, libraries, or resources
- "text": News, opinions, or discussions

Articles to analyze:
${batch
  .map(
    (article, idx) => `
${idx + 1}. Title: ${article.title}
   Source: ${article.source}
   Date: ${article.pubDate || 'Unknown'}
   Preview: ${article.contentSnippet?.substring(0, 200) || 'No preview available'}
`
  )
  .join('\n')}

Respond with a JSON array of scores (one per article, in order):
[
  {
    "index": 0,
    "score": 85,
    "reasoning": "High-quality deep dive into CSS container queries with practical examples",
    "suggestedSection": "article"
  },
  ...
]`;

    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      });

      const responseText =
        message.content[0].type === 'text' ? message.content[0].text : '';

      // Extract JSON from response (might be wrapped in markdown code blocks)
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error('    ✗ Failed to parse AI response');
        continue;
      }

      const scores = JSON.parse(jsonMatch[0]);

      for (const scoreData of scores) {
        const article = batch[scoreData.index];
        if (!article) continue;

        scoredArticles.push({
          ...article,
          score: scoreData.score,
          reasoning: scoreData.reasoning,
          suggestedSection: scoreData.suggestedSection,
          freshness: calculateFreshness(article.pubDate)
        });
      }

      console.log(`    ✓ Scored ${scores.length} articles`);

      // Rate limit protection
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(
        '    ✗ Error scoring batch:',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  console.log(`\n✅ Total articles scored: ${scoredArticles.length}\n`);

  // Sort by score (with freshness boost)
  scoredArticles.sort((a, b) => {
    const scoreA = a.score + a.freshness * 10; // Fresh articles get up to +10 points
    const scoreB = b.score + b.freshness * 10;
    return scoreB - scoreA;
  });

  return scoredArticles;
}

// Display top articles
function displayResults(articles: ScoredArticle[], limit: number = 20) {
  console.log('🏆 Top Articles for This Week:\n');
  console.log('═'.repeat(100) + '\n');

  const topArticles = articles.slice(0, limit);

  topArticles.forEach((article, idx) => {
    const adjustedScore = Math.round(article.score + article.freshness * 10);
    const badge =
      article.suggestedSection === 'article'
        ? '📚'
        : article.suggestedSection === 'tip'
          ? '💡'
          : article.suggestedSection === 'tool'
            ? '🛠️'
            : '✍️';

    console.log(
      `${idx + 1}. ${badge} [Score: ${adjustedScore}/100] ${article.title}`
    );
    console.log(
      `   Source: ${article.source} | Published: ${article.pubDate || 'Unknown'}`
    );
    console.log(`   Link: ${article.link}`);
    console.log(`   Reasoning: ${article.reasoning}`);
    console.log(`   Suggested section: ${article.suggestedSection}`);
    console.log('');
  });

  console.log('═'.repeat(100) + '\n');

  // Summary by section
  const bySection = topArticles.reduce(
    (acc, article) => {
      acc[article.suggestedSection] = (acc[article.suggestedSection] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  console.log('📊 Distribution:');
  Object.entries(bySection).forEach(([section, count]) => {
    console.log(`   ${section}: ${count} articles`);
  });
  console.log('');
}

// Save results to JSON file
async function saveResults(articles: ScoredArticle[]) {
  const fs = await import('fs/promises');
  const path = await import('path');

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `content-suggestions-${timestamp}.json`;
  const filepath = path.join(process.cwd(), 'scripts', 'output', filename);

  // Ensure output directory exists
  await fs.mkdir(path.join(process.cwd(), 'scripts', 'output'), {
    recursive: true
  });

  await fs.writeFile(filepath, JSON.stringify(articles, null, 2));
  console.log(`💾 Results saved to: ${filename}\n`);
}

// Save top articles as draft newsletter to database
async function saveToDatabasePrompt(articles: ScoredArticle[]) {
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };

  try {
    const saveToDb = await question('\n💾 Save top articles as draft newsletter to database? (y/n): ');
    
    if (saveToDb.toLowerCase() !== 'y') {
      console.log('✅ Skipped database save.\n');
      rl.close();
      return;
    }

    const title = await question('Enter newsletter title (e.g., "Front-end Brief - Week of Feb 2, 2026"): ');
    
    if (!title.trim()) {
      console.log('❌ Title required. Skipping database save.\n');
      rl.close();
      return;
    }

    const limitStr = await question('How many top articles to include? (default: 10): ');
    const limit = parseInt(limitStr) || 10;

    await saveToDatabase(articles, title.trim(), limit);
    
    rl.close();
  } catch (error) {
    console.error('❌ Error during prompt:', error);
    rl.close();
  }
}

// Save articles to database as draft newsletter
async function saveToDatabase(
  articles: ScoredArticle[],
  title: string,
  limit: number
) {
  const { getServiceSupabase } = await import('../lib/supabase');
  
  try {
    const supabase = getServiceSupabase();
    
    // Convert top articles to newsletter sections
    const topArticles = articles.slice(0, limit);
    const sections = topArticles.map((article) => ({
      type: article.suggestedSection,
      title: article.title,
      description: article.contentSnippet || article.reasoning,
      url: article.link
    }));

    // Insert newsletter as draft
    const { data, error } = await supabase
      .from('newsletters')
      .insert([
        {
          title,
          content: sections,
          status: 'draft'
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log(`\n✅ Draft newsletter saved to database!`);
    console.log(`   ID: ${data.id}`);
    console.log(`   Title: ${data.title}`);
    console.log(`   Sections: ${sections.length}`);
    console.log(`   View in admin: http://localhost:3000/admin/edit/${data.id}\n`);
  } catch (error) {
    console.error('❌ Error saving to database:', error);
    throw error;
  }
}

// Main execution
async function main() {
  console.log('🚀 Front-end Brief Content Discovery Agent\n');
  console.log('═'.repeat(100) + '\n');

  try {
    // Step 1: Fetch articles
    const articles = await fetchArticles();

    if (articles.length === 0) {
      console.log('❌ No recent articles found. Exiting.\n');
      return;
    }

    // Step 2: Score with AI
    const scoredArticles = await scoreArticles(articles);

    if (scoredArticles.length === 0) {
      console.log('❌ No articles were successfully scored. Exiting.\n');
      return;
    }

    // Step 3: Display results
    displayResults(scoredArticles, 20);

    // Step 4: Save results
    await saveResults(scoredArticles);

    // Step 5: Prompt to save to database
    await saveToDatabasePrompt(scoredArticles);

    console.log('✅ Content discovery complete!\n');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { fetchArticles, scoreArticles, displayResults };
