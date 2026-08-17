# ALYM — Checklist sécurité

| Contrôle | Statut | Notes |
|----------|--------|-------|
| Secrets dans `.env` | ✅ | `.env` dans `.gitignore` |
| Rate limit login/register | ✅ | 10 req/min sur `/api/auth` |
| Mots de passe hachés | ✅ | bcrypt cost 12, jamais renvoyés |
| Droits côté serveur | ✅ | `requireAuth` + `requireTeamOwner` |
| Pas de clé secrète client | ✅ | Seulement JWT utilisateur en localStorage |
| HTTPS | ✅ | Render termine TLS ; HSTS en prod |
| Sessions qui expirent | ✅ | JWT `24h` prod / `7d` dev |
| Validation avant DB | ✅ | Zod sur auth + schémas métier |
| Upload fichiers | ✅ | `multipart` refusé (pas d’upload MVP) |
| CORS configuré | ✅ | `CORS_ORIGIN` en prod |
| Erreurs prod non verbeuses | ✅ | `productionErrorHandler` |
| console.log limité | ✅ | `logInfo` silencieux en prod |
| Message login unique | ✅ | « Email ou mot de passe incorrect » |
| Webhooks signés | ✅ | `verifyWebhookSignature` prêt |
| Dépendances | ⚠️ | Lancer `npm audit` régulièrement |
| Confirmation email | ⚠️ | Flag `EMAIL_VERIFY=1` (provider à brancher) |
| Backup DB auto | ⚠️ | Script + cron Render/Supabase recommandé |
| RLS Postgres | ⚠️ | Ownership applicatif Prisma ; RLS SQL optionnel |

## À faire côté infra

1. **Backup** : activer les backups automatiques Render Postgres / Supabase (quotidien).
2. **Email** : brancher Resend/Brevo + `EMAIL_VERIFY=1` pour confirmation inscription.
3. **RLS** (optionnel) : policies SQL `team.user_id = auth.uid()` si passage Supabase Auth.
4. **Secrets exposés dans le chat** : **révoquer/regénérer** tous les tokens collés historiquement.

## Commandes

```bash
# Audit deps
yarn npm audit

# Backup manuel Postgres (exemple)
pg_dump "$DATABASE_URL" -Fc -f "alym-$(date +%Y%m%d).dump"
```
