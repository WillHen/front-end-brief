# Content Discovery Agent

An AI-powered tool that discovers and ranks the best front-end articles from curated sources for weekly newsletter inclusion.

## Features

- 📡 Fetches articles from RSS feeds in `sources.json`
- 🤖 Uses Claude AI to analyze and score content
- 📊 Ranks by relevance, quality, and freshness
- 🏷️ Suggests appropriate newsletter sections
- 💾 Saves results to JSON for review

## Setup

1. Install dependencies:

```bash
npm install
```

2. Add your Anthropic API key to `.env.local`:

```env
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

3. Run the agent:

```bash
npm run discover
```

## How It Works

1. **Fetch**: Pulls recent articles (last 7 days) from all RSS feeds in `sources.json`
2. **Analyze**: Uses Claude to score each article on:
   - Relevance to front-end development (0-100)
   - Quality and depth
   - Actionability
   - Timeliness
   - Uniqueness
3. **Rank**: Combines AI score with freshness bonus
4. **Categorize**: Suggests section type (article, tip, tool, text)
5. **Export**: Saves top results to `scripts/output/content-suggestions-YYYY-MM-DD.json`

## Output

The script displays:

- Top 20 articles with scores and reasoning
- Distribution by section type
- JSON file with full results

Example output:

```
🏆 Top Articles for This Week:

1. 📚 [Score: 92/100] Modern CSS Solutions for Common Problems
   Source: CSS-Tricks | Published: Feb 29, 2026
   Link: https://css-tricks.com/...
   Reasoning: Comprehensive guide with practical examples
   Suggested section: article
```

## Customization

Edit `scripts/discover-content.ts` to:

- Change batch size for API calls
- Adjust freshness weighting
- Modify AI scoring criteria
- Add engagement metrics from APIs
- Filter by specific categories

## Cost Estimate

- ~$0.01-0.03 per batch of 10 articles analyzed
- Typical run (100 articles): ~$0.10-0.30

## Next Steps

- [ ] Add GitHub trending integration
- [ ] Fetch Reddit/HN upvote counts
- [ ] Track article engagement over time
- [ ] Auto-populate draft newsletters
- [ ] Schedule weekly runs
