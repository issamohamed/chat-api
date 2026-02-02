# ============================================
# Dockerfile: Chat API
# Builds a production-ready Node.js container.
# ============================================

# Start from the official Node.js 20 image (Alpine variant = smaller image).
# Alpine Linux is ~5MB vs ~900MB for the full Debian image.
FROM node:20-alpine

# Set the working directory inside the container.
# All subsequent commands run relative to /app.
WORKDIR /app

# Copy dependency files FIRST.
# Docker caches each step ("layer"), so if package.json hasn't changed,
# Docker skips npm install on the next build. This makes rebuilds fast.
COPY package.json package-lock.json ./

# Install production dependencies only (skip devDependencies).
# npm ci ("clean install") is stricter than npm install —
# it requires a lockfile and does a fresh install every time.
RUN npm ci --only=production

# NOW copy the application source code.
# This layer is rebuilt whenever your code changes, but the
# npm ci layer above stays cached (fast rebuilds).
COPY src/ ./src/

# Document which port this container uses (informational only —
# doesn't actually open the port, just tells readers and tools).
EXPOSE 3000

# The command that runs when the container starts.
# This is the same as "npm start" but without the npm overhead.
CMD ["node", "src/index.js"]