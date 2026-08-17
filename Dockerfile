FROM node:20-alpine
WORKDIR /app

COPY package.json yarn.lock* .yarnrc ./ 
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/

RUN yarn install --frozen-lockfile || yarn install

COPY . .

RUN yarn db:generate && yarn build && yarn db:push

ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_URL=file:./prod.db

EXPOSE 3001
CMD ["yarn", "start"]
