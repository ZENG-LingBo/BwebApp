import Anthropic from '@anthropic-ai/sdk';

let client = null;

function getClient() {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
  }
  return client;
}

/**
 * Generate full card content for a news story using Claude
 */
export async function generateStoryCards(article) {
  const prompt = `You are a news story card generator for a mobile news app. Given a news article, generate structured JSON content for multiple story cards.

Article:
Title: ${article.title}
Source: ${article.source} (${article.sources?.join(', ') || article.source})
Published: ${article.published}
Summary: ${article.summary}
URL: ${article.link}

Generate a complete JSON object with these fields:

{
  "headline": "SHORT ALL-CAPS HEADLINE (max 6 words, punchy, Bebas Neue style)",
  "subtitle": "One sentence subtitle explaining the story (max 15 words)",
  "category": "WORLD or POLITICS or TECH or BUSINESS or SCIENCE or HEALTH",
  "status_label": "BREAKING or DEVELOPING or ESCALATING or CONFIRMED or ANALYSIS",
  "story_date": "DD MMM YYYY format",

  "what_happened": "2-3 sentences explaining what happened. Use <hl-peach>key terms</hl-peach> to highlight important phrases.",
  "why_it_matters": "2-3 sentences on significance. Use <hl-green>key terms</hl-green> for highlights.",
  "whats_next": "2-3 sentences on what to watch for. Use <hl-purple>key terms</hl-purple> for highlights.",

  "known_facts": [
    "Fact 1 with <hl-green>highlighted key phrase</hl-green>",
    "Fact 2 with <hl-green>highlighted key phrase</hl-green>",
    "Fact 3 with <hl-green>highlighted key phrase</hl-green>"
  ],

  "timeline": [
    { "date": "YYYY or specific date", "label": "Short event description", "isCurrent": false },
    { "date": "YYYY or specific date", "label": "Short event description", "isCurrent": false },
    { "date": "NOW", "label": "Current event description", "isCurrent": true }
  ],

  "why_happening": "2-3 sentences with <hl-peach>highlighted causes</hl-peach>.",

  "impact_layers": [
    { "label": "Broadest impact (geopolitical/global)", "level": "outer" },
    { "label": "Second level impact", "level": "second" },
    { "label": "Third level impact", "level": "third" },
    { "label": "Most immediate/direct impact", "level": "inner" }
  ],

  "matters_to_you": [
    { "emoji": "relevant emoji", "text": "How it affects everyday people with <hl-peach>key phrase</hl-peach>" },
    { "emoji": "relevant emoji", "text": "Another personal impact with <hl-peach>key phrase</hl-peach>" },
    { "emoji": "relevant emoji", "text": "Another angle with <hl-peach>key phrase</hl-peach>" },
    { "emoji": "relevant emoji", "text": "Broader implication with <hl-peach>key phrase</hl-peach>" }
  ],

  "quotes": [
    { "speaker": "Person name, Title", "quote": "What they said with <hl-purple>key phrase</hl-purple>" },
    { "speaker": "Person name, Title", "quote": "What they said with <hl-purple>key phrase</hl-purple>" }
  ],

  "tooltips": {
    "keyword-slug": {
      "keyword": "Display Keyword",
      "status": "CONFIRMED or DEVELOPING",
      "statusColor": "#4CAF50 for CONFIRMED or #FF9800 for DEVELOPING",
      "body": "Brief explanation of this keyword/concept",
      "detail": "More detailed context",
      "bullets": ["Key point 1", "Key point 2", "Key point 3"],
      "footer": "Source or date info"
    }
  },

  "video_search_query": "YouTube search query to find a short news video about this story (max 8 words)"
}

IMPORTANT:
- Make the content informative but concise - this is a mobile card UI
- Use highlights sparingly (1-3 per section)
- Tooltips should explain 2-4 key terms that appear in highlights
- The headline should be dramatic and attention-grabbing
- Timeline should have 3-5 entries showing how we got here
- All text should be factual based on the article content
- Return ONLY valid JSON, no markdown fences`;

  const response = await getClient().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text;

  // Extract JSON from response (handle possible markdown fencing)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Claude did not return valid JSON');
  }

  return JSON.parse(jsonMatch[0]);
}
