# Selection Neuro (monorepo)

Monorepo **prod-ready** :  
- `apps/web` → **Next.js** (frontend)  
- `apps/api` → **FastAPI** (backend)  
- `db` → **Postgres** (docker en local, Railway managed en prod)

---

## Structure

```

selection-neuro/
apps/
web/   # Next.js
api/   # FastAPI
infra/
railway/
web.Dockerfile
api.Dockerfile
scripts/
notion_import/
import.py
docker-compose.yml
README.md

````

---

## Développement local

### Prérequis
- Node.js 20+
- Python 3.11+
- Docker + Docker Compose

### 1) Démarrer Postgres
```bash
docker compose up -d db
````

### 2) API (FastAPI)

```bash
cd apps/api

python -m venv .venv
source .venv/bin/activate

pip install -U pip
pip install -r requirements.txt

# Migrations DB
alembic upgrade head

# Run API
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API :

* [http://localhost:8000/health](http://localhost:8000/health)
* [http://localhost:8000/docs](http://localhost:8000/docs)

### 3) WEB (Next.js)

```bash
cd ../../apps/web
npm i
npm run dev
```

WEB :

* [http://localhost:3000](http://localhost:3000)

---

## Variables d’environnement

### API : `apps/api/.env`

```env
ENV=dev
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/selection_neuro
CORS_ORIGINS=http://localhost:3000
```

### WEB : `apps/web/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Migrations (Alembic)

Générer une migration auto :

```bash
cd apps/api
alembic revision --autogenerate -m "change"
```

Appliquer :

```bash
alembic upgrade head
```

Rollback :

```bash
alembic downgrade -1
```

---

## Déploiement Railway

### Concept Railway

Dans **un seul Railway Project**, tu ajoutes 3 services :

1. `db` : Postgres (managed)
2. `api` : FastAPI (Docker)
3. `web` : Next.js (Docker)

Les services d’un même project peuvent communiquer, et tu relies les URLs via des variables d’environnement.

---

### Étapes

1. **Créer un Railway Project**
2. **Add Service → Database → Postgres**
3. **Add Service → Deploy from GitHub** (API)

   * Dockerfile : `infra/railway/api.Dockerfile`
4. **Add Service → Deploy from GitHub** (WEB)

   * Dockerfile : `infra/railway/web.Dockerfile`

---

### Variables Railway

#### API (service `api`)

* `DATABASE_URL` : fourni par Railway Postgres
  ⚠️ si Railway donne `postgres://...`, remplace par `postgresql+psycopg://...`
* `CORS_ORIGINS` : `https://<ton-web>.up.railway.app` (et/ou ton domaine)
* `ENV` : `prod`

#### WEB (service `web`)

* `NEXT_PUBLIC_API_URL` : `https://<ton-api>.up.railway.app`

---

### Domaines

* Branche ton domaine sur `web` (ex: `selectionneuro.com`)
* Optionnel : un sous-domaine pour l’API (ex: `api.selectionneuro.com`)

---

## Import Notion (placeholder)

Script (à compléter) :

```bash
python scripts/notion_import/import.py --path /chemin/export-notion
```
