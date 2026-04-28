FROM node:22-slim

# Install system dependencies for FFmpeg (if needed)
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy the rest of the application
COPY . .

# Build the frontend (Vite)
RUN npm run build

# Expose the port
EXPOSE 8080

# Start the application using tsx to run server.ts
CMD ["npm", "start"]
