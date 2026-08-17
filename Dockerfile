FROM node:20-bookworm-slim
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
RUN npm install --omit=dev --no-audit --no-fund
COPY apps/api/prisma ./apps/api/prisma
COPY apps/api/dist ./apps/api/dist
COPY apps/web/dist ./apps/web/dist
COPY apps/api/package.json ./apps/api/package.json
ENV NODE_ENV=production
ENV PORT=3001
RUN npx --yes prisma@5.22.0 generate --schema=apps/api/prisma/schema.prisma
EXPOSE 3001
CMD ["sh", "-c", "npx --yes prisma@5.22.0 db push --schema=apps/api/prisma/schema.prisma --accept-data-loss && node apps/api/dist/index.js"]
