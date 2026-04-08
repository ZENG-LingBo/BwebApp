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
 * Search YouTube for Shorts / short news clips
 * Prioritizes videos under 60 seconds (Shorts format)
 */
export async function searchYouTube(query, maxResults = 5) {
  try {
    // First try: search specifically for Shorts
    const { stdout } = await execFileAsync('yt-dlp', [
      `ytsearch${maxResults}:${query} #shorts news`,
      '--dump-json',
      '--no-download',
      '--flat-playlist',
    ], { timeout: 45000, maxBuffer: 1024 * 1024 * 10 });

    let videos = stdout.trim().split('\n')
      .filter(line => line.trim())
      .map(line => {
        try { return JSON.parse(line); }
        catch { return null; }
      })
      .filter(Boolean)
      .map(v => ({
        id: v.id,
        title: v.title,
        duration: v.duration,
        thumbnail: v.thumbnail || v.thumbnails?.[0]?.url,
        url: v.url || v.webpage_url || `https://www.youtube.com/watch?v=${v.id}`,
        isShort: (v.duration && v.duration <= 60) || v.url?.includes('/shorts/'),
      }));

    // Sort: Shorts first (<60s), then by shortest duration
    videos.sort((a, b) => {
      if (a.isShort && !b.isShort) return -1;
      if (!a.isShort && b.isShort) return 1;
      return (a.duration || 999) - (b.duration || 999);
    });

    return videos;
  } catch (err) {
    console.warn(`  YouTube search failed for "${query}": ${err.message}`);
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
      // Prefer vertical/mobile format, fallback to 720p
      '-f', 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best',
      '--merge-output-format', 'mp4',
      '-o', outputTemplate,
      '--no-playlist',
      '--max-filesize', '30m',
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
 * Search and download the best matching short video for a story
 * Always downloads — no embed fallback
 */
export async function getVideoForStory(searchQuery) {
  console.log(`  Searching YouTube Shorts: "${searchQuery}"`);
  const videos = await searchYouTube(searchQuery);

  if (videos.length === 0) {
    console.log('  No videos found');
    return null;
  }

  const best = videos[0];
  console.log(`  Found: "${best.title}" (${best.duration}s${best.isShort ? ' - Short' : ''})`);

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
