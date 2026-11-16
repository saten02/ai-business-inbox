# AI Business Inbox

Phase 1 MVP: React + Vite frontend, Node/Express backend, MongoDB, JWT auth, and OpenRouter-powered AI agent with controlled tools (`getProduct`, `createLead`).

## Features

- JWT login/register with business-scoped data access
- Dashboard, Inbox, Customers (Products/Leads pages are placeholders)
- Conversation messages + AI analysis
- Full AI workflow: message → tool calls → verified product data → lead → reply

## Stack

- Frontend: React, Vite, Axios, React Router
- Backend: Express, Mongoose, bcryptjs, jsonwebtoken, Helmet, rate limiting
- AI: OpenRouter Chat Completions + function tools
- Database: MongoDB

## Local setup

1. Start MongoDB locally (or set an Atlas URI).
2. Backend:

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

3. Frontend:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

4. Seed demo data (from repo root, with `mongosh`):

```bash
mongosh mongodb://127.0.0.1:27017/ai_business_inbox seed.js
```

Optional inbox sample:

```bash
cd backend
node src/seed/seedInbox.js
```

## Environment variables

Backend (never commit real values):

- `PORT` – API port (default `5000`)
- `MONGO_URI` – MongoDB connection string
- `JWT_SECRET` – strong secret for tokens
- `JWT_EXPIRES_IN` – optional, default `7d`
- `CORS_ORIGIN` – comma-separated frontend origins
- `OPENROUTER_API_KEY` – server-side only
- `OPENROUTER_MODEL` – model id (default `openrouter/free`)

Frontend:

- `VITE_API_URL` – backend API base, e.g. `http://localhost:5000/api`

## Demo account

After seeding:

- Email: `owner@abcfurniture.demo`
- Password: `Demo123!`

Change this password for any shared/demo deployment.

## Main AI workflow

1. Login
2. Open Inbox → select conversation
3. Send a customer message such as: `I need 20 office chairs for my new office. Please send me the price.`
4. Click **Analyze with AI** for structured intent extraction
5. Click **Process with AI** for product lookup, lead creation, and reply

## Scripts

Backend:

```bash
npm run dev
npm start
```

Frontend:

```bash
npm run dev
npm run build
npm run preview
```

## Deployment notes

- Host frontend (e.g. Vercel) and backend (e.g. Render) separately
- Set production `MONGO_URI`, unique `JWT_SECRET`, `OPENROUTER_API_KEY`
- Set `CORS_ORIGIN` to the exact frontend URL(s)
- Set frontend `VITE_API_URL` to the deployed backend `/api` URL before build
- Do not commit `.env` files
- Health check: `GET /`

## Known limitations

- Products and Leads UI pages are not API-connected yet
- Dashboard stats are static placeholders
- No Redis/queues, channel webhooks, or multi-tenant SaaS controls yet (Phase 2+)
