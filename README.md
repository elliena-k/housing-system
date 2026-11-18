# Housing Allocation and Management System

University of Ibadan. A web-based prototype for student housing applications and
room allocation, built with React + TypeScript, Express, and Supabase.

## Status

Phase 0 — repository scaffold and tooling (complete).
Phase 1 — database, authentication, and roles (code complete).
Phase 2 — student profile, application, and status journey (code complete).
Phase 3 — hostel and room inventory (code complete).
Phase 4 — application processing, allocation, and cancellation (code complete).
Phase 5 — hardening and acceptance test plan (code complete; live acceptance pending credentials).
Phase 6 — deployment configuration and documentation (complete; live deployment pending credentials).

Live testing against Supabase is pending project credentials.

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- A Supabase project

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Supabase project, then apply the schema and seed data. With the
   Supabase CLI:

   ```bash
   supabase link --project-ref <project-ref>
   supabase db push
   psql "$DATABASE_URL" -f supabase/seed.sql
   ```

   Alternatively, run `supabase/migrations/20261116090000_initial_schema.sql`
   and then `supabase/seed.sql` in the SQL editor.

3. Create environment files:

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

   Fill in the Supabase project URL, service-role key (API only), and anon key
   (web only). Keep `CORS_ORIGIN` aligned with the Vite origin.

4. Create an administrator: create the user in Supabase Auth, then promote the
   profile.

   ```sql
   insert into profiles (id, role)
   values ('<auth-user-id>', 'admin')
   on conflict (id) do update set role = 'admin';
   ```

5. Start both apps:

   ```bash
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

## Implemented features

- Student registration, sign-in, and role-based redirects
- Student profile view and update
- Housing application with validation and eligibility checks
- Application listing and status view
- Allocation details on the student dashboard
- Administrator hostel and room management with an availability filter
- Application review (approve or reject), room allocation, cancellation, and dashboard statistics
- Rate limiting, request limits, redacted logs, readiness checks, and an error boundary
- Custom accessible dropdowns, toast notifications, required-field indicators, and actionable error messages
- Sidebar navigation, multi-step registration, admin students page, URL-synced filters, and confirmation dialogs
- Row-level security and a lock-safe allocation function in the database

## Scripts

| Command             | Purpose                   |
| ------------------- | ------------------------- |
| `npm run dev`       | Run web and API together  |
| `npm run build`     | Build all workspaces      |
| `npm run typecheck` | Type-check all workspaces |
| `npm run lint`      | Run ESLint                |
| `npm run format`    | Format with Prettier      |
| `npm run test`      | Run tests                 |

## Deployment

The intended free-tier deployment is Render for the API, Vercel for the web app,
and Supabase for the database and authentication.

### API (Render)

`render.yaml` defines the service. Set these environment variables in Render:

- `CORS_ORIGIN` — the deployed web origin (comma-separate multiple origins)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The health check is `GET /api/health`; readiness is `GET /api/ready`.

### Web (Vercel)

Create a Vercel project with `apps/web` as the root directory:

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

`apps/web/vercel.json` rewrites client routes to `index.html`.

### Continuous integration

`.github/workflows/ci.yml` runs lint, type-check, tests, and the production
build on every push to `main` and on pull requests.

See `docs/TEST-PLAN.md` for the acceptance suite.

## Troubleshooting

### Termux / Android: Rollup native module

If Vite fails with `Cannot find module @rollup/rollup-android-arm64`, install the
matching Android binary without changing tracked files:

```bash
npm install --no-save --package-lock=false "@rollup/rollup-android-arm64@$(node -p "require('rollup/package.json').version")"
```

Re-run this if a later `npm install` removes the package.

## Documentation

- [Engineering conventions](CONVENTIONS.md)
- [Decision log](docs/DECISIONS.md)
- [API reference](docs/API.md)

## Scope

The prototype covers student registration and profiles, housing applications and
status checks, and administrator processing of applications, hostels, rooms, and
allocations. Payments, automated allocation, mobile apps, analytics, and
university-system integration are out of scope.
