# API reference

Base URL: `/api`

All responses are JSON. Successful responses use a `data` envelope:

```json
{ "data": { "...": "..." } }
```

Errors use:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Some fields are invalid.", "fields": {} } }
```

Protected routes require `Authorization: Bearer <supabase-jwt>`.

## Health

### `GET /api/health`

Public. Returns service status and the open application session.

```json
{ "status": "ok", "session": "2026/2027", "uptime": 12.34 }
```

## Authentication

### `POST /api/auth/register`

Public. Creates the auth user, profile, and student record.

Request body:

```json
{
  "first_name": "Ada",
  "last_name": "Okafor",
  "matric_no": "UI/2023/1042",
  "faculty": "Science",
  "department": "Computer Science",
  "level": 300,
  "gender": "female",
  "email": "ada.okafor@example.com",
  "password": "correct-horse",
  "phone": "08012345678"
}
```

Responses: `201` with the created user and student; `409` if the matriculation
number or email is already registered; `422` for validation errors.

### `GET /api/me`

Student or admin. Returns the current user, student record (or `null` for an
administrator), and the open session.

## Students

### `GET /api/students/me`

Student. Returns the current student record.

### `PUT /api/students/me`

Student. Updates profile fields. The matriculation number and email cannot be
changed here.

Request body (any subset):

```json
{
  "first_name": "Ada",
  "last_name": "Okafor",
  "gender": "female",
  "faculty": "Science",
  "department": "Computer Science",
  "level": 300,
  "phone": "08012345678"
}
```

## Applications

### `POST /api/applications`

Student. Submits an application for the open session.

Request body:

```json
{ "session": "2026/2027", "preference": "Queen Idia Hall" }
```

Responses: `201`; `409 APPLICATION_EXISTS` if the student already applied this
session; `409 ALREADY_ALLOCATED` if they already hold an allocation; `422
SESSION_CLOSED` or `PROFILE_INCOMPLETE`.

### `GET /api/applications/me`

Student. Lists the current student's applications, newest first.

### `GET /api/applications/me/:id`

Student. Returns one of the current student's applications.

## Status

### `GET /api/status/me`

Student. Returns the student record, latest application, and active allocation
(with hostel name and room number) when present.

```json
{
  "data": {
    "student": { "...": "..." },
    "application": { "status": "pending", "...": "..." },
    "allocation": null
  }
}
```

## Hostels and rooms

### `GET /api/hostels`

Student or admin. Lists all hostels.

### `POST /api/admin/hostels`

Admin. Creates a hostel.

```json
{ "name": "Kuti Hall", "location": "North Campus", "capacity": 120, "gender_type": "male" }
```

### `PATCH /api/admin/hostels/:id`

Admin. Updates hostel details, including status.

### `GET /api/admin/rooms`

Admin. Lists rooms. Query parameters: `hostel_id` (UUID) and `status`
(`available`, `occupied`, `maintenance`).

### `GET /api/admin/rooms/available`

Admin. Lists rooms with free space. Optional `hostel_id` filter.

### `POST /api/admin/rooms`

Admin. Creates a room.

```json
{ "hostel_id": "<uuid>", "room_number": "A101", "capacity": 4 }
```

### `PATCH /api/admin/rooms/:id`

Admin. Updates room number, capacity, or status. Capacity cannot fall below the
current occupancy.

## Admin applications

### `GET /api/admin/applications`

Admin. Lists applications with student details. Query parameters: `status`,
`session`, and `q` (student name or matriculation number).

### `GET /api/admin/applications/:id`

Admin. Returns one application with student details.

### `PATCH /api/admin/applications/:id`

Admin. Reviews a pending application.

```json
{ "status": "approved", "remarks": "Eligible for accommodation." }
```

`status` must be `approved` or `rejected`. Only pending applications can be
reviewed; otherwise the API returns `409 INVALID_STATUS_TRANSITION`.

## Admin students

### `GET /api/admin/students`

Admin. Lists students, optionally filtered with `q` (name or matriculation
number).

## Allocations

### `GET /api/admin/allocations`

Admin. Lists allocations with student, hostel, and room details.

### `POST /api/admin/allocations`

Admin. Allocates a room to an approved application. Calls the `allocate_room`
database function, which locks the rows and enforces availability and gender
rules.

```json
{ "application_id": "<uuid>", "room_id": "<uuid>" }
```

### `PATCH /api/admin/allocations/:id/cancel`

Admin. Cancels an active allocation, frees the bed, and returns the application
to `approved`.

## Admin statistics

### `GET /api/admin/stats`

Admin. Returns application counts by status, rooms with free space, active
allocations, and total students.

## Error codes

| Code                 | Meaning                                        |
| -------------------- | ---------------------------------------------- |
| `UNAUTHENTICATED`    | Missing, invalid, or expired token             |
| `FORBIDDEN`          | Role does not permit the action                |
| `VALIDATION_ERROR`   | Request body failed validation                 |
| `PROFILE_INCOMPLETE` | Student profile is missing details             |
| `PROFILE_MISSING`    | No student record for the user                 |
| `APPLICATION_EXISTS` | Duplicate application for the session          |
| `ALREADY_ALLOCATED`  | Student already has an active allocation       |
| `SESSION_CLOSED`     | Application session is not open                |
| `ROOM_UNAVAILABLE`   | Room is full or unavailable (allocation phase) |
| `INTERNAL_ERROR`     | Unexpected server error                        |
