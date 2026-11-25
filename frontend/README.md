# ACME Salary Management — Frontend

React + Vite + TypeScript HR client.

## Stack

- React Router
- Redux Toolkit
- Axios (`VITE_API_URL`)
- Tailwind CSS
- Recharts (for metrics charts)

## Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App runs at `http://localhost:5173`. Backend should be at `http://localhost:8000`.

## Tests

```bash
npm test
npm run test:watch
```

Vitest + React Testing Library. Add `*.test.ts(x)` next to features as we build them.

## Folder structure

```text
src/
  assets/
  components/
  pages/
  services/     # axios API client
  store/        # Redux store + slices
  test/         # shared test helpers
  types/
  utils/
```
