# ALYM — Athletic League Youth Manager

Jeu de gestion de football web.

**Design validé** · Stack : React + TypeScript + Tailwind · Node/Express + Prisma + PostgreSQL

## Structure monorepo

```
ALYM/
├── apps/
│   ├── web/          # Frontend React (Vite + Tailwind)
│   └── api/          # Backend Express + Prisma
├── docker-compose.yml
└── package.json      # workspaces
```

## Démarrage local

```bash
# 1. Infra
docker compose up -d

# 2. Dependencies
npm install

# 3. Env API
cp apps/api/.env.example apps/api/.env

# 4. DB
npm run db:generate
npm run db:migrate

# 5. Dev
npm run dev          # frontend :5173
npm run dev:api      # API :3001
```

## Branches

- `main` → production
- `develop` → staging / dev actif

## Design

Figma : https://www.figma.com/design/jLx3yc3OBN1xBBQVIUkiZc  
Style officiel : noir + or, sidebar, modules dashboard (validé).
