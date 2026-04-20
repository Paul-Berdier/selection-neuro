# Variables d'environnement Railway

## 🚨 Correction Mixed Content

Le front ne fait plus d'appels directs au backend.
Il passe par un proxy Next.js `/api/*` → backend interne.

### Variables à configurer dans Railway (service Frontend)

| Variable | Valeur | Visibilité |
|---|---|---|
| `API_URL` | `http://selection-neuro.railway.internal:8080` | **Server-side uniquement** (pas de NEXT_PUBLIC) |
| `NODE_ENV` | `production` | — |

### ⛔ NE PAS mettre
- `NEXT_PUBLIC_API_URL` — ce n'est plus utilisé et causerait Mixed Content
- L'URL interne Railway dans une variable `NEXT_PUBLIC_*`

### Fonctionnement

```
Browser (HTTPS) → /api/products → Next.js server → http://...internal:8080/products
```

Le browser ne voit que des appels HTTPS vers le même domaine. Zéro mixed content.

### Test Railway en local

```bash
API_URL=https://ton-backend.up.railway.app npm run dev
```
