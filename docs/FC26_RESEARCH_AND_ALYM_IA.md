# ALYM — Recherche FC 26 Manager Career + Architecture IA

**Sources prioritaires :** EA Pitch Notes Career Deep Dive (1 août 2025), page features Career Mode EA FR, transcriptions deep dive officielles.  
**Sources complémentaires :** Destructoid, AltChar, Dexerto, Games.gg (détails UI / process job).  
**Règle :** conventions UX uniquement — aucun asset, logo, copy ou layout pixel-perfect EA.

---

## 1. Synthèse fonctionnelle FC 26 (officiel)

### Manager Live
- Hub central : Full Career + Live Start Points + Challenges rotatifs (hebdo / mensuel).
- Tabs permanents : For You, Continue, Featured, Social, Popular, Favourites, Completed.
- Tabs dynamiques (ligues, UCL, events saisonniers).
- Paramètres de challenge : start date, pool clubs, CYC, cups, feature toggles (training, scouting, transfers, youth, manager market, sim modes), limiters (âge, nation, vision tactique, embargo, points deduction…).
- Onboarding manager : identité, style, jusqu’à 5 clubs favoris pour personnalisation.
- Récompenses : kits, progression Season Pass → ICONs / Heroes pour carrières suivantes.

### Manager Market
- Managers IA : sack / poached / voluntary leave.
- Caretaker temporaire ; peut devenir titulaire.
- Shortlist clubs basée sur : qualité club, job security, tenure, nation, **Tactical Vision fit**.
- Joueur : candidatures, Suggestions, shortlist jobs, notifs, agent post-sack.
- Effet gameplay : nouveau coach → change vision tactique → impact recrutement IA.

### Deeper Simulation & Scouting data-driven
- Jusqu’à 5 ligues additionnelles simulées.
- Stats saison précédente (buteurs, passes, clean sheets, cartons, notes).
- Standings unifié (tables + team stats + fixtures).
- Scout report → accès stats complètes joueur ligue simulée.

### Unexpected Events
- Couche narrative dynamique (blessures, offres, crise club, etc.).
- Décision manager → conséquences carrière.

### Authentic Gameplay
- Hors scope web ALYM (pas de match 3D) — on garde **simulation textuelle / stats** + Match Center immersif UI.

---

## 2. Conventions UX observées (à réinterpréter, pas copier)

| Pattern FC 26 | Lecture UX | Traduction ALYM |
|---------------|------------|-----------------|
| Hub à onglets (Live) | Contenu rotatif + continue + featured | Hub Live avec cartes défi + actif + catalogue |
| Central cockpit | Prochain match hero + tâches + confiance | Bureau : hero match, board %, courrier, raccourcis |
| Cartes modulaires sombres | Densité haute, labels muted, grands chiffres | Panel ink + brass accent, data-num mono |
| Tableaux effectif | Tri / filtre / ligne sélectionnable → profil | Squad table + panneau détail |
| Manager Market liste ligue | Colonnes club / coach / sécu / vision | Table clubs + fil events + free agents |
| Challenge detail | Paramètres visibles avant launch | Fiche défi : règles, limites, rewards |
| Events | Modal décision à choix | Modal existant — enrichir conséquences |
| Standings | Navigation multi-compétitions | World Football + League Table (à bâtir) |

**Hiérarchie typique :**
1. Contexte (club / saison / date)
2. Action primaire (jouer, négocier, décider)
3. Métriques (confiance, budget, forme)
4. Flux secondaire (news, inbox, activity)

**Densité :** élevée mais scannable — sections titrées, pas de mur de texte, badges d’état.

---

## 3. Audit ALYM (état actuel)

### Stack
- Monorepo Yarn : `apps/web` (React/Vite/Tailwind/Zustand) + `apps/api` (Express/Prisma/Postgres)
- Deploy Render branche `develop`
- Auth JWT, simulation match, career systems en place

### Front (post-refonte)
| Zone | Fichiers | État |
|------|----------|------|
| Design tokens | tailwind + index.css | ink / brass / mist — OK base |
| Logo abstrait | Logo.tsx | Sans illustration sectorielle — OK |
| UI kit | ui.tsx | Panel, StatCard, Badge, Button, Modal… |
| Shell | AppShell.tsx | Nav groupée + mobile drawer |
| Store | gameStore.ts | Toute la logique UI/API |
| Pages | Entry + Dashboard monolithique par tabs | ~15 états jouables |

### Backend couvert
Auth · Teams · Players · Match + events · Board/tactics · Mercato · Youth · Live challenges · Training/loans · Legends · Manager Market IA · Budget · Shop · Messages · Achievements

### Gaps vs architecture cible (~50 écrans / 15 maîtres)

| Maître cible | ALYM aujourd’hui | Priorité |
|--------------|------------------|----------|
| Central / Bureau | Partiel (hero + stats + courrier) | P0 enrichir |
| Manager Live Hub | Liste défis basique | P0 hub tabs |
| Career Setup | Création club minimale | P1 |
| Squad | Table + détail léger | P0 profil riche |
| Player Profile | Panneau latéral | P0 page dédiée |
| Tactics | Presets vision + terrain concept | P1 pitch XI |
| Match Center | Score final + event modal | P0 preview + post-match |
| Transfer Hub | Listings achat/vente | P1 shortlist / négo |
| Scouting | Scout youth unique | P1 network + reports |
| Academy | Scout + promote | P1 |
| Manager Market | Clubs + events + free agents | P0 jobs joueur |
| Calendar | Absent | P1 |
| Board | Objectifs + sécu | P0 |
| Finance | Transactions | P1 forecast |
| News / Inbox | Messages | P0 catégories |
| World Football | Absent | P2 |
| Season Review | Absent | P2 |

---

## 4. Architecture de navigation ALYM (cible)

```
ALYM
├── HOME          Central · News · Inbox · Notifications
├── CAREER        Manager Live · Challenges · Setup · Season
├── TEAM          Squad · Player · Tactics · Sheets · Development
├── MATCH         Preview · Center · Live Stats · Post Match
├── TRANSFERS     Hub · Search · Shortlist · Negotiations · History
├── SCOUTING      Network · Assignments · Reports · Analytics
├── ACADEMY       Youth Squad · Scouts · Development · Promotion
├── CLUB          Overview · Board · Finances · Staff · Facilities · History
├── WORLD         Manager Market · Transfers · Competitions · News · World Football
└── SEASON        Calendar · Objectives · Statistics · Awards · Review
```

**15 écrans maîtres (qualité AAA d’abord) :**
1. Central  2. Squad  3. Player  4. Tactics  5. Match Center  
6. Transfer Hub  7. Negotiation  8. Scout Report  9. Academy  
10. Calendar  11. Manager Market  12. Board  13. Finance  
14. News/Inbox  15. Season Review  

Les ~35 autres états dérivent de ces composants (overlays, filtres, tabs internes).

---

## 5. Design System ALYM (fondations)

### Principes
- Football Management + plateforme sportive premium — **pas** template SaaS.
- Sombre, lisible, dense mais ordonné.
- Logo abstrait (plans + structure) — jamais ballon / terrain illustratif.
- Micro-mouvement discret (enter 350ms) — pas de shine / glow « IA ».
- Identité LA MYLA discrète en chrome, pas en watermark permanent.

### Tokens
| Token | Valeur | Usage |
|-------|--------|-------|
| ink-950/900/800/700/600 | #0B0D10 → #2A3140 | fonds / surfaces / bordures |
| mist-50→500 | crème → muted | texte |
| brass-300→600 | or mat | accent, CTA, data clé |
| signal good/warn/bad | vert / ambre / rouge | états |
| font sans | DM Sans | UI |
| font mono | JetBrains Mono | notes, budgets, minutes |
| radius panel | 12px | cartes |
| shadow panel / lift | subtil | profondeur |

### Composants (existants + à étendre)
Existants : Panel, PageHeader, StatCard, Badge, ProgressBar, Button, Input, Select, Modal, Rating, PosBadge, EmptyState, AppShell, AlymLogo.

À ajouter pour les 15 maîtres :
- MatchHero, TaskList, NewsCard, InboxRow  
- PlayerHeader, AttributeBars, FormSpark  
- PitchBoard, FormationSlot  
- TransferRow, NegotiationPanel  
- ScoutReportCard  
- CalendarGrid  
- LeagueTable  
- WorldRail (fil monde)

### Navigation
- Desktop : sidebar groupée (HOME / TEAM / MATCH / …)
- Mobile : drawer + barre contextuelle actions primaires
- Max 2 clics vers action critique (match, inbox décision)

---

## 6. Mapping écrans prioritaires (fiches)

### CENTRAL
- **FC26 ref :** Career Central / Hub home  
- **ALYM :** Bureau  
- **Layout :** hero prochain match (2 cols) + confiance conseil + grille stats + courrier + raccourcis  
- **Primary :** Jouer / préparer match  
- **Secondary :** ouvrir inbox, board, mercato  
- **Data :** W-D-L, budget, job %, messages non lus, last result  
- **Amélioration ALYM :** tâches manager (tasks), forme récente 5 matchs, snapshot classement (quand ligue existe)

### MANAGER LIVE
- **FC26 ref :** Manager Live Hub  
- **ALYM :** onglet Défis → évoluer en hub  
- **Layout :** tabs [Actif | Catalogue | Terminés] ; carte défi avec paramètres  
- **Primary :** Lancer / continuer défi  
- **Data :** objectifs, matches limit, rewards, restrictions  
- **Amélioration :** afficher limiters (vision lock, youth only…) venant de l’API

### SQUAD + PLAYER
- **FC26 ref :** Squad Hub + Player Profile  
- **ALYM :** Effectif + panneau → page Player  
- **Layout table :** Pos, Nom, OVR, Pot, Age*, Forme*, Moral*, Salaire, Contrat*  
- **Player :** header OVR/pot, attribute groups, contrat, actions (vendre, prêter, entraîner)  
- **\* :** champs à enrichir côté API si absents

### MATCH CENTER
- **FC26 ref :** Preview → Live → Post  
- **ALYM :** Match (score) + event modal  
- **Cible :** Preview (XI, enjeu) → Sim → Post (score, prime, ratings simplifiés) → Event  
- **Primary :** Simuler  
- **Pas de** Authentic 3D

### MANAGER MARKET
- **FC26 ref :** league grid + job security + vision  
- **ALYM :** déjà clubs / free agents / events + score v2  
- **Cible :** + Suggestions jobs pour le joueur, shortlist, candidature (API)

### BOARD / FINANCE / INBOX
- Déjà partiels — enrichir catégories messages, forecast finance simple, meeting board (event type)

---

## 7. Roadmap d’exécution (réaliste)

| Phase | Livrable | Backend |
|-------|----------|---------|
| DS-1 | Tokens + composants manquants documentés | Non |
| IA-1 | Restructurer nav AppShell selon arborescence ALYM | Non |
| P0-Central | Bureau cockpit (tasks, forme, hero) | Léger |
| P0-Live | Hub défis type Live | Extend challenges JSON |
| P0-Player | Page profil joueur | Extend player fields si besoin |
| P0-Match | Preview + post-match | Timeline optionnelle |
| P0-MM | Jobs joueur + shortlist | Nouvelles routes |
| P1 | Calendar, Transfer shortlist, Scout reports, Academy hub | Oui |
| P2 | World Football, Season Review, Staff, Facilities | Oui |

**Ne pas** implémenter 203 écrans d’un coup.  
**Oui** : 15 maîtres + états dérivés + API stable.

---

## 8. Conformité IP
- Aucun logo EA Sports / FC  
- Aucun screenshot embarqué comme asset  
- Aucune reproduction pixel-perfect  
- Vocabulaire ALYM propre (Bureau, Courrier, Conseil, Marché coaches, Défis Live…)

---

*Document généré pour pilotage produit ALYM / LA MYLA — Août 2026*
