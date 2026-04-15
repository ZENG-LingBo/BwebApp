// .env is loaded by node itself via the --env-file-if-exists flag in package.json.
// This is important: env vars must be populated BEFORE any static import runs,
// because modules like claude.js read process.env at top level (const API_KEY = ...).
// A hand-rolled loader here would run too late due to ES module hoisting.
import express from 'express';
import cron from 'node-cron';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';
import { runPipeline } from './pipeline.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Serve downloaded videos. Same VIDEOS_DIR resolution as server/video.js
// so a Railway volume mount at an alternate path works transparently.
const VIDEOS_DIR = process.env.VIDEOS_DIR || path.join(__dirname, 'videos');
app.use('/api/videos', express.static(VIDEOS_DIR));

// Serve the built frontend
app.use(express.static(path.join(__dirname, '..', 'dist')));

// CORS for dev mode
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// ─── API ROUTES ───────────────────────────────────────────

/**
 * GET /api/stories/today
 * Returns today's stories (or most recent if none today)
 */
app.get('/api/stories/today', (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  let stories = db.prepare(`
    SELECT * FROM stories
    WHERE date(fetched_at) = ?
    ORDER BY id ASC
  `).all(today);

  // Fallback: get most recent stories if none today
  if (stories.length === 0) {
    stories = db.prepare(`
      SELECT * FROM stories
      ORDER BY fetched_at DESC, id ASC
      LIMIT 10
    `).all();
  }

  // Parse JSON fields
  const parsed = stories.map(parseStory);
  res.json({ date: today, count: parsed.length, stories: parsed });
});

/**
 * GET /api/stories/:id
 * Returns a single story by ID
 */
app.get('/api/stories/:id', (req, res) => {
  const story = db.prepare('SELECT * FROM stories WHERE id = ?').get(req.params.id);
  if (!story) return res.status(404).json({ error: 'Story not found' });
  res.json(parseStory(story));
});

/**
 * GET /api/stories
 * Returns all stories with optional pagination
 */
app.get('/api/stories', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const offset = parseInt(req.query.offset) || 0;

  const stories = db.prepare(`
    SELECT * FROM stories
    ORDER BY fetched_at DESC, id ASC
    LIMIT ? OFFSET ?
  `).all(limit, offset);

  const total = db.prepare('SELECT COUNT(*) as count FROM stories').get().count;

  res.json({
    total,
    limit,
    offset,
    stories: stories.map(parseStory),
  });
});

/**
 * POST /api/stories/fetch
 * Manually trigger the story pipeline
 */
app.post('/api/stories/fetch', async (req, res) => {
  const count = Math.min(parseInt(req.body?.count) || 10, 15);
  console.log(`Manual fetch triggered for ${count} stories`);

  try {
    const result = await runPipeline(count);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/status
 * Health check and stats
 */
app.get('/api/status', (req, res) => {
  const storyCount = db.prepare('SELECT COUNT(*) as count FROM stories').get().count;
  const lastFetch = db.prepare('SELECT * FROM fetch_logs ORDER BY id DESC LIMIT 1').get();
  const todayCount = db.prepare(
    "SELECT COUNT(*) as count FROM stories WHERE date(fetched_at) = date('now')"
  ).get().count;

  res.json({
    status: 'ok',
    totalStories: storyCount,
    todayStories: todayCount,
    lastFetch: lastFetch || null,
  });
});

/**
 * GET /api/logs
 * Recent fetch logs
 */
app.get('/api/logs', (req, res) => {
  const logs = db.prepare('SELECT * FROM fetch_logs ORDER BY id DESC LIMIT 20').all();
  res.json(logs);
});

// SPA fallback - serve index.html for non-API routes
app.get('/{*path}', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
});

// ─── CRON SCHEDULER ───────────────────────────────────────

// Run daily at 6:00 AM Hong Kong time (UTC+8)
cron.schedule('0 6 * * *', async () => {
  console.log('\n[CRON] Daily story fetch triggered (6 AM HKT)');
  await runPipeline(10);
}, {
  timezone: 'Asia/Hong_Kong'
});

// ─── PARSE HELPER ─────────────────────────────────────────

function parseStory(story) {
  const jsonFields = [
    'known_facts', 'timeline', 'impact_layers',
    'matters_to_you', 'quotes', 'tooltips', 'highlights'
  ];

  const parsed = { ...story };
  for (const field of jsonFields) {
    if (parsed[field]) {
      try { parsed[field] = JSON.parse(parsed[field]); }
      catch { parsed[field] = null; }
    }
  }

  // Remove raw_rss_content from API response (too large)
  delete parsed.raw_rss_content;

  return parsed;
}

// ─── START ────────────────────────────────────────────────

app.listen(PORT, async () => {
  console.log(`\n🚀 BwebApp server running on http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api/status`);
  console.log(`   Stories: http://localhost:${PORT}/api/stories/today`);
  console.log(`   Cron: Daily at 06:00 AM Hong Kong time\n`);

  // Auto-fetch on startup if no stories exist for today
  const todayCount = db.prepare(
    "SELECT COUNT(*) as count FROM stories WHERE date(fetched_at) = date('now')"
  ).get().count;

  if (todayCount === 0) {
    const totalCount = db.prepare('SELECT COUNT(*) as count FROM stories').get().count;
    if (totalCount === 0) {
      console.log('[STARTUP] No stories in database. Fetching 10 stories now...');
      await runPipeline(10);
    } else {
      console.log(`[STARTUP] No stories today, but ${totalCount} from previous days. Next fetch at 6 AM HKT.`);
    }
  } else {
    console.log(`[STARTUP] ${todayCount} stories already fetched today.`);
  }
});
