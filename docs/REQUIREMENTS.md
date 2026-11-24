# ACME Salary Management System — Requirements

## Goal

Replace ACME HR’s spreadsheet-based salary tracking with a web app so an HR Manager can manage ~10,000 employees across countries, maintain versioned salaries, compute net pay from simple country TDS rules, and answer “how do we pay people?” via analytics.

## Target User

**HR Manager** — sole primary persona. Authenticated access only; no employee self-service in this release.

## In Scope

### Authentication
- HR login (email + password); seeded demo user with role `hr_admin`.
- JWT protection on all employee / salary / analytics APIs.

### Employee management
- Create, view, update, and soft-delete employees.
- Fields: employee code, full name, email, job title, department, country, hire date, status (`active` | `inactive`).
- Search by name; filter by country and job title; server-side pagination.
- Seed **10,000** employees across multiple countries (controlled job-title / department catalogs).

### Salary management
- Separate `salaries` table: one employee → many rows over time; exactly one current (`effective_to IS NULL`).
- Each row: amount (> 0), currency (ISO FK), pay period (`monthly` | `annual`), effective range, change type, reason, changed_by.
- Raise / correction: close current row + insert new row in one transaction (DB enforces no overlap + one current).
- History UI = salary timeline (previous amount derived from prior row). No parallel `SALARY_HISTORY` table.

### Salary calculation
| Country         | TDS |
| --------------- | --: |
| India           | 20% |
| United States   | 30% |
| All other       |  0% |

`net = gross − (gross × TDS)` on the **current** salary. Display gross, deduction, and net on employee detail.

### Analytics & dashboard
- Per country + currency (+ pay period): min, max, average, employee count.
- Per job title (optional country filter): average and count.
- SQL aggregates only; never mix currencies or monthly vs annual amounts without explicit conversion.
- Summary cards + charts; filters for country and job title.

## Non-Functional

- Indexes, pagination, and constraints sized for 10k employees.
- Zod validation; bcrypt passwords; auth-gated routes.
- Modular API + clear UI boundaries; deterministic tests for TDS, salary transitions, and analytics.

## Stack

| Layer    | Choice                                    |
| -------- | ----------------------------------------- |
| Frontend | React + Vite + TypeScript + Tailwind CSS  |
| Backend  | Node.js + Express + TypeScript            |
| Database | PostgreSQL + Prisma                       |
| Auth     | JWT + bcrypt                              |
| Validate | Zod                                       |
| Tests    | Vitest/Jest + Supertest (+ RTL as needed) |

## Out of Scope

| Left out | Why |
| -------- | --- |
| Real payroll / bank payouts | Not needed for HR salary ops demo |
| Full country tax engines | Spec only requires three TDS buckets |
| FX conversion / cross-currency rollups | Misleading; we group by currency |
| Multi-role RBAC / approvals | Single HR persona for MVP |
| Salary encryption + read-access audit | Documented as production follow-up |
| Employee self-service | Out of persona |

## Success Criteria

- HR can log in and manage employees end-to-end.
- 10k seeded employees paginate smoothly with current salary joins.
- Salary changes preserve a complete timeline under DB constraints.
- TDS and analytics match the rules above.
- Core logic covered by automated tests.
- App runnable via README; deployed demo + short walkthrough video.
