# Housing Allocation and Management System

University of Ibadan. A web-based prototype for student housing applications and
room allocation, built with React + TypeScript, Express, and Supabase.

## Status

Phase 0 — repository scaffold and tooling.

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- A Supabase project (for Phase 1 onwards)

## Quick start

```bash
npm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
npm run dev
```

- Web: http://localhost:5173
- API: http://localhost:4000/api/health

## Workspaces

| Workspace         | Path              | Purpose                                |
| ----------------- | ----------------- | -------------------------------------- |
| `@housing/web`    | `apps/web`        | React + TypeScript + Tailwind frontend |
| `@housing/api`    | `apps/api`        | Express + TypeScript API               |
| `@housing/shared` | `packages/shared` | Shared types and zod schemas           |

Database migrations live in `supabase/migrations`.

## Scripts

| Command             | Purpose                   |
| ------------------- | ------------------------- |
| `npm run dev`       | Run web and API together  |
| `npm run build`     | Build all workspaces      |
| `npm run typecheck` | Type-check all workspaces |
| `npm run lint`      | Run ESLint                |
| `npm run format`    | Format with Prettier      |
| `npm run test`      | Run tests                 |

## Documentation

- [Engineering conventions](CONVENTIONS.md)
- [Decision log](docs/DECISIONS.md)
- [API reference](docs/API.md)

## Scope

The prototype covers student registration and profiles, housing applications and
status checks, and administrator processing of applications, hostels, rooms, and
allocations. Payments, automated allocation, mobile apps, analytics, and
university-system integration are out of scope.
