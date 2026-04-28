FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8787

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY sql ./sql

EXPOSE 8787

# DATABASE_URL and PORT come from runtime env (Coolify).
# Run `npm run migrate:prod` once after first deploy to apply schema.
CMD ["node", "src/index.js"]
