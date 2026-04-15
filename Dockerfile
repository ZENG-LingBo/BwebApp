FROM node:22-slim

# Install system dependencies.
#   python3 + pip → yt-dlp
#   ffmpeg        → audio/video merge
#   curl          → required below to fetch deno
#   unzip         → required by the deno installer
#
# We also install `deno`: yt-dlp's YouTube extractor requires a JavaScript
# runtime, and deno is the default it looks for. Without it, extraction
# still *sometimes* works but you get frequent "No supported JavaScript
# runtime could be found" warnings and the bot-detection extractor path
# silently degrades.
RUN apt-get update && apt-get install -y \
    python3 python3-pip ffmpeg curl unzip \
    && pip3 install --break-system-packages yt-dlp \
    && curl -fsSL https://deno.land/install.sh | DENO_INSTALL=/usr/local sh -s -- -y \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install ALL dependencies (need vite for build)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Build frontend
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --omit=dev

# Create data directories
RUN mkdir -p server/data server/videos

EXPOSE 3001

# Match package.json's `server` script: --env-file-if-exists lets the same
# command work in dev (with a .env file) and on Railway (env vars injected
# natively, no .env file). Without the `-if-exists` suffix Node would crash
# on Railway because no .env is present.
CMD ["node", "--env-file-if-exists=.env", "server/index.js"]
