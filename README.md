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

API runs at `http://localhost:8000`.

### Seeded HR user

| Field    | Value           |
| -------- | --------------- |
| Name     | ACME HR         |
| Email    | `hr@acme.com`   |
| Password | `Password123!`  |

### Useful scripts

| Command              | Description                |
| -------------------- | -------------------------- |
| `npm run dev`        | Start API (nodemon + tsx)  |
| `npm test`           | Run Jest + Supertest (SQLite test DB, not Postgres) |
| `npm run prisma:seed`| Seed HR user               |
| `docker compose up -d` | Start PostgreSQL         |

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

## Project docs

- [Requirements](docs/REQUIREMENTS.md)
- [Architecture](docs/ARCHITECTURE.md)
