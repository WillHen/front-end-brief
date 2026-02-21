import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import Anthropic from '@anthropic-ai/sdk';
import sources from '@/sources.json';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

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
}

interface FormattedArticle {
  type: 'article' | 'tip' | 'tool' | 'text';
  title: string;
  description: string;
  url: string;
}

function getOneWeekAgo(): Date {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date;
}

function isRecent(pubDate: string | undefined): boolean {
  if (!pubDate) return false;
  try {
    const articleDate = new Date(pubDate);
    return articleDate >= getOneWeekAgo();
  } catch {
    return false;
  }
}

async function fetchArticles(): Promise<Article[]> {
  const articles: Article[] = [];

  // Extract RSS URLs from source objects
  const blogRssUrls = sources.blogs
    .map((blog: { name: string; url: string; rss?: string; categories: string[] }) => blog.rss)
    .filter((rss: string | undefined) => rss);
  const communityRssUrls = sources.communities
    .map((community: { name: string; url: string; rss?: string; categories: string[] }) => community.rss)
    .filter((rss: string | undefined) => rss);

  const feedUrls = [...blogRssUrls, ...communityRssUrls];

  await Promise.all(
    feedUrls.map(async (feedUrl) => {
      try {
        const feed = await RSS_PARSER.parseURL(feedUrl);
        const sourceName = feed.title || new URL(feedUrl).hostname;

        feed.items.forEach((item) => {
          if (item.link && item.title && isRecent(item.pubDate)) {
            articles.push({
              title: item.title,
              link: item.link,
              pubDate: item.pubDate,
              contentSnippet: item.contentSnippet,
              source: sourceName,
              categories: item.categories
            });
          }
        });
      } catch (error) {
        console.error(`Failed to fetch ${feedUrl}:`, error);
      }
    })
  );

  return articles;
}

async function scoreArticles(articles: Article[]): Promise<ScoredArticle[]> {
  const scoredArticles: ScoredArticle[] = [];
  const batchSize = 20;

  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize);

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
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      });

      const responseText =
        message.content[0].type === 'text' ? message.content[0].text : '';

      let jsonText = responseText.trim();
      if (jsonText.startsWith('```')) {
        jsonText = jsonText
          .replace(/^```(?:json)?\n?/, '')
          .replace(/\n?```$/, '');
      }

      const scores = JSON.parse(jsonText);

      scores.forEach((score: { index: number; score: number; reasoning: string; suggestedSection?: string }) => {
        const article = batch[score.index];
        if (article) {
          scoredArticles.push({
            ...article,
            score: score.score,
            reasoning: score.reasoning,
            suggestedSection: score.suggestedSection
          });
        }
      });
    } catch (error) {
      console.error('Error scoring batch:', error);
    }
  }

  return scoredArticles.sort((a, b) => b.score - a.score);
}

function applySourceDiversity(articles: ScoredArticle[]): ScoredArticle[] {
  const sourceCounts = new Map<string, number>();
  const maxPerSource = 2;
  const filtered: ScoredArticle[] = [];

  for (const article of articles) {
    const count = sourceCounts.get(article.source) || 0;
    if (count < maxPerSource) {
      filtered.push(article);
      sourceCounts.set(article.source, count + 1);
    }
  }

  return filtered;
}

async function analyzeUrlForNewsletter(
  url: string,
  source: string
): Promise<{
  title: string;
  description: string;
  type: 'article' | 'tip' | 'tool' | 'text';
  category?: string;
}> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Please analyze this URL and provide the following information in JSON format:

URL: ${url}

Return a JSON object with:
- title: A concise, engaging title for the content (max 80 characters)
- description: A brief, compelling summary (2-3 sentences, max 200 characters)
- type: One of these values: "article", "tip", "tool", or "text" based on the content
- category: Choose ONE from: React, CSS, JavaScript, Tooling, AI, Performance, Design (only if type is "article")
- subtitle: A one-sentence hook (only if type is "text" - this will be a hero story)
- whyItMatters: A brief explanation of impact (only if type is "text")

Return ONLY the JSON object, no other text.`
      }
    ]
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  let jsonText = content.text.trim();
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  const analysis = JSON.parse(jsonText);

  // Format description based on type
  if (analysis.type === 'text') {
    // Hero story format: subtitle\n\n**Why it matters:** explanation
    analysis.description = `${analysis.subtitle || analysis.description}\n\n**Why it matters:** ${analysis.whyItMatters || 'This represents a significant development in front-end technology.'}`;
  } else if (analysis.type === 'article') {
    // Article format: summary\n*Category: Name*\n*Source: Name*
    analysis.description = `${analysis.description}\n*Category: ${analysis.category || 'JavaScript'}*\n*Source: ${source}*`;
  } else {
    // For tips and tools, just add source
    analysis.description = `${analysis.description}\n*Source: ${source}*`;
  }

  return analysis;
}

export async function POST() {
  try {
    console.log('Starting content discovery...');

    // Fetch recent articles
    const articles = await fetchArticles();
    if (articles.length === 0) {
      return NextResponse.json(
        { error: 'No recent articles found' },
        { status: 404 }
      );
    }

    console.log(`Found ${articles.length} recent articles`);

    // Score articles
    const scoredArticles = await scoreArticles(articles);
    console.log(`Scored ${scoredArticles.length} articles`);

    // Apply source diversity and filter
    const diverseArticles = applySourceDiversity(scoredArticles);
    const topArticles = diverseArticles
      .filter((article) => article.score >= 70)
      .slice(0, 8);

    if (topArticles.length < 3) {
      return NextResponse.json(
        { error: 'Not enough high-quality articles found (need at least 3)' },
        { status: 404 }
      );
    }

    console.log(`Selected ${topArticles.length} top articles`);

    // Format articles for newsletter
    // First article becomes hero story, rest are articles
    const formattedArticles: FormattedArticle[] = await Promise.all(
      topArticles.map(async (article, index) => {
        try {
          const analysis = await analyzeUrlForNewsletter(
            article.link,
            article.source
          );
          return {
            type: index === 0 ? 'text' : 'article', // First one is hero story
            title: analysis.title,
            description: analysis.description,
            url: article.link
          };
        } catch (error) {
          console.error(`Failed to analyze ${article.link}:`, error);
          // Fallback formatting
          const isHero = index === 0;
          const desc = isHero
            ? `${article.contentSnippet?.substring(0, 200) || ''}\n\n**Why it matters:** This represents a significant development in front-end technology.`
            : `${article.contentSnippet?.substring(0, 200) || ''}\n*Category: JavaScript*\n*Source: ${article.source}*`;
          return {
            type: isHero ? 'text' : 'article',
            title: article.title,
            description: desc,
            url: article.link
          };
        }
      })
    );

    return NextResponse.json({
      articles: formattedArticles,
      count: formattedArticles.length
    });
  } catch (error) {
    console.error('Error discovering content:', error);
    return NextResponse.json(
      { error: 'Failed to discover content' },
      { status: 500 }
    );
  }
}
