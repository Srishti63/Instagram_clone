# Use official Node image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package files first (better for caching layers)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of  backend code
COPY . .

# Backend port 
EXPOSE 8000

# Start the server
CMD ["npm", "start"]