import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Use Claude to analyze the URL and extract information
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
- description: A brief description summarizing the key points (2-3 sentences, max 200 characters)
- type: One of these values: "article", "tip", "tool", or "text" based on the content

Guidelines:
- For "article": Blog posts, tutorials, news articles, case studies
- For "tip": Quick tips, tricks, best practices, short how-tos
- For "tool": Libraries, frameworks, dev tools, apps, services
- For "text": Announcements, thoughts, general content that doesn't fit the above

Return ONLY the JSON object, no other text.`
        }
      ]
    });

    // Extract the text content from Claude's response
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse the JSON response, removing markdown code fences if present
    let jsonText = content.text.trim();
    if (jsonText.startsWith('```')) {
      // Remove markdown code fences
      jsonText = jsonText
        .replace(/^```(?:json)?\n?/, '')
        .replace(/\n?```$/, '');
    }
    const analysis = JSON.parse(jsonText);

    return NextResponse.json({
      title: analysis.title,
      description: analysis.description,
      type: analysis.type
    });
  } catch (error) {
    console.error('Error analyzing URL:', error);
    return NextResponse.json(
      { error: 'Failed to analyze URL' },
      { status: 500 }
    );
  }
}
