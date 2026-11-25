# ACME Salary Management

Web API for HR to manage employee salaries. Backend is Node.js + TypeScript + Express + PostgreSQL (Prisma).

## Prerequisites

- Node.js 20+
- Docker (for local PostgreSQL)

## Setup

```bash
cd backend
cp .env.sample .env
npm install
docker compose up -d
npx prisma migrate dev
npx prisma generate
npm run prisma:seed
npm run dev
```

API runs at `http://localhost:8000`. Frontend: `cd frontend && npm install && npm run dev` → `http://localhost:5173`.

### Demo login (use these credentials)

| Field | Value |
| ----- | ----- |
| Email | `hr@acme.com` |
| Password | `Password123!` |

Seeded HR user name: **ACME HR** (`hr_admin`). After `npm run prisma:seed`, open the app login page and sign in with the email/password above.

Also seeded: **10,000** employees (`EMP00001`…`EMP10000`) with joining salaries. Override count with `SEED_EMPLOYEE_COUNT` if needed. Re-running seed is safe (skips existing codes).

### Useful scripts

| Command              | Description                |
| -------------------- | -------------------------- |
| `npm run dev`        | Start API (nodemon + tsx)  |
| `npm test`           | Run Jest + Supertest (SQLite test DB, not Postgres) |
| `npm run prisma:seed`| Seed HR user + 10,000 employees |
| `docker compose up -d` | Start PostgreSQL         |

### Postman

Import the collection so all routers appear as folders:

1. Open Postman → **Import**
2. Choose [`postman/ACME_Salary_Management.postman_collection.json`](postman/ACME_Salary_Management.postman_collection.json)
3. Folders you’ll see:
   - **Health**
   - **Auth (/api/auth)**
   - **Departments (/api/departments)**
   - **Employees (/api/employees)**
4. Run **Auth → Login** first (saves `{{token}}`)
5. Create/list a department (saves `{{departmentId}}`), then exercise employee APIs

`baseUrl` defaults to `http://localhost:8000` (matches `.env` `PORT`).

## Endpoints

Base URL: `http://localhost:8000`

### Health

| Method | Path      | Auth | Description        |
| ------ | --------- | ---- | ------------------ |
| GET    | `/health` | No   | Server health check |

### Auth (`/api/auth`)

| Method | Path             | Auth | Description              |
| ------ | ---------------- | ---- | ------------------------ |
| POST   | `/register`      | No   | Register HR user         |
| POST   | `/login`         | No   | Login, returns JWT       |
| GET    | `/current-user`  | Bearer token | Current HR profile |

#### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Kavya",
  "email": "kavya@acme.com",
  "password": "Password123!"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "hr@acme.com",
  "password": "Password123!"
}
```

Response includes `token`. Use it as:

```http
Authorization: Bearer <token>
```

#### Current user

```http
GET /api/auth/current-user
Authorization: Bearer <token>
```

### Departments (`/api/departments`)

| Method | Path | Auth |
| ------ | ---- | ---- |
| GET | `/` | Bearer |
| POST | `/` | Bearer |
| GET | `/:id` | Bearer |
| PATCH | `/:id` | Bearer |
| DELETE | `/:id` | Bearer |

### Employees (`/api/employees`)

| Method | Path | Auth |
| ------ | ---- | ---- |
| GET | `/` | Bearer |
| POST | `/` | Bearer |
| GET | `/:id` | Bearer |
| PATCH | `/:id` | Bearer |
| DELETE | `/:id` | Bearer |

## Deploy

### 1) Backend on Render

1. Push this repo to GitHub.
2. In Render → **New → Blueprint** and select the repo (`render.yaml`), **or** create a **Web Service** manually:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start:prod`
   - **Health Check Path:** `/health`
3. Attach a Render Postgres DB (or paste any Postgres `DATABASE_URL`, e.g. Neon).
4. Set env vars:

| Key | Value |
| --- | --- |
| `DATABASE_URL` | From Render Postgres (or external) |
| `JWT_SECRET` | Long random string |
| `JWT_EXPIRY` | `1d` |
| `CLIENT_URL` | Your Netlify URL, e.g. `https://your-app.netlify.app` |
| `SEED_HR_EMAIL` | `hr@acme.com` |
| `SEED_HR_PASSWORD` | `Password123!` |

5. After the first successful deploy, open **Render Shell** and seed:

```bash
npm run prisma:seed
```

6. Confirm `GET https://<your-api>.onrender.com/health` returns healthy.

> Free Render web services sleep when idle; the first request after sleep can take ~30–60s.

### 2) Frontend on Netlify

1. Netlify → **Add new site → Import from Git**.
2. Root `netlify.toml` sets **base = `frontend`** (commit/push this file if it isn’t on GitHub yet).
3. In Site settings → Build, confirm:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Set env var:

| Key | Value |
| --- | --- |
| `VITE_API_URL` | `https://<your-api>.onrender.com` (no trailing slash) |

5. Deploy, then set Render `CLIENT_URL` to the Netlify URL and **redeploy the API** so CORS allows the frontend.
6. Open the Netlify site and log in:

| Field | Value |
| ----- | ----- |
| Email | `hr@acme.com` |
| Password | `Password123!` |

### Local frontend note

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Project docs

- [Requirements](docs/REQUIREMENTS.md)
- [Architecture](docs/ARCHITECTURE.md)
