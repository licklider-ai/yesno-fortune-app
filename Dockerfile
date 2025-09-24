# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# --- ここを追加 ---
ARG VITE_API_ORIGIN
ENV VITE_API_ORIGIN=${VITE_API_ORIGIN}
# -----------------

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN if [ -f pnpm-lock.yaml ]; then corepack enable && corepack prepare pnpm@latest --activate && pnpm i; \
    elif [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    else npm i; fi

COPY . .
RUN npm run build

# Run stage (static preview server via Vite)
FROM node:20-alpine AS run
WORKDIR /app
COPY --from=build /app /app
EXPOSE 5173

# プレビュー実行 (vite preview → 5173番ポートで待ち受け)
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
