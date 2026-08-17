# ALYM — Athletic League Youth Manager

Jeu de gestion de football web.

React + TypeScript + Tailwind · Node/Express + Prisma + SQLite

---

## Démarrage (Windows — 1 seul terminal)

```powershell
git clone https://github.com/mdavo5270-create/ALYM.git
cd ALYM
git checkout develop
.\start.ps1
```

Ça installe tout, prépare la DB, et lance **front + API ensemble**.

- Front : http://localhost:5173  
- API   : http://localhost:3001/health  

### Manuellement

```powershell
yarn install
Copy-Item apps\api\.env.example apps\api\.env
yarn db:generate
yarn db:migrate
yarn dev
```

> Prérequis : [Node.js 20 LTS](https://nodejs.org/) + Yarn (`npm install -g yarn`)

---

## Structure

```
ALYM/
├── apps/web/    Frontend
├── apps/api/    Backend
├── start.ps1    Setup + lancement (1 commande)
└── package.json
```

## Design

Figma : https://www.figma.com/design/jLx3yc3OBN1xBBQVIUkiZc  
Style : noir + or (validé).
