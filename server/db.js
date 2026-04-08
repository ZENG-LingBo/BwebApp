import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, 'data', 'stories.db'));

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS stories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    source TEXT,
    source_url TEXT,
    published_at TEXT,
    fetched_at TEXT DEFAULT (datetime('now')),

    /* Hero card */
    headline TEXT,
    subtitle TEXT,

    /* Summary card - WHAT HAPPENED / WHY IT MATTERS / WHAT'S NEXT */
    what_happened TEXT,
    why_it_matters TEXT,
    whats_next TEXT,

    /* Known facts */
    known_facts TEXT,  /* JSON array */

    /* Timeline */
    timeline TEXT,  /* JSON array */

    /* Why this is happening */
    why_happening TEXT,

    /* Impact */
    impact_layers TEXT,  /* JSON array of nested impact layers */

    /* Why this matters to you */
    matters_to_you TEXT,  /* JSON array with emoji items */

    /* Quotes */
    quotes TEXT,  /* JSON array */

    /* Tooltips / highlights */
    tooltips TEXT,  /* JSON object with keyword tooltips */
    highlights TEXT, /* JSON object mapping sections to highlighted keywords */

    /* Top bar metadata */
    category TEXT DEFAULT 'WORLD',
    status_label TEXT DEFAULT 'DEVELOPING',
    story_date TEXT,

    /* Video */
    video_id TEXT,
    video_title TEXT,
    video_filename TEXT,
    video_thumbnail TEXT,
    video_embed_url TEXT,

    /* Full raw content for reference */
    raw_rss_content TEXT
  );

  CREATE TABLE IF NOT EXISTS fetch_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fetched_at TEXT DEFAULT (datetime('now')),
    story_count INTEGER,
    status TEXT,
    error TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_stories_fetched ON stories(fetched_at);
  CREATE INDEX IF NOT EXISTS idx_stories_slug ON stories(slug);
`);

export default db;
