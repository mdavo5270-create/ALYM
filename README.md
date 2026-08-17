# ALYM — Athletic League Youth Manager

Jeu de gestion de football web — **MVP jouable**

React + TypeScript + Tailwind · Node/Express + Prisma + SQLite · Yarn

---

## Démarrage (Windows — 1 terminal)

```powershell
git clone https://github.com/mdavo5270-create/ALYM.git
cd ALYM
git checkout develop
.\start.ps1
```

Ou :

```powershell
yarn install
Copy-Item apps\api\.env.example apps\api\.env
yarn db:generate
yarn db:migrate
yarn dev
```

- Front : http://localhost:5173  
- API   : http://localhost:3001/health  

---

## Fonctionnalités MVP

| Module | Status |
|--------|--------|
| Auth (register / login JWT) | ✅ |
| Création d'équipe | ✅ |
| 14 joueurs générés | ✅ |
| Dashboard | ✅ |
| Messages | ✅ |
| Effectif | ✅ |
| Simulation de match | ✅ |
| Budget + transactions | ✅ |
| Boutique (Or) | ✅ |
| Succès / achievements | ✅ |

## Flow joueur

1. Nouveau Jeu → compte  
2. Créer équipe → effectif + messages  
3. **Match** → simuler → score + prime + succès  
4. Messages / Budget / Boutique / Succès  

## Design

Figma : https://www.figma.com/design/jLx3yc3OBN1xBBQVIUkiZc  
Style : noir + or (validé)
