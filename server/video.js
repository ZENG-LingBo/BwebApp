import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Videos dir is configurable so Railway (and other hosts) can point it at a
// mounted persistent volume. When set, server/index.js must also serve
// `/api/videos/*` from the same path.
const VIDEOS_DIR = process.env.VIDEOS_DIR || path.join(__dirname, 'videos');

// Ensure videos directory exists
if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}

// ─── YouTube bot-detection workarounds ─────────────────────────────────
//
// Cloud datacenter IPs (Railway, Fly, AWS, GCP, …) get flagged by YouTube's
// anti-bot heuristics far more aggressively than residential IPs. On Railway
// we routinely hit "Sign in to confirm you're not a bot."
//
// Two layered mitigations:
//
// 1. `player_client=tv_simply,web_safari` — these are newer yt-dlp clients
//    that impersonate TV / Safari browsers. Their bot-detection surface is
//    different from the default `web` client and often works without any
//    cookies.
//
// 2. If a `YOUTUBE_COOKIES_B64` env var is set, decode it to a cookies file
//    and pass `--cookies` to yt-dlp. This is the official yt-dlp-recommended
//    fallback. Export cookies once from a logged-in Chrome session with
//    any "cookies.txt" browser extension, base64 the file, and paste the
//    base64 into Railway → Variables.
//
// Both mitigations apply to every yt-dlp invocation (search + download).

const EXTRACTOR_ARGS = 'youtube:player_client=tv_simply,web_safari';

let COOKIES_FILE = null;
if (process.env.YOUTUBE_COOKIES_B64) {
  try {
    const cookiesText = Buffer.from(process.env.YOUTUBE_COOKIES_B64, 'base64').toString('utf-8');
    COOKIES_FILE = path.join(VIDEOS_DIR, '.yt-cookies.txt');
    fs.writeFileSync(COOKIES_FILE, cookiesText, { mode: 0o600 });
    console.log('[video] Loaded YouTube cookies from YOUTUBE_COOKIES_B64');
  } catch (err) {
    console.warn('[video] Failed to decode YOUTUBE_COOKIES_B64:', err.message);
    COOKIES_FILE = null;
  }
}

function ytDlpArgs(extra = []) {
  const base = ['--extractor-args', EXTRACTOR_ARGS];
  if (COOKIES_FILE) base.push('--cookies', COOKIES_FILE);
  return [...base, ...extra];
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
    const { stdout } = await execFileAsync('yt-dlp', ytDlpArgs([
      searchUrl,
      '--flat-playlist',
      '--dump-json',
      '--no-download',
      '--playlist-items', `1:${CANDIDATES}`,
    ]), { timeout: 60000, maxBuffer: 1024 * 1024 * 10 });

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
    await execFileAsync('yt-dlp', ytDlpArgs([
      `https://www.youtube.com/watch?v=${videoId}`,
      // Best quality MP4
      '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
      '--merge-output-format', 'mp4',
      '-o', outputTemplate,
      '--no-playlist',
      '--max-filesize', '100m',
    ]), { timeout: 120000 });

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
 * Search for a vertical Short matching the story's query, download it if
 * possible, otherwise return the YouTube embed URL so the frontend can fall
 * back to the iframe player. Returns null only when *search* finds nothing
 * (no candidate video at all).
 *
 * Why the iframe fallback matters: on Railway (and other cloud hosts),
 * yt-dlp video downloads frequently fail to YouTube's bot detection even
 * after we've applied the tv_simply/web_safari extractor tricks + cookies.
 * The iframe player, loaded directly from youtube.com in the user's
 * browser, doesn't have that problem — it's the user's IP, not the
 * server's. So when download fails, we still record enough info to render
 * the iframe, and HeroBackdrop.jsx already knows to prefer video_filename
 * first, embed URL second, gradient last.
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

  // Canonical embed URL that works in an iframe even when the server can't
  // reach youtube.com (user's browser loads it directly).
  const embedUrl = `https://www.youtube.com/embed/${best.id}`;

  console.log(`  Downloading ${best.id}...`);
  const filename = await downloadVideo(best.id);

  if (filename) {
    return {
      videoId: best.id,
      videoTitle: best.title,
      videoFilename: filename,
      videoThumbnail: best.thumbnail,
      videoEmbedUrl: embedUrl,
    };
  }

  // Download failed — keep the embed URL so the frontend plays the Short
  // via YouTube's iframe instead of showing the gradient fallback.
  console.log(`  Download failed; falling back to YouTube iframe for ${best.id}`);
  return {
    videoId: best.id,
    videoTitle: best.title,
    videoFilename: null,
    videoThumbnail: best.thumbnail,
    videoEmbedUrl: embedUrl,
  };
}
