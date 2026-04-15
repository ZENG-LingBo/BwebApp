import db from './db.js';
import { fetchAllFeeds, rankArticles } from './rss.js';
import { generateStoryCards } from './claude.js';
import { getVideoForStory } from './video.js';

/**
 * Slugify a title for unique identification
 */
function slugify(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

/**
 * Run the full pipeline: RSS → Rank → Claude → Video → DB
 */
export async function runPipeline(storyCount = 10) {
  console.log('\n=== STORY PIPELINE START ===');
  console.log(`Time: ${new Date().toISOString()}`);

  const logInsert = db.prepare(
    'INSERT INTO fetch_logs (story_count, status, error) VALUES (?, ?, ?)'
  );

  try {
    // Step 1: Fetch RSS feeds
    console.log('\n[1/4] Fetching RSS feeds...');
    const articles = await fetchAllFeeds(30);
    console.log(`  Found ${articles.length} articles from feeds`);

    if (articles.length === 0) {
      logInsert.run(0, 'error', 'No articles fetched from RSS');
      return { success: false, error: 'No articles found' };
    }

    // Step 2: Rank and select top stories
    console.log('\n[2/4] Ranking top stories...');
    const topStories = rankArticles(articles, storyCount);
    console.log(`  Selected ${topStories.length} top stories:`);
    topStories.forEach((s, i) => console.log(`  ${i + 1}. [${s.source}] ${s.title}`));

    // Step 3 & 4: Generate content and fetch videos for each story
    const storyInsert = db.prepare(`
      INSERT OR REPLACE INTO stories (
        title, slug, source, source_url, published_at,
        headline, subtitle, category, status_label, story_date,
        what_happened, why_it_matters, whats_next,
        known_facts, timeline, why_happening,
        impact_layers, matters_to_you, quotes, tooltips, highlights,
        video_id, video_title, video_filename, video_thumbnail, video_embed_url,
        raw_rss_content
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?
      )
    `);

    let successCount = 0;

    const updateVideo = db.prepare(`
      UPDATE stories SET
        video_id = ?, video_title = ?, video_filename = ?,
        video_thumbnail = ?, video_embed_url = ?
      WHERE id = ?
    `);

    for (let i = 0; i < topStories.length; i++) {
      const article = topStories[i];
      const slug = slugify(article.title);

      // Check if we already have this story.
      // Skip fully only if it already has a playable video (downloaded or
      // an embeddable URL). If it lacks a video, try to backfill one without
      // regenerating the Claude card content (saves LLM credits on retries).
      const existing = db.prepare(
        'SELECT id, video_filename, video_embed_url FROM stories WHERE slug = ?'
      ).get(slug);

      if (existing) {
        const hasVideo = existing.video_filename || existing.video_embed_url;
        if (hasVideo) {
          console.log(`\n  [${i + 1}/${topStories.length}] SKIP (already has video): ${article.title}`);
          successCount++;
          continue;
        }

        console.log(`\n  [${i + 1}/${topStories.length}] Retrying video for existing story: ${article.title}`);
        try {
          const video = await getVideoForStory(article.title);
          if (video) {
            updateVideo.run(
              video.videoId,
              video.videoTitle,
              video.videoFilename,
              video.videoThumbnail,
              video.videoEmbedUrl,
              existing.id
            );
            console.log('  Updated story with video.');
          } else {
            console.log('  Still no Short matched; leaving story as-is.');
          }
        } catch (err) {
          console.warn('  Video retry failed:', err?.message || err);
        }
        successCount++;
        continue;
      }

      console.log(`\n[3/4] Story ${i + 1}/${topStories.length}: ${article.title}`);

      // Generate card content with Claude
      console.log('  Generating card content with Claude...');
      let cards;
      try {
        cards = await generateStoryCards(article);
        console.log(`  Generated: "${cards.headline}"`);
      } catch (err) {
        console.error(`  Claude generation failed: ${err.message}`);
        continue;
      }

      // Search and download video
      console.log('\n[4/4] Finding video...');
      let video = null;
      try {
        video = await getVideoForStory(cards.video_search_query || article.title);
      } catch (err) {
        console.warn(`  Video fetch failed: ${err.message}`);
      }

      // Insert into database
      try {
        storyInsert.run(
          article.title,
          slug,
          article.source,
          article.link,
          article.published,
          cards.headline,
          cards.subtitle,
          cards.category || 'WORLD',
          cards.status_label || 'DEVELOPING',
          cards.story_date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
          cards.what_happened,
          cards.why_it_matters,
          cards.whats_next,
          JSON.stringify(cards.known_facts || []),
          JSON.stringify(cards.timeline || []),
          cards.why_happening,
          JSON.stringify(cards.impact_layers || []),
          JSON.stringify(cards.matters_to_you || []),
          JSON.stringify(cards.quotes || []),
          JSON.stringify(cards.tooltips || {}),
          JSON.stringify(cards.highlights || {}),
          video?.videoId || null,
          video?.videoTitle || null,
          video?.videoFilename || null,
          video?.videoThumbnail || null,
          video?.videoEmbedUrl || null,
          JSON.stringify(article)
        );
        successCount++;
        console.log(`  Saved to DB!`);
      } catch (err) {
        console.error(`  DB insert failed: ${err.message}`);
      }
    }

    logInsert.run(successCount, 'success', null);
    console.log(`\n=== PIPELINE COMPLETE: ${successCount}/${topStories.length} stories ===\n`);

    return { success: true, count: successCount, total: topStories.length };
  } catch (err) {
    console.error('Pipeline error:', err);
    logInsert.run(0, 'error', err.message);
    return { success: false, error: err.message };
  }
}
