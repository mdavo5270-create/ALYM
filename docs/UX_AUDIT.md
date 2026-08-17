# ALYM — UX Harmonization Audit

Date: 2026-08-17  
Scope: Master UX rebuild (not 625 independent routes)

## Architecture analyzed

- Monorepo `apps/web` + `apps/api`
- Zustand store: single source for team, players, match, market, live
- Registry `screens.ts`: 625 screen definitions kept as **map**, not routes
- Navigation model: 6 main spaces + MORE sections + drawers

## Main spaces

| Space | Role |
|-------|------|
| CENTRAL | Cockpit: next match, tasks, board confidence, inbox, world headlines |
| SQUAD | Overview / players / depth / development / contracts + **Player drawer** |
| MATCH | Preview / live / post / tactics — event-like presentation |
| MARKET | Search → offer path, loans, manager jobs |
| LIVE | For you / active / catalog / completed |
| MORE | Board, Finance, Academy, News, Tactics, Manager Market, etc. |

## Components created / reinforced

- `AppShell` — club context, season/week, notifications, search, tab bar
- `PlayerCard` — compact / standard / detailed / transfer (same identity)
- `PlayerDrawer` — shared player object from any entry point
- `SubNav` — contextual secondary navigation
- Design tokens: `--bg`, `--surface`, `--elevated`, `--muted`, sky accent

## Journeys tested (logic)

1. Central → task “Préparer match” → Match Preview → Simulate → Timeline / stats  
2. Central → Courrier → Inbox (mark read)  
3. Squad → Player card → Drawer → Train / Loan / Sell  
4. Market → Listing → Offer (API buy)  
5. Live → Start challenge → Active progress  
6. MORE → Board objectives + tactical vision  
7. Global search → player → Squad + drawer  

## Features preserved

- Auth JWT, team create, match sim, events, board, tactics, market, youth, live challenges, training, loans, legends, manager market IA, budget, messages, shop, achievements

## Improvements

- One shell everywhere (no “pages collection” feel)
- Tasks open the right space (not dead labels)
- Same player object in list + drawer + search
- Secondary nav per hub instead of flat 15 tabs
- 625 registry remains for inventory / ModuleExplorer; runtime UX is composed

## Remaining gaps

- Calendar / league table data not populated server-side
- Full transfer negotiation multi-step UI (offer counter-offer) still simplified
- Scouting reports as dedicated data model
- Staff hiring backend
- Season review cinematic screen
- Virtualization for very large squads (not needed at 14–30 players)

## Regressions to watch

- Old `tab` IDs still mapped via `spaceToTab` for API loads
- ModuleExplorer still available for registry browsing (optional)

## Criterion

Path Central → Squad → Player → Market → Match → News must feel like **one career context**. Implemented via shared Zustand state + single AppShell.
