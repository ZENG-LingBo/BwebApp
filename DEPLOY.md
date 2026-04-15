# Deploying to Railway

This repo is Railway-ready. The build uses Nixpacks (no Dockerfile) and
installs `yt-dlp` + `ffmpeg` from Nix so the story pipeline can fetch and
transcode YouTube Shorts.

## One-time setup

### 1. Create the service

In the Railway dashboard:

1. **New Project → Deploy from GitHub repo** → pick `ZENG-LingBo/BwebApp`.
2. Pick the branch you want (e.g. `main` or a feature branch).
3. Railway auto-detects `railway.json` + `nixpacks.toml`. No settings to touch.

### 2. Attach a persistent volume

The app writes two things that MUST survive redeploys:

- `stories.db` — SQLite DB of generated stories
- `videos/*.mp4` — downloaded vertical Shorts

Both default to paths inside the container filesystem, which is **wiped on
every deploy**. Mount a volume so they persist:

1. Service → **Settings → Volumes → New Volume**.
2. **Mount path**: `/app/storage`.
3. Size: 1 GB is plenty to start; each Short MP4 is ~1–3 MB.

### 3. Set environment variables

Service → **Variables**. Add:

| Key | Value |
|---|---|
| `LLM_API_BASE` | `https://new.lemonapi.site/v1` (or your OpenAI-compatible proxy) |
| `LLM_API_KEY` | your proxy key — **never commit this** |
| `LLM_MODEL` | `gemini-3.1-pro-preview` / `claude-haiku-4-5` / whatever your proxy serves |
| `DB_PATH` | `/app/storage/stories.db` — **must match the volume mount path** |
| `VIDEOS_DIR` | `/app/storage/videos` — **must match the volume mount path** |

**Do NOT set `PORT`.** Railway injects it automatically; the app reads
`process.env.PORT` and listens on whatever Railway assigns. If you set it
manually, Railway's proxy may route to the wrong port.

### 4. Deploy

Railway redeploys on every push to the selected branch. First boot takes
longer because Nix pulls `yt-dlp` + `ffmpeg` + `python311` into the image.
Subsequent builds hit the Nix cache and are fast.

Watch the deploy log — you should see:

```
🚀 BwebApp server running on http://localhost:$PORT
   API: http://localhost:$PORT/api/status
   Stories: http://localhost:$PORT/api/stories/today
   Cron: Daily at 06:00 AM Hong Kong time

[STARTUP] No stories in database. Fetching 10 stories now...
[PIPELINE] ...
```

That first auto-fetch downloads ~10 Shorts into the volume (a few minutes
on first boot). Subsequent deploys skip it because the volume already has
stories.

## Smoke test after deploy

```
curl https://<your-service>.up.railway.app/api/status
# { "status": "ok", "totalStories": N, ... }

curl -X POST https://<your-service>.up.railway.app/api/stories/fetch \
  -H "Content-Type: application/json" -d '{"count":1}'
# watches a single-story pipeline run end-to-end
```

Then open the base URL in a browser — the React app should load and the
hero video should play.

## Troubleshooting

- **`Claude generation failed: LLM API error 401`** — `LLM_API_KEY` isn't
  set or is wrong. The hand-rolled `.env` loader was removed; Railway's
  variables are read via Node's `--env-file-if-exists=.env` flag in
  `package.json`, but on Railway these come from the service variables
  panel directly (no `.env` file needed).
- **`yt-dlp: not found`** — `nixpacks.toml` isn't being picked up. Check
  Build Logs for "Nix setup phase" and confirm the file is in the repo
  root (not in a subdirectory).
- **Stories vanish on redeploy** — volume isn't mounted or `DB_PATH` /
  `VIDEOS_DIR` don't match the mount path. Verify `/app/storage` exists
  inside the container via Railway's web shell.
- **Cron doesn't fire at 6 AM HKT** — Railway containers sleep on the
  free tier when idle. Upgrade the plan or trigger fetches via the app's
  kebab menu → Refresh instead of relying on cron.
- **`503 system cpu overloaded` from the proxy** — transient from your
  LLM proxy; retry. Not a Railway issue.

## What gets deployed

- Express API + Vite-built SPA (served from `dist/` by the same process)
- `yt-dlp` + `ffmpeg` from Nix
- SQLite DB + downloaded MP4s on the mounted volume
- Daily 6 AM HKT cron for fresh story fetches

## What doesn't

- `.env` (gitignored) — Railway variables replace it
- `.claude/` (local dev tool config) — gitignored
- Dev server (`npm run dev`) — Railway only runs the Express server
