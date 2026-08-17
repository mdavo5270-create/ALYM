# ALYM UX Audit — Full redesign status

Date: 2026-08-17  
Live commit: pending deploy after this commit  
Reference: FM26 architecture + FC26 presentation + files.zip design system

## Direction

- Desktop-first top navigation (Portal · Squad · Match · Recruitment · Tactics · Club · Career)
- Portal (not SaaS dashboard)
- Tables / rows over card grids
- Master/detail for Market, Scouting
- Design tokens: graphite #14171C, chalk #F1F0EC, flare #FF4D23, signal #22D3C9
- Fonts: Chakra Petch / Hanken Grotesk / IBM Plex Mono

## Screens completed

| Screen | Status |
|--------|--------|
| Title / Auth / CreateTeam (FC club select) | Done |
| AppShell top nav + context + bookmarks + search | Done |
| Portal (tasks, fixtures, squad status, inbox) | Done |
| Squad (dense rows) | Done |
| Player drawer (profile + attr bars) | Done |
| Match Center + broadcast indicator | Done |
| Tactics pitch + formations + vision | Done |
| Transfer Market master/detail | Done |
| Negotiations panel | Done |
| Scouting master/detail | Done |
| Academy | Done |
| Board / Finance / Club | Done |
| Newsroom | Done |
| Training / Legends / Shop / Achievements | Done |
| Calendar / Staff / Competitions | Done |
| Analytics / Settings | Done |
| Manager Live | Present (existing hero pattern) |

## KEEP

- Backend API, Prisma, simulation, Chronicle, auth, Zustand store

## Anti-AI checklist

- Unique flare accent (not generic purple/gold SaaS)
- No identical 12-card grids as primary language
- Rows for squad/market/scouting
- Reduced motion respected

## Remaining polish (non-blocking)

- LiveHub catalog still uses ArenaPanel hero (acceptable)
- Bookmark customization UI beyond reset
- Full broadcast multi-panel match live (formation+bench+events)

## Quality gate

- Build: pass
- Deploy: Render develop auto
- Tokens + fonts verified in production HTML/CSS
