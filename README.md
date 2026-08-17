# ALYM — Athletic League Youth Manager

Jeu de gestion de football web.

**Design validé** · React + TypeScript + Tailwind · Node/Express + Prisma + **SQLite** (local)

---

## Démarrage rapide (Windows PowerShell)

Comme le projet quantum-portfolio-optimizer : simple, sans Docker.

```powershell
git clone https://github.com/mdavo5270-create/ALYM.git
cd ALYM
git checkout develop
```

**Option A — script automatique :**
```powershell
.\start.ps1
```

**Option B — étape par étape :**
```powershell
npm install
Copy-Item apps\api\.env.example apps\api\.env
npm run db:generate
npm run db:migrate
```

Puis **deux terminaux** :

```powershell
# Terminal 1 — Frontend
npm run dev
```

```powershell
# Terminal 2 — API
npm run dev:api
```

- Front : http://localhost:5173  
- API   : http://localhost:3001/health  

> **Prérequis :** [Node.js 20 LTS](https://nodejs.org/) uniquement. Pas de Docker.

---

## Structure

```
ALYM/
├── apps/
│   ├── web/     # Frontend React (Vite + Tailwind)
│   └── api/     # Backend Express + Prisma (SQLite)
├── start.ps1    # Setup Windows en 1 commande
└── package.json
```

## Design

Figma : https://www.figma.com/design/jLx3yc3OBN1xBBQVIUkiZc  
Style officiel : noir + or (validé).

## Branches

- `main` → production
- `develop` → dev actif
