/**
 * Seed script - inserts a sample story into the database for testing.
 * Run: node server/seed.js
 */

import db from './db.js';

const sampleStory = {
  title: 'Global Climate Summit Reaches Historic Agreement',
  slug: 'global-climate-summit-historic-agreement',
  source: 'Reuters',
  source_url: 'https://reuters.com/example',
  published_at: new Date().toISOString(),
  headline: 'WORLD LEADERS SEAL CLIMATE PACT',
  subtitle: 'Nations agree to binding emissions cuts for the first time',
  category: 'WORLD',
  status_label: 'BREAKING',
  story_date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
  what_happened: 'World leaders at the Global Climate Summit have agreed to <hl-peach>binding emissions targets</hl-peach> that would require all major economies to cut carbon output by 50% by 2035. The agreement, reached after marathon negotiations, includes a <hl-peach>$500 billion green fund</hl-peach> for developing nations.',
  why_it_matters: 'This is the first time <hl-green>legally binding commitments</hl-green> have been agreed upon at this scale. Previous accords relied on voluntary pledges. Scientists say these targets align with limiting warming to <hl-green>1.5 degrees Celsius</hl-green>.',
  whats_next: 'Nations must now pass <hl-purple>domestic legislation</hl-purple> to implement the targets within 18 months. A <hl-purple>compliance review mechanism</hl-purple> will monitor progress annually.',
  known_facts: JSON.stringify([
    '<hl-green>195 nations</hl-green> signed the agreement',
    '<hl-green>50% emissions reduction</hl-green> target by 2035',
    '<hl-green>$500 billion fund</hl-green> for developing nations',
  ]),
  timeline: JSON.stringify([
    { date: '2015', label: 'Paris Agreement signed — voluntary targets', isCurrent: false },
    { date: '2021', label: 'COP26 Glasgow — strengthened pledges', isCurrent: false },
    { date: '2024', label: 'COP29 — finance commitments increase', isCurrent: false },
    { date: 'NOW', label: 'Historic binding agreement reached', isCurrent: true },
  ]),
  why_happening: 'Years of <hl-peach>record-breaking temperatures</hl-peach>, devastating <hl-peach>extreme weather events</hl-peach>, and growing public pressure have forced leaders to move beyond voluntary pledges to <hl-peach>enforceable commitments</hl-peach>.',
  impact_layers: JSON.stringify([
    { label: 'Global energy transformation', level: 'outer' },
    { label: 'Industrial policy overhaul', level: 'second' },
    { label: 'Financial market shifts', level: 'third' },
    { label: 'Energy prices & jobs', level: 'inner' },
  ]),
  matters_to_you: JSON.stringify([
    { emoji: '⚡', text: '<hl-peach>Energy bills</hl-peach> may rise short-term as nations shift to renewables' },
    { emoji: '🏭', text: 'New <hl-peach>green jobs</hl-peach> expected in clean energy and infrastructure' },
    { emoji: '🌡️', text: 'Could prevent the worst <hl-peach>climate disasters</hl-peach> for future generations' },
    { emoji: '🚗', text: 'Accelerated transition to <hl-peach>electric vehicles</hl-peach> and public transit' },
  ]),
  quotes: JSON.stringify([
    { speaker: 'UN Secretary-General', quote: 'This is <hl-purple>the moment humanity chose its future</hl-purple> over short-term profit' },
    { speaker: 'EU Climate Commissioner', quote: 'We have moved from <hl-purple>promises to enforceable action</hl-purple> — that is the breakthrough' },
  ]),
  tooltips: JSON.stringify({
    'binding-emissions-targets': {
      keyword: 'Binding Emissions Targets',
      status: 'CONFIRMED',
      statusColor: '#4CAF50',
      body: 'Unlike previous voluntary pledges, these targets are legally enforceable.',
      detail: 'Key features:',
      bullets: [
        '50% reduction by 2035 from 2020 levels',
        'Penalties for non-compliance',
        'Annual review mechanism',
      ],
      footer: 'First legally binding global emissions framework.',
    },
    'green-fund': {
      keyword: '$500B Green Fund',
      status: 'DEVELOPING',
      statusColor: '#FF9800',
      body: 'A new fund to help developing nations transition to clean energy.',
      detail: 'Funding sources include:',
      bullets: [
        'Contributions from top 20 economies',
        'Carbon tax revenues',
        'Private sector matching',
      ],
      footer: 'Disbursement details still being finalized.',
    },
  }),
  highlights: JSON.stringify({}),
  video_id: 'dQw4w9WgXcQ',
  video_title: 'Climate Summit Agreement Explained',
  video_filename: null,
  video_thumbnail: null,
  video_embed_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  raw_rss_content: '{}',
};

const insert = db.prepare(`
  INSERT OR REPLACE INTO stories (
    title, slug, source, source_url, published_at,
    headline, subtitle, category, status_label, story_date,
    what_happened, why_it_matters, whats_next,
    known_facts, timeline, why_happening,
    impact_layers, matters_to_you, quotes, tooltips, highlights,
    video_id, video_title, video_filename, video_thumbnail, video_embed_url,
    raw_rss_content
  ) VALUES (
    $title, $slug, $source, $source_url, $published_at,
    $headline, $subtitle, $category, $status_label, $story_date,
    $what_happened, $why_it_matters, $whats_next,
    $known_facts, $timeline, $why_happening,
    $impact_layers, $matters_to_you, $quotes, $tooltips, $highlights,
    $video_id, $video_title, $video_filename, $video_thumbnail, $video_embed_url,
    $raw_rss_content
  )
`);

insert.run(sampleStory);
console.log('Sample story seeded successfully!');

// Verify
const count = db.prepare('SELECT COUNT(*) as count FROM stories').get();
console.log(`Total stories in DB: ${count.count}`);
