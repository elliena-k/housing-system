# Test plan

This plan turns the report's Chapter 5 acceptance tables (5.1–5.7) into
repeatable checks. Automated tests run without credentials; live acceptance
tests require a dedicated Supabase test project.

## Automated checks

Run from the repository root:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Current automated coverage:

- Route guards: unauthenticated access to every student and admin endpoint returns 401.
- Validation: registration, application, hostel, room, review, and allocation schemas.
- Request parsing: malformed JSON returns `400 INVALID_JSON`.
- Error mapping: allocation database errors map to stable HTTP codes.
- Search sanitisation for admin filters.

## Live acceptance setup

1. Create a separate Supabase project for testing.
2. Apply `supabase/migrations/20261116090000_initial_schema.sql`.
3. Apply `supabase/seed.sql`.
4. Create one admin user in Supabase Auth and promote the profile:

   ```sql
   insert into profiles (id, role)
   values ('<auth-user-id>', 'admin')
   on conflict (id) do update set role = 'admin';
   ```

5. Point the API at the test project and run `npm run dev`.
6. Record real results and screenshots in `docs/evidence/`.

## Acceptance tables

| Report table        | What to check                                                                       | How                                                       | Status                              |
| ------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------- |
| 5.1 Registration    | Valid account created; empty field rejected; duplicate matric/email rejected        | API tests plus one Playwright flow                        | Blocked on test project             |
| 5.2 Login           | Valid login; wrong password denied; empty fields validated                          | Manual and UI tests                                       | Blocked on test project             |
| 5.3 Application     | Valid submit; incomplete profile rejected; submitted application visible            | API and UI                                                | Blocked on test project             |
| 5.4 Hostel and room | Add hostel; add room; update room; view available rooms                             | Admin API and UI                                          | Blocked on test project             |
| 5.5 Allocation      | Allocate an available room; unavailable room blocked; status visible to the student | API and UI                                                | Blocked on test project             |
| 5.6 Admin           | Admin login; view applications; manage hostels and rooms                            | API and UI; assert students receive 403 on `/api/admin/*` | Blocked on test project             |
| 5.7 Validation      | Empty required field; invalid input; bad credentials                                | Unit tests on zod schemas plus API tests                  | Schemas covered; live cases blocked |

## Additional checks

- Concurrency: fire two allocations at the last bed and expect exactly one success.
- Authorization: a student cannot read another student's application or allocation.
- Cancellation: cancelling an allocation frees a bed and returns the application to `approved`.
- Room status: a room flips to `occupied` exactly when occupancy reaches capacity.
- Readiness: `GET /api/ready` returns 200 when the database is reachable and 503 otherwise.
- Rate limiting: more than 20 registration attempts in 15 minutes returns `429 RATE_LIMITED`.

## Deployment smoke test

1. Open the deployed web URL and register a new student.
2. Sign in and submit an application.
3. Sign in as the admin, approve the application, and allocate a room.
4. Sign in as the student and confirm the allocation is visible.
5. Cancel the allocation as admin and confirm the student sees the reverted status.
