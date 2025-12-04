# Gems Inkoop — Deploy guide

This repository is ready to deploy. Follow one of these flows:

## Deploy to Vercel (recommended for frontend + serverless backend)
1. Create a Vercel account.
2. Import the GitHub repo (push this project to a new repo first).
3. Vercel will automatically detect the frontend build and the backend serverless function.
4. Add any environment variables (STRIPE_KEY, SHIPPO_KEY, etc.) in Vercel dashboard.

## Deploy to Render (recommended for full Node backend)
1. Create a Render account.
2. Create a new Web Service for the backend — point to the `backend` folder.
3. Create a Static Site for the frontend — point to `frontend/dist` and set the build command.
4. Add environment variables.

## Deploy via Docker (custom VPS)
1. Build Docker image from backend/Dockerfile and run on any host.
2. Serve frontend static files via nginx or host via Vercel/Netlify.

## Production checklist
- Replace mock shipping with Shippo/EasyPost or carrier APIs.
- Replace mock orders with a real DB (Postgres) and authentication.
- Integrate Stripe for payments and webhooks.
- Add invoice & CN23 PDF generator and store HS-codes/values per order.
- Make GDPR-compliant data retention & cookie policies.


ENVIRONMENT VARIABLES (example)
- STRIPE_SECRET_KEY=sk_live_...
- SHIPPO_TOKEN=...
- DATABASE_URL=postgres://user:pass@host:5432/db

Local development / Docker
- Create a `.env` file in the project root (or export env vars) using the `.env.example` as reference.
- For local Docker compose, create `.env` and then run:

```bash
# Example: create .env from the example
cp .env.example .env
# Edit .env to fill secrets (do NOT commit .env)
# Build frontend with API base baked in (if using separate backend URL):
VITE_API_BASE=http://localhost:3000 cd frontend && yarn build
# Start services via docker-compose
docker-compose up --build -d
```

Deploy providers
- Render: during import, choose "Use render.yaml". Then add environment variables in the Render dashboard for each service (backend and static site). Set `VITE_API_BASE` for the static site build if your backend is on a different domain.
- Vercel: add the variables under Project Settings → Environment. For Vite, use `VITE_API_BASE` for frontend builds and `PORT`, `DATABASE_URL`, etc. for serverless/backend.

Security
- Never commit secrets. Use the provider's environment settings (Render/Vercel) or a secrets manager. `.env` should be listed in `.gitignore`.
# Gems-Inkoop
Gems inkoop webshop project 
