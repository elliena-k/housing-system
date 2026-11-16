# Decision log

Significant technical and process decisions for the project. Each entry records
the context, the decision, alternatives considered, and consequences. Add an entry
when a decision changes.

## D-001 — Repository layout

- **Context:** The build guide proposes a monorepo; the team uses npm.
- **Decision:** Single repository using npm workspaces with `apps/web`,
  `apps/api`, and `packages/shared`.
- **Alternatives:** Two repositories; pnpm workspaces.
- **Consequences:** Shared types and schemas can be imported directly. Dependency
  installation and CI happen once from the root.

## D-002 — Git workflow

- **Context:** A small student team submitting to a lecturer needs a clear history
  without a heavy review process.
- **Decision:** Short-lived feature branches, rebased on `main`, merged locally
  with `--no-ff`, then pushed. `main` stays deployable.
- **Alternatives:** Pull-request-only workflow; direct commits to `main`.
- **Consequences:** Feature boundaries remain visible in history. Authors must
  keep branches small and merge promptly.

## D-003 — Language and tone

- **Context:** The project is an academic submission in Nigeria.
- **Decision:** British English, formal tone, no emoji in code, UI, commits, or
  documentation.
- **Alternatives:** American English; informal tone.
- **Consequences:** All content is consistent with the report and institutional
  expectations.

## D-004 — Authentication and roles

- **Context:** The report stores passwords in an application table.
- **Decision:** Use Supabase Auth for credentials and sessions; application
  profiles hold only role and status. Administrators are created manually.
- **Alternatives:** Hand-rolled password hashing and sessions.
- **Consequences:** Password handling and JWTs are delegated to a managed service.
  The service-role key must remain server-side.

## D-005 — Allocation integrity

- **Context:** Two administrators could allocate the last bed concurrently.
- **Decision:** Perform allocation inside a Postgres function using row locks,
  exposed only to the service role.
- **Alternatives:** Application-level checks with optimistic retries.
- **Consequences:** Room availability is enforced at the database level. The API
  maps database error codes to HTTP 409 responses.

## D-006 — Application eligibility

- **Context:** The report says administrators check eligibility but does not
  define it.
- **Decision:** A student may apply when the account is active, the profile is
  complete, there is no application for the open session, and there is no active
  allocation.
- **Alternatives:** Leave eligibility to manual administrator review.
- **Consequences:** Rules live in the applications service and can grow without
  changing routes. The report should document this definition.

## D-007 — Configuration without credentials

- **Context:** The team must be able to build and run tests before Supabase
  credentials are available.
- **Decision:** The API creates the service-role client lazily and returns a clear
  configuration error only when a database-backed route is used.
- **Alternatives:** Fail at process startup when credentials are missing.
- **Consequences:** Type checks, unit tests, and the health endpoint work without
  secrets. Runtime features that need the database fail with
  `SUPABASE_NOT_CONFIGURED` until the environment is configured.

## D-008 — Design system

- **Context:** The team wants a consistent visual language and likes the Home
  Owners design system.
- **Decision:** Reuse the Home Owners token structure (palette scales, ink
  neutrals, semantic statuses, radius and type scale, CSS variables) with a new
  royal blue and gold palette.
- **Alternatives:** Keep default Tailwind colours; design a new system from
  scratch.
- **Consequences:** All UI uses shared tokens. Changing the brand colour later
  means editing the palette in `tailwind.config.js` and `src/index.css`, not
  component classes. The system is documented in `docs/DESIGN.md`.
