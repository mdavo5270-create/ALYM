# ALYM - Athletic League Youth Manager

**Jeu de gestion de football en version web**

> Version 1.0 | Août 2026 | Durée : 16 semaines | Budget : €78,500

## Vision

ALYM permet aux joueurs de créer et gérer une équipe de football, participer à des ligues compétitives, gérer un budget, recruter des joueurs et progresser vers la gloire.

## Caractéristiques principales

- Création et gestion d'équipe personnalisée
- Système de ligues compétitives (round-robin)
- Gestion du budget et des transferts
- Système de succès et récompenses
- Boutique in-game (Or + Stripe)
- Matchs simulés automatiques
- Classement global & notifications hebdomadaires

## Stack technique

| Couche       | Technologies                                      |
|--------------|---------------------------------------------------|
| Frontend     | React 18+, TypeScript, Tailwind CSS, Zustand      |
| Backend      | Node.js / Express, TypeScript, Prisma ORM         |
| Database     | PostgreSQL + Redis (cache/sessions)               |
| Auth         | JWT + OAuth2 (GitHub)                             |
| Paiements    | Stripe                                            |
| Storage      | AWS S3                                            |
| CI/CD        | GitHub Actions                                    |
| Déploiement  | Docker, Render / Heroku                           |

## Branches

- `main` → Production
- `develop` → Staging
- `feature/*` → Développement de fonctionnalités

## Roadmap (16 semaines)

1. **Design** (sem 1-2) – Design system Figma + architecture Excalidraw
2. **Setup** (sem 3) – Infra, DB, Docker, CI/CD
3. **MVP Core** (sem 4-11) – Auth, Teams, Players, Leagues, Match Simulator, Messages, Dashboard
4. **Polish** (sem 12-14) – Stripe, Shop, perf, responsive, a11y
5. **Beta** (sem 15-16) – Closed beta 100 users

## Documentation

Le Cahier des Charges complet se trouve dans le projet (fichier `ALYM_Cahier_Des_Charges.md`).

---

**Statut actuel :** Initialisation du repository – Phase Setup en cours.
