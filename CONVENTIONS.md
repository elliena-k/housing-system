# Housing Allocation and Management System — Engineering Conventions

University of Ibadan · Group project · Stack: React + TypeScript, Tailwind CSS,
Node.js (Express), Supabase.

These rules apply to every file and every phase. When in doubt, check this
document. Changes to these rules require agreement from the whole group and a
commit to this file.

## Locked decisions

| Decision            | Choice                                                              |
| ------------------- | ------------------------------------------------------------------- |
| Repository location | `/data/data/com.termux/files/home/projects/housing-system`          |
| Repository layout   | Monorepo with npm workspaces                                        |
| Git workflow        | Short-lived feature branches, merged locally, then pushed to `main` |
| Language and tone   | British English, formal, no emoji                                   |

---

## 1. Language, tone and content

- **British English** everywhere: documentation, UI copy, comments, commit
  subjects. Use `authorise`, `behaviour`, `defence`, `organisation`, `licence`.
- **UI copy:** short, neutral, polite, sentence case. No exclamation marks,
  slang, emoji, or playful errors.
  - Correct: `Enter a valid matriculation number.`
  - Incorrect: `Oops! That matric is wrong!`
- **Error messages:** always actionable and safe. Say what happened and what to
  do next. Never expose SQL, stack traces, tokens, or personal data.
- **Report and prose tone:** formal, plain, and direct. No marketing adjectives,
  filler, or first-person chatter.
- **Fixed vocabulary:** student, administrator (admin), hostel, room, allocation,
  application, session. Write “matriculation number” in user-facing text.
- **No emoji** in code, comments, commits, UI, or documentation.
- **No AI attribution or conversational filler** in code, comments, commits, or
  documentation.

## 2. Comments and documentation

- Comments explain **why**, not what. Do not narrate obvious code.
- **TSDoc/JSDoc is required** on exported functions, services, route handlers,
  and non-obvious public types. Include a summary and, where relevant, params,
  return value, and thrown errors.
- Inline comments are reserved for business rules, security or concurrency
  reasoning, workarounds, and non-obvious constraints.
- No commented-out code. Delete it; git remembers it.
- TODOs must be attributable: `// TODO(Ada): handle waitlist — FR11`.
- SQL migrations get a one-line header explaining intent. Comment the row-locking
  logic in `allocate_room` and every RLS policy.
- Stale comments are treated as bugs.

## 3. Naming and file structure

- Directories: `kebab-case`.
- React components: `PascalCase.tsx`.
- Hooks: `useSomething.ts`.
- Services, utilities, controllers: `camelCase.ts`.
- Types: `*.types.ts`; zod schemas: `*.schema.ts`.
- Tests: `*.test.ts` or `*.spec.ts`.
- Use **named exports** everywhere. No default exports.
- Postgres: `snake_case` for tables, columns, indexes, and functions; plural
  table names; lowercase enum values; `idx_*` indexes; `verb_noun` functions.
- API JSON fields: `camelCase`. Routes use plural nouns
  (`/admin/applications`).
- Environment variables: `UPPER_SNAKE_CASE`.

## 4. TypeScript and code style

- TypeScript **strict** mode. No `any`. No non-null assertions unless the value
  is provably present; prefer optional chaining and nullish coalescing.
- ESLint and Prettier are the source of truth:
  - 2 spaces, single quotes, semicolons, `es5` trailing commas.
  - 100-character print width, LF line endings.
- Import order: builtin → external → internal alias → relative → type-only.
  Type-only imports always use `import type`.
- `async/await` only. No floating promises. Wrap async route handlers with
  `asyncHandler`.
- One central `AppError` and `errorHandler`. Map Postgres errors to HTTP status
  and readable messages.
- No `console.log` in application paths. Use the structured logger (`pino`).
- Validate every boundary with zod. Parse and narrow; do not assume shapes.
- Prefer small, pure functions and thin controllers.

## 5. Git and collaboration

### Branches

- `main` is always deployable.
- Do feature work on short-lived branches named
  `feat/<scope>-<short-slug>`, `fix/<scope>-<short-slug>`,
  `docs/<short-slug>`, `chore/<short-slug>`, `test/<short-slug>`, or
  `refactor/<short-slug>`.
- Rebase your branch on `main` before merging.
- Merge locally with `git merge --no-ff <branch>` so the feature boundary stays
  visible, then push `main` and delete the branch.
- No feature work committed directly to `main`.

### Commits

- **Conventional Commits 1.0.0**: `type(scope): subject`.
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`,
  `ci`, `chore`, `revert`.
- Scopes: `web`, `api`, `db`, `auth`, `students`, `applications`, `hostels`,
  `rooms`, `allocations`, `stats`, `deps`, `repo`.
- Subject: imperative mood, lowercase, no full stop, 72 characters or fewer.
- Body wrapped at 72 characters and explains **why**, not just what.
- Reference requirements and issues in the footer: `Refs: FR9, FR10`.
- One logical change per commit. Never mix formatting changes with behaviour
  changes.

Example:

```
feat(allocations): lock room rows during allocation

Move the availability check into the allocate_room transaction so two
administrators cannot allocate the last bed concurrently.

Refs: FR9, FR10
```

### Hygiene

- Never commit secrets. Commit `.env.example`, never `.env`.
- Use your real name and email. No shared accounts.
- No AI co-author trailers or tool attribution.
- Keep commits buildable. Do not commit half-finished work to `main`.
- Record real evidence for the report; never fabricate test results or
  screenshots.

## 6. Monorepo layout and scripts

```
housing-system/
├── apps/
│   ├── web/          # React + TypeScript + Tailwind (Vite)
│   └── api/          # Express + TypeScript
├── packages/
│   └── shared/       # shared types and zod schemas
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── docs/
│   ├── CONVENTIONS.md
│   ├── DECISIONS.md
│   ├── API.md
│   └── evidence/
├── package.json      # npm workspaces root
└── README.md
```

Root scripts:

- `npm run dev` — run web and API together.
- `npm run build` — build all workspaces.
- `npm run typecheck` — TypeScript across workspaces.
- `npm run lint` — ESLint across workspaces.
- `npm run format` — Prettier write.
- `npm run test` — unit and integration tests.

Tooling baseline: Node 20+, npm workspaces, ESLint flat config, Prettier,
Vitest, Supertest, Playwright, Husky, lint-staged, commitlint.

Husky hooks:

- `pre-commit`: lint-staged (`eslint --fix`, `prettier --write`).
- `commit-msg`: commitlint for Conventional Commits.

## 7. Database conventions

- Schema changes happen only through migrations. Never change the schema in the
  Supabase dashboard without committing a migration.
- Migration filenames: `YYYYMMDDHHMMSS_verb_noun.sql`. Forward-only.
- Enums, constraints, indexes, and RLS belong in the database.
- Timestamps are `timestamptz` with `now()`. Primary keys use
  `gen_random_uuid()`.
- RLS is enabled on every table. The service-role key is server-side only.
- Seed data is idempotent and uses dummy student records only.
- Allocation integrity lives in `allocate_room`; application code must not
  bypass it.

## 8. API conventions

- REST under `/api`. JSON only. Plural resource names.
- Consistent error envelope:

```json
{ "error": { "code": "ROOM_UNAVAILABLE", "message": "That room is full.", "fields": {} } }
```

- Status codes: 200, 201, 204, 400, 401, 403, 404, 409, 422, 500.
- Authentication uses `Authorization: Bearer <jwt>`.
- Every `/api/admin/*` route is guarded by `requireRole('admin')`.
- Validate bodies, queries, and params with zod; return 422 with field errors.
- Pagination and filters are explicit query parameters with documented defaults.

## 9. Security and error handling

- Service-role key never reaches the browser or git history.
- CORS restricted to the deployed frontend origin. Rate-limit auth routes.
- No student data in logs. Error responses never include stack traces or SQL.
- Admin accounts are created manually; no endpoint can promote a user.
- Never trust client input. Re-check authorization on the server.
- Report and demo data only; the prototype is not authorised for real student
  records.

## 10. Testing and evidence

- Vitest + Supertest for API tests, React Testing Library for web components,
  Playwright for end-to-end flows.
- Test names describe behaviour:
  `it('rejects a second application for the same session')`.
- Unit tests are deterministic and do not touch the network.
- Integration tests use a separate Supabase project or the local CLI; reset and
  seed before each run.
- Priority coverage: registration, login, application validation, allocation,
  cancellation, authorization (403s), and concurrency on the last bed.
- Every bug fix includes a regression test.
- Chapter 5 evidence (real output and screenshots) is stored in
  `docs/evidence/` and linked from the report.

## 11. Definition of done

A change is done when it is:

- typed, linted, and formatted;
- covered by the relevant tests, with `npm run test` passing;
- documented in the same commit or branch (README, API docs, DECISIONS);
- free of secrets and debug logging;
- merged to `main` through the branch workflow above;
- reflected in the requirement traceability checklist (FR1–FR12).

## 12. Decision log

Record significant choices in `docs/DECISIONS.md` using: context, decision,
alternatives considered, consequences. Add an entry when a decision changes.
