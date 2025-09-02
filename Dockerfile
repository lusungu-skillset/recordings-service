# Use official Node image
FROM node:20

# Set working directory inside the container
WORKDIR /app

# Copy package files and install dependencies using npm
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

RUN npm run build

EXPOSE 7003

# Command to run the app
CMD ["npm", "run", "start:prod"]