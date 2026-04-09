# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy only package files first (better caching)
COPY ./Frontend/package*.json ./
RUN npm install

# Copy rest of frontend code
COPY ./Frontend .
RUN npm run build

# Stage 2: Backend
FROM node:20-alpine AS backend

WORKDIR /app

# Set environment
ENV NODE_ENV=production

# Copy package files first
COPY ./Backend/package*.json ./
RUN npm install --omit=dev

# Copy backend code
COPY ./Backend .

# Copy frontend build into backend public folder
COPY --from=frontend-builder /app/dist ./public

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "server.js"]