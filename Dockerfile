# Use official Node image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Expose the default port (adjust if needed)
EXPOSE 3000

# Command to run the app
CMD ["npm", "run", "start:prod"]
