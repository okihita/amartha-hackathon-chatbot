# Use a lightweight Node image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files FIRST (to cache dependencies)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of your code
COPY . .

# Expose port (Cloud Run will set PORT env var)
EXPOSE 8080

# Start the app
CMD ["node", "index.js"]