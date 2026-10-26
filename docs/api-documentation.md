# CampusConnect REST API Reference

Base URL: `http://localhost:5000/api` (Local) / Custom Deployed Domain

All responses include an `X-Request-Id` header and follow the standardized JSON envelope:
```json
{
  "success": true,
  "message": "Human readable message",
  "data": { ... },
  "requestId": "uuid"
}
```

---

## 1. System Health
### `GET /api/health`
Probes service uptime and verifies database read connectivity.
- **Response 200 OK**:
```json
{
  "status": "OK",
  "service": "CampusConnect API",
  "version": "1.0.0",
  "timestamp": "2026-10-26T03:25:00.000Z",
  "uptimeSeconds": 145,
  "database": {
    "status": "healthy",
    "latencyMs": 2
  },
  "requestId": "b2e18d01-3b06-480b-86bb-a782069bc910"
}
```

---

## 2. Events Endpoints
### `GET /api/events`
Query events with server-side pagination, searching, filtering, and sorting.
- **Query Parameters**:
  - `page` (number, default: 1): Current page index
  - `limit` (number, default: 9): Results per page
  - `search` (string): Keyword matching in title and description
  - `category` (string): Filter by category (e.g. `Technical`, `Sports`, `Cultural`)
  - `club` (string): Filter by organizing club name
  - `sortBy` (string, default: `date`): Attribute to order by (`date`, `title`, `capacity`)
  - `order` (string, default: `asc`): `asc` or `desc`

- **Response 200 OK**:
```json
{
  "success": true,
  "message": "Events retrieved successfully",
  "data": [
    {
      "id": "e82b3a41-1111-4f11-9a22-000000000001",
      "title": "HackCampus 2026: 24-Hour National Hackathon",
      "category": "Technical",
      "venue": "Main Auditorium & Innovation Lab",
      "date": "2026-11-09T03:25:00.000Z",
      "capacity": 120,
      "registeredCount": 2,
      "remainingSeats": 118,
      "isFull": false,
      "status": "UPCOMING",
      "club": {
        "id": "c101",
        "name": "CodeCraft Coding Club",
        "category": "Technology"
      }
    }
  ],
  "pagination": {
    "totalRecords": 12,
    "currentPage": 1,
    "pageSize": 9,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### `GET /api/events/:id`
Retrieves detailed information for a single event, including associated club and calculated remaining seats.
- **Response 200 OK**: Event object with `club` and `remainingSeats`.
- **Response 404 Not Found**: If event ID does not exist.

### `POST /api/events`
Creates a new campus event with strict validation.
- **Request Body**:
```json
{
  "title": "Autonomous Drone Navigation Showcase",
  "description": "Live field demonstrations of obstacle avoidance systems.",
  "category": "Technical",
  "venue": "Campus Central Quadrangle",
  "date": "2026-11-15T10:00:00.000Z",
  "capacity": 80,
  "clubId": "c101"
}
```
- **Response 201 Created**: Returns created event.
- **Response 400 Bad Request**: If validation fails.

### `PATCH /api/events/:id`
Updates event fields (e.g., updates venue, capacity, or status).
- **Response 200 OK**: Returns updated event.

### `DELETE /api/events/:id`
Deletes an event and cascades deletions to child registration records.
- **Response 200 OK**: `{ "success": true, "message": "Event deleted successfully" }`.

---

## 3. Registrations Endpoints
### `POST /api/events/:id/registrations`
Executes an atomic registration transaction with concurrency control.
- **Request Body**:
```json
{
  "studentName": "Shivamsh Anil Menon",
  "studentEmail": "shivamsh.menon@campus.edu"
}
```
- **Response 201 Created**:
```json
{
  "success": true,
  "message": "Registration confirmed successfully! Your seat has been reserved.",
  "data": {
    "registration": {
      "id": "reg-901",
      "eventId": "ev-101",
      "studentName": "Shivamsh Anil Menon",
      "studentEmail": "shivamsh.menon@campus.edu",
      "status": "CONFIRMED",
      "createdAt": "2026-10-26T03:25:00.000Z"
    },
    "event": {
      "id": "ev-101",
      "title": "HackCampus 2026",
      "capacity": 120,
      "registeredCount": 3,
      "remainingSeats": 117
    }
  }
}
```
- **Response 409 Conflict**:
  - Code `CONFLICT`: If the student email is already registered for this event.
  - Code `CAPACITY_EXCEEDED`: If the event is full (concurrency CAS update returned 0 rows).

### `GET /api/events/:id/registrations`
Retrieves all registered students for an event (roster for organizers).
- **Response 200 OK**: Array of attendee records.

---

## 4. Clubs Endpoints
### `GET /api/clubs`
Lists all campus clubs along with the count of organized events.
- **Response 200 OK**: Array of clubs.

### `GET /api/clubs/:id`
Retrieves club details and all associated upcoming events.
- **Response 200 OK**: Club object with nested `events` array.
