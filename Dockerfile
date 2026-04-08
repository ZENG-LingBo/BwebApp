FROM node:22-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 python3-pip ffmpeg curl \
    && pip3 install --break-system-packages yt-dlp \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Node dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Build frontend
RUN npm run build

# Create data directories
RUN mkdir -p server/data server/videos

EXPOSE 3001

CMD ["node", "server/index.js"]
