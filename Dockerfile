# ---- Base image ----
FROM node:18-alpine

# ---- App dir ----
WORKDIR /app

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
CMD ["node", "dist/main.js"]
