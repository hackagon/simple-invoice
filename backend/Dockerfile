# ----- Build stage -----
FROM node:22-alpine AS builder
RUN corepack enable
WORKDIR /app

# pnpm version is pinned via the "packageManager" field in package.json.
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN pnpm run build

# ----- Runtime stage -----
FROM node:22-alpine AS runtime
RUN corepack enable
WORKDIR /app
ENV NODE_ENV=production

# Install production dependencies only (clean, no dev deps).
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]

# ----- Dev stage (hot reload via Nest watch) -----
FROM node:22-alpine AS dev
RUN corepack enable
WORKDIR /app
ENV NODE_ENV=development
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
EXPOSE 3000
CMD ["pnpm", "start:dev"]
