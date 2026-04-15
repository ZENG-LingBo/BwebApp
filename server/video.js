import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VIDEOS_DIR = path.join(__dirname, 'videos');

// Ensure videos directory exists
if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}

/**
 * Search YouTube specifically for genuine Shorts (vertical 9:16 content).
 *
 * IMPORTANT: `yt-dlp ytsearchN:...` hits YouTube's search API which ranks
 * long-form videos above Shorts for most news queries. Even with `#shorts`
 * in the query, a 30-candidate search returned 0 true Shorts for "Trump
 * Powell Fed" — all horizontal news clips.
 *
 * Instead we hit YouTube's search results page URL with `sp=EgIYAQ%253D%253D`
 * (the Duration=Short UI filter), then keep only entries whose URL contains
 * `/shorts/` — YouTube's authoritative signal that a video lives in the
 * Shorts shelf (guaranteed 9:16). Empirically this returns ~20/30 true
 * Shorts for news queries, including content the ytsearch API missed.
 *
 * `--flat-playlist` is much faster than resolving each entry's full metadata
 * and is sufficient here — we don't need width/height because `/shorts/`
 * already guarantees vertical.
 */
export async function searchYouTube(query, maxResults = 5) {
  const SP_SHORT_DURATION = 'EgIYAQ%253D%253D';   // YouTube UI: Duration = Short (<4min)
  const CANDIDATES = 40;

  const searchUrl =
    `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}` +
    `&sp=${SP_SHORT_DURATION}`;

  try {
    const { stdout } = await execFileAsync('yt-dlp', [
      searchUrl,
      '--flat-playlist',
      '--dump-json',
      '--no-download',
      '--playlist-items', `1:${CANDIDATES}`,
    ], { timeout: 60000, maxBuffer: 1024 * 1024 * 10 });

    const videos = stdout.trim().split('\n')
      .filter(line => line.trim().startsWith('{'))
      .map(line => {
        try { return JSON.parse(line); }
        catch { return null; }
      })
      .filter(Boolean)
      // Authoritative Shorts signal: URL path contains `/shorts/`.
      .filter(v => (v.url || '').includes('/shorts/'))
      .map(v => ({
        id: v.id,
        title: v.title,
        duration: v.duration,
        // `/shorts/` URLs are always 9:16. yt-dlp in --flat-playlist mode
        // doesn't populate width/height, so we fill in the guaranteed aspect.
        width: v.width || 1080,
        height: v.height || 1920,
        thumbnail: v.thumbnails?.[0]?.url,
        url: v.url,
        aspectRatio: 1.78,
      }))
      .slice(0, maxResults);

    return videos;
  } catch (err) {
    console.warn(`  YouTube Shorts search failed for "${query}": ${err.message}`);
    return [];
  }
}

/**
 * Download a YouTube video as MP4 (optimized for mobile vertical/short format)
 * Returns the local filename
 */
export async function downloadVideo(videoId) {
  const outputTemplate = path.join(VIDEOS_DIR, `${videoId}.%(ext)s`);
  const expectedFile = path.join(VIDEOS_DIR, `${videoId}.mp4`);

  // Skip if already downloaded
  if (fs.existsSync(expectedFile)) {
    console.log(`  Video ${videoId} already downloaded`);
    return `${videoId}.mp4`;
  }

  try {
    await execFileAsync('yt-dlp', [
      `https://www.youtube.com/watch?v=${videoId}`,
      // Best quality MP4
      '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
      '--merge-output-format', 'mp4',
      '-o', outputTemplate,
      '--no-playlist',
      '--max-filesize', '100m',
    ], { timeout: 120000 });

    if (fs.existsSync(expectedFile)) {
      return `${videoId}.mp4`;
    }

    // Find any file with this ID and convert if needed
    const files = fs.readdirSync(VIDEOS_DIR).filter(f => f.startsWith(videoId));
    if (files.length > 0) {
      const srcFile = path.join(VIDEOS_DIR, files[0]);
      if (!files[0].endsWith('.mp4')) {
        await execFileAsync('ffmpeg', [
          '-i', srcFile,
          '-c:v', 'copy', '-c:a', 'aac',
          expectedFile,
          '-y'
        ], { timeout: 60000 });
        fs.unlinkSync(srcFile);
      }
      return `${videoId}.mp4`;
    }

    throw new Error('Download produced no output file');
  } catch (err) {
    console.warn(`  Video download failed for ${videoId}: ${err.message}`);
    return null;
  }
}

/**
 * Search and download the best matching vertical short video for a story.
 * Always downloads — no embed fallback. Returns null if no Shorts-format
 * video matches (caller falls back to gradient hero).
 */
export async function getVideoForStory(searchQuery) {
  console.log(`  Searching YouTube Shorts shelf (9:16 guaranteed): "${searchQuery}"`);
  const videos = await searchYouTube(searchQuery);

  if (videos.length === 0) {
    console.log('  No Shorts found in the Shorts shelf for this query');
    return null;
  }

  const best = videos[0];
  console.log(`  Found Short: "${best.title}" (${best.duration}s) ${best.url}`);

  // Always download the video
  console.log(`  Downloading ${best.id}...`);
  const filename = await downloadVideo(best.id);

  if (!filename) {
    console.log('  Download failed, skipping video');
    return null;
  }

  return {
    videoId: best.id,
    videoTitle: best.title,
    videoFilename: filename,
    videoThumbnail: best.thumbnail,
    videoEmbedUrl: null, // No embed — always use downloaded file
  };
}
