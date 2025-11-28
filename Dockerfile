# Use a lightweight Node image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files FIRST (to cache dependencies)
COPY package*.json ./

# Install dependencies with optimizations
RUN npm ci --omit=dev --no-audit --no-fund --prefer-offline

# Copy only necessary files (exclude dev files)
COPY index.js ./
COPY src/ ./src/
COPY public/ ./public/

# Expose port (Cloud Run will set PORT env var)
EXPOSE 8080

# Run as non-root user for security
USER node

# Start the app
CMD ["node", "index.js"]