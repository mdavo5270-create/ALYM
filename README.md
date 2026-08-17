# ALYM — Athletic League Youth Manager

Jeu de gestion de football web — **MVP jouable**

---

## Déploiement en 2 minutes (Render — gratuit)

1. Va sur **https://render.com** → Sign up avec GitHub  
2. **New** → **Blueprint**  
3. Connecte le repo `mdavo5270-create/ALYM`  
4. Branch : `develop`  
5. Apply → attends le build (~3–5 min)  

Tu obtiens une URL du type : `https://alym-xxxx.onrender.com`

> Free tier : le service s’endort après ~15 min d’inactivité (1er chargement un peu long).

### Alternative manuelle Render

**New Web Service** → repo ALYM → :
- Branch : `develop`
- Build : `yarn install && yarn db:generate && yarn build && yarn db:push`
- Start : `yarn start`
- Env :
  - `NODE_ENV=production`
  - `DATABASE_URL=file:./prod.db`
  - `JWT_SECRET=` (chaîne aléatoire longue)

---

## Local (1 terminal)

```powershell
git clone https://github.com/mdavo5270-create/ALYM.git
cd ALYM
git checkout develop
.\start.ps1
```

Ou : `yarn install` → `yarn db:generate` → `yarn db:migrate` → `yarn dev`

- http://localhost:5173

---

## MVP inclus

Auth · Création équipe · 14 joueurs · Match simulé · Messages · Effectif · Budget · Boutique · Succès

Design Figma : https://www.figma.com/design/jLx3yc3OBN1xBBQVIUkiZc
