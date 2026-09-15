# syntax=docker/dockerfile:1

# Stage 1: Base image with system dependencies
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat

# Stage 2: Development & Dependencies
FROM base AS development
ENV NODE_ENV=development
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
RUN npx prisma generate
COPY tsconfig.json .oxlintrc.json .prettierrc ./
COPY src ./src/
EXPOSE 3001
CMD ["npm", "run", "dev"]

# Stage 3: Builder for production
FROM base AS builder
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
RUN npx prisma generate
COPY tsconfig.json ./
COPY src ./src/
RUN npm run build
RUN npm prune --omit=dev

# Stage 4: Production runtime
FROM base AS production
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
USER node
EXPOSE 3001
CMD ["node", "dist/index.js"]
