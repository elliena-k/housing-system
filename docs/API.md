# API reference

Base URL: `/api`

All responses are JSON. Errors use the envelope:

```json
{ "error": { "code": "ROOM_UNAVAILABLE", "message": "That room is full." } }
```

## Health

### `GET /api/health`

Public. Returns the service status and the open application session.

```json
{ "status": "ok", "session": "2026/2027", "uptime": 12.34 }
```

Further endpoints are documented as each phase is implemented.
