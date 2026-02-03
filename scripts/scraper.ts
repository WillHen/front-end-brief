/**
 * AI-Powered Web Scraper
 *
 * Uses Claude to intelligently extract article links from blog homepages
 * when RSS feeds are not available.
 */

import Anthropic from '@anthropic-ai/sdk';

interface Article {
  title: string;
  link: string;
  pubDate?: string;
  contentSnippet?: string;
  source: string;
  categories?: string[];
}

/**
 * Scrape articles from a blog homepage using AI
 * @param url - Blog homepage URL
 * @param sourceName - Name of the source/blog
 * @param anthropic - Anthropic client instance
 * @returns Array of extracted articles (max 5)
 */
export async function scrapeArticles(
  url: string,
  sourceName: string,
  anthropic: Anthropic
): Promise<Article[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Front-end Brief Newsletter/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    // Truncate HTML to avoid token limits (keep first 50KB)
    const truncatedHtml = html.substring(0, 50000);

    const prompt = `You are analyzing a blog homepage to find recent articles. Extract all blog post/article links from this HTML.

For each article you find, provide:
- title: The article title
- link: The full URL (if relative, prepend ${url})
- contentSnippet: A brief description if available (max 200 chars)

Only include actual blog posts/articles, not navigation links, about pages, etc.

HTML:
${truncatedHtml}

Respond with a JSON array (max 5 articles):
[
  {
    "title": "Article Title",
    "link": "https://example.com/blog/article",
    "contentSnippet": "Brief description..."
  }
]`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    // Extract JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return [];
    }

    const extracted = JSON.parse(jsonMatch[0]);

    return extracted.map((item: any) => ({
      title: item.title,
      link: item.link,
      source: sourceName,
      pubDate: undefined,
      contentSnippet: item.contentSnippet,
      categories: []
    }));
  } catch (error) {
    throw error;
  }
}
