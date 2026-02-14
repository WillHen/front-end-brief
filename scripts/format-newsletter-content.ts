#!/usr/bin/env node
/**
 * Newsletter Content Formatter Agent
 *
 * This agent takes a list of article URLs and formats them into structured newsletter content:
 * - Identifies and formats a hero story with title, subtitle, "why it matters", and link
 * - Categorizes and formats remaining articles with category, title, summary, source, and CTA
 *
 * Usage: npx tsx scripts/format-newsletter-content.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

interface HeroStory {
  title: string;
  subtitle: string;
  whyItMatters: string;
  link: string;
}

interface Article {
  category:
    | 'React'
    | 'CSS'
    | 'Tooling'
    | 'AI'
    | 'JavaScript'
    | 'Performance'
    | 'Design';
  title: string;
  summary: string;
  source: string;
  link: string;
}

interface NewsletterContent {
  hero: HeroStory;
  articles: Article[];
}

/**
 * Format articles using Claude AI
 */
async function formatNewsletterContent(
  articleUrls: string[]
): Promise<NewsletterContent> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
  }

  const client = new Anthropic({ apiKey });

  const prompt = `You are a newsletter editor for "Front-end Brief", a weekly newsletter for modern front-end developers.

I have ${articleUrls.length} articles that need to be formatted for this week's newsletter. Your task:

1. **Select the Hero Story**: Choose the most significant/impactful article as the hero story
2. **Format the Hero Story** with:
   - title: A compelling title (not just the original article title)
   - subtitle: An engaging subtitle that adds context
   - whyItMatters: 2-3 sentences explaining the significance and impact on front-end developers
   - link: The URL

3. **Format Remaining Articles** with:
   - category: One of: React, CSS, Tooling, AI, JavaScript, Performance, or Design
   - title: A clear, concise title
   - summary: 1-2 lines maximum that capture the key takeaway
   - source: The publication/author name (extract from URL or content)
   - link: The URL

Here are the article URLs to analyze:
${articleUrls.map((url, i) => `${i + 1}. ${url}`).join('\n')}

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "hero": {
    "title": "...",
    "subtitle": "...",
    "whyItMatters": "...",
    "link": "..."
  },
  "articles": [
    {
      "category": "...",
      "title": "...",
      "summary": "...",
      "source": "...",
      "link": "..."
    }
  ]
}`;

  console.log('Formatting content with AI...');
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  const responseText =
    message.content[0].type === 'text' ? message.content[0].text : '';

  // Parse the JSON response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to extract JSON from AI response');
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Main execution
 */
async function main() {
  // Get URLs from command line arguments or use examples
  const articleUrls =
    process.argv.length > 2
      ? process.argv.slice(2)
      : [
          'https://react.dev/blog/2024/04/25/react-19',
          'https://css-tricks.com/an-introduction-to-web-components/',
          'https://vercel.com/blog/introducing-ai-sdk-3-0',
          'https://web.dev/articles/view-transitions',
          'https://developer.mozilla.org/en-US/blog/scroll-driven-animations/'
        ];

  console.log(
    `\n📝 Formatting ${articleUrls.length} articles for newsletter...\n`
  );

  try {
    const content = await formatNewsletterContent(articleUrls);

    console.log('\n✅ Newsletter content formatted successfully!\n');
    console.log(JSON.stringify(content, null, 2));

    // Optionally save to file
    const fs = await import('fs/promises');
    await fs.writeFile(
      'newsletter-content.json',
      JSON.stringify(content, null, 2)
    );
    console.log('\n📁 Saved to newsletter-content.json');
  } catch (error) {
    console.error('Error formatting newsletter content:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  formatNewsletterContent,
  type NewsletterContent,
  type HeroStory,
  type Article
};
