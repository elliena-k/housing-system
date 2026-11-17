# Housing Allocation and Management System

University of Ibadan. A web-based prototype for student housing applications and
room allocation, built with React + TypeScript, Express, and Supabase.

## Status

Phase 0 — repository scaffold and tooling (complete).
Phase 1 — database, authentication, and roles (code complete).
Phase 2 — student profile, application, and status journey (code complete).
Phase 3 — hostel and room inventory (code complete).

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

## Documentation

- [Engineering conventions](CONVENTIONS.md)
- [Decision log](docs/DECISIONS.md)
- [API reference](docs/API.md)

## Scope

The prototype covers student registration and profiles, housing applications and
status checks, and administrator processing of applications, hostels, rooms, and
allocations. Payments, automated allocation, mobile apps, analytics, and
university-system integration are out of scope.
