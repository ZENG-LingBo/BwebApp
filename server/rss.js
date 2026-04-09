import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 15000,
  headers: { 'User-Agent': 'BwebApp/1.0 News Aggregator' },
});

// Top news agency RSS feeds - free, no auth needed
const FEEDS = [
  { name: 'Reuters World',     url: 'https://feeds.reuters.com/reuters/worldNews' },
  { name: 'Reuters Top',       url: 'https://feeds.reuters.com/reuters/topNews' },
  { name: 'AP Top News',       url: 'https://rss.app/feeds/v1.1/ts8K1FMPOcM0GQPW.xml' },
  { name: 'BBC World',         url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
  { name: 'Al Jazeera',        url: 'https://www.aljazeera.com/xml/rss/all.xml' },
  { name: 'NPR News',          url: 'https://feeds.npr.org/1001/rss.xml' },
  { name: 'Guardian World',    url: 'https://www.theguardian.com/world/rss' },
];

/**
 * Fetch all RSS feeds and return deduplicated, ranked articles
 * Returns top N articles sorted by recency
 */
export async function fetchAllFeeds(limit = 30) {
  const allArticles = [];

  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url);
        return parsed.items.map(item => ({
          title: item.title?.trim(),
          link: item.link,
          summary: item.contentSnippet || item.content || item.summary || '',
          published: item.pubDate || item.isoDate,
          source: feed.name,
        }));
      } catch (err) {
        console.warn(`  RSS fetch failed for ${feed.name}: ${err.message}`);
        return [];
      }
    })
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allArticles.push(...result.value);
    }
  }

  // Deduplicate by similar titles (basic)
  const seen = new Set();
  const unique = allArticles.filter(a => {
    if (!a.title) return false;
    const key = a.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by publish date (newest first)
  unique.sort((a, b) => {
    const da = a.published ? new Date(a.published) : new Date(0);
    const db = b.published ? new Date(b.published) : new Date(0);
    return db - da;
  });

  return unique.slice(0, limit);
}

/**
 * Select top 10 most newsworthy stories from a list of articles
 * Uses a simple scoring heuristic (multi-source coverage = higher priority)
 */
export function rankArticles(articles, topN = 10) {
  // Group by rough topic (first 5 significant words)
  const topics = new Map();

  for (const article of articles) {
    const words = article.title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3)
      .slice(0, 5)
      .sort()
      .join(' ');

    if (!topics.has(words)) {
      topics.set(words, { articles: [], bestArticle: article });
    }
    topics.get(words).articles.push(article);
    // Keep the one with the longest summary
    const current = topics.get(words).bestArticle;
    if (article.summary.length > current.summary.length) {
      topics.get(words).bestArticle = article;
    }
  }

  // Score: more sources covering = more important
  const scored = [...topics.values()].map(t => ({
    ...t.bestArticle,
    score: t.articles.length,
    sources: [...new Set(t.articles.map(a => a.source))],
  }));

  scored.sort((a, b) => b.score - a.score || new Date(b.published) - new Date(a.published));

  return scored.slice(0, topN);
}
