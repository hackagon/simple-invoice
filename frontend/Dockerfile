# ----- Build stage -----
FROM node:22-alpine AS builder
RUN corepack enable
WORKDIR /app

# API base URL is baked in at build time (Vite). The browser runs on the host,
# so it reaches the backend at the host-published port (default localhost:3000).
ARG VITE_API_BASE_URL=http://localhost:3000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# pnpm version is pinned via the "packageManager" field in package.json.
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# ----- Runtime stage (static files via nginx) -----
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
