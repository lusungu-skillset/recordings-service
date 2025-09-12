# ---- Base image ----
FROM node:18-alpine

# ---- App dir ----
WORKDIR /app

# Install build tools and crypto dependencies
RUN apk add --no-cache bash git openssl

# ---- Install deps ----
COPY package*.json ./
RUN npm install --legacy-peer-deps

# ---- Copy source ----
COPY . .

# ---- Build ----
RUN npm run build

# ---- Expose port ----
EXPOSE 3002

# ---- Start ----
CMD ["node", "dist/main"]
