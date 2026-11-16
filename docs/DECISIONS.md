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
