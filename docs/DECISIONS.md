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

## D-009 — Available-room filtering

- **Context:** An available room has `occupancy < capacity`, which cannot be
  expressed as a simple PostgREST column-to-column filter.
- **Decision:** Fetch the candidate rooms and filter them in the rooms service.
- **Alternatives:** Add a database view or an RPC function for availability.
- **Consequences:** The logic is simple and correct. For a larger dataset, move
  the comparison into a view or function so filtering happens in the database.

## D-010 — Admin application search

- **Context:** Searching applications by student name or matriculation number
  spans two tables.
- **Decision:** Resolve matching student IDs first, then filter applications by
  those IDs.
- **Alternatives:** PostgREST embedded-resource filters.
- **Consequences:** The query is explicit and easy to reason about. It costs one
  extra round trip and is capped at 200 matching students per search.

## D-011 — Allocation through a database function

- **Context:** Allocation must be atomic and safe under concurrent requests.
- **Decision:** Call the `allocate_room` Postgres function through Supabase RPC
  and map its error codes to HTTP responses.
- **Alternatives:** Application-level checks with retries.
- **Consequences:** The database enforces availability, gender, and single-active-
  allocation rules. API errors are stable and readable for the frontend.

## D-012 — Hardening baseline

- **Context:** The prototype handles student data and will be deployed publicly.
- **Decision:** Trust the deployment proxy, rate-limit registration, cap request
  bodies at 100 kB, redact authorization headers from logs, return structured
  errors for malformed JSON and oversized bodies, add an error boundary, and
  expose a readiness endpoint.
- **Alternatives:** Rely on platform defaults only.
- **Consequences:** Common abuse and failure modes produce predictable responses.
  Readiness supports deploy health checks without exposing internals.

## D-013 — Deployment targets

- **Context:** The team needs a free-tier deployment for the demo.
- **Decision:** Render (API), Vercel (web), Supabase (database and auth), with
  GitHub Actions running lint, type-check, tests, and build.
- **Alternatives:** A single container on one host.
- **Consequences:** Each layer is configured independently through environment
  variables. `CORS_ORIGIN` and `VITE_API_URL` must match the deployed origins.

## D-014 — Forms, dropdowns and feedback

- **Context:** Native selects cannot be styled consistently and form feedback was
  spread across ad-hoc messages.
- **Decision:** Use a custom accessible combobox built over a hidden native
  select, mark required and optional fields explicitly, show errors with a
  clear next step, use toasts for successful actions, and require every async
  button and page load to show a spinner with progress text.
- **Alternatives:** Keep native selects and inline-only feedback.
- **Consequences:** The interface is consistent and accessible. The custom select
  keeps React Hook Form integration through the hidden native element.

## D-015 — UX pass structure

- **Context:** Pages had inconsistent navigation, loading, empty, and filter
  behaviour.
- **Decision:** Move to a sidebar/mobile-drawer shell, introduce shared cards,
  skeletons, empty states, drawers and confirmation dialogs, make registration a
  three-step form, sync filters to the URL, and add an admin students page.
- **Alternatives:** Incremental page-by-page polish without a shared shell.
- **Consequences:** Pages share one navigation and feedback model. URL filters make
  state shareable. Dark mode and server-side pagination remain deferred.
