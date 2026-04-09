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
 * Search YouTube for a short news video and return video info
 * Uses yt-dlp's search feature - no API key needed
 */
export async function searchYouTube(query, maxResults = 3) {
  try {
    const { stdout } = await execFileAsync('yt-dlp', [
      `ytsearch${maxResults}:${query} news short`,
      '--dump-json',
      '--no-download',
      '--flat-playlist',
    ], { timeout: 30000, maxBuffer: 1024 * 1024 * 5 });

    const videos = stdout.trim().split('\n')
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
        embedUrl: `https://www.youtube.com/embed/${v.id}`,
      }));

    // Prefer shorter videos (under 3 min) for mobile cards
    videos.sort((a, b) => {
      const aDur = a.duration || 999;
      const bDur = b.duration || 999;
      // Prefer videos between 30s and 180s
      const aScore = (aDur >= 30 && aDur <= 180) ? 0 : 1;
      const bScore = (bDur >= 30 && bDur <= 180) ? 0 : 1;
      return aScore - bScore || aDur - bDur;
    });

    return videos;
  } catch (err) {
    console.warn(`  YouTube search failed for "${query}": ${err.message}`);
    return [];
  }
}

/**
 * Download a YouTube video as MP4
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
      '-f', 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best',
      '--merge-output-format', 'mp4',
      '-o', outputTemplate,
      '--no-playlist',
      '--max-filesize', '50m',
    ], { timeout: 120000 });

    // Check if file exists (might have different extension)
    if (fs.existsSync(expectedFile)) {
      return `${videoId}.mp4`;
    }

    // Try to find any file with this video ID
    const files = fs.readdirSync(VIDEOS_DIR).filter(f => f.startsWith(videoId));
    if (files.length > 0) {
      // Convert to mp4 with ffmpeg if needed
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
 * Search and download the best matching video for a story
 */
export async function getVideoForStory(searchQuery) {
  console.log(`  Searching YouTube: "${searchQuery}"`);
  const videos = await searchYouTube(searchQuery);

  if (videos.length === 0) {
    console.log('  No videos found');
    return null;
  }

  const best = videos[0];
  console.log(`  Found: "${best.title}" (${best.duration}s)`);

  // Download the video
  console.log(`  Downloading ${best.id}...`);
  const filename = await downloadVideo(best.id);

  return {
    videoId: best.id,
    videoTitle: best.title,
    videoFilename: filename,
    videoThumbnail: best.thumbnail,
    videoEmbedUrl: best.embedUrl,
  };
}
