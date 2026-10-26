# CampusConnect Database Design & Architecture Specification

## 1. Relational Entities (PostgreSQL Source of Truth)

### A. `users`
Represents registered students, faculty coordinators, and administrative officers.
- `id` (UUID, Primary Key, Default: `gen_random_uuid()`)
- `email` (VARCHAR(255), UNIQUE, NOT NULL, CHECK: valid email regex)
- `name` (VARCHAR(150), NOT NULL)
- `role` (ENUM: `STUDENT`, `ORGANIZER`, `ADMIN`, Default: `STUDENT`)
- `created_at`, `updated_at` (TIMESTAMP WITH TIME ZONE)

### B. `clubs`
Represents campus student societies and academic chapters.
- `id` (UUID, Primary Key, Default: `gen_random_uuid()`)
- `name` (VARCHAR(150), UNIQUE, NOT NULL)
- `slug` (VARCHAR(150), UNIQUE, NOT NULL)
- `description` (TEXT, NOT NULL)
- `category` (VARCHAR(100), NOT NULL)
- `contact_email` (VARCHAR(255), NOT NULL, CHECK: valid email format)
- `logo_url` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP WITH TIME ZONE)

### C. `events`
Represents scheduled campus activities, workshops, and competitions.
- `id` (UUID, Primary Key, Default: `gen_random_uuid()`)
- `club_id` (UUID, Foreign Key -> `clubs(id)` ON DELETE CASCADE)
- `title` (VARCHAR(200), NOT NULL)
- `description` (TEXT, NOT NULL)
- `category` (VARCHAR(100), NOT NULL)
- `venue` (VARCHAR(200), NOT NULL)
- `event_date` (TIMESTAMP WITH TIME ZONE, NOT NULL)
- `capacity` (INT, NOT NULL, CHECK: `capacity > 0`)
- `registered_count` (INT, DEFAULT 0, CHECK: `registered_count >= 0 AND registered_count <= capacity`)
- `status` (ENUM: `UPCOMING`, `ONGOING`, `COMPLETED`, `CANCELLED`)
- `metadata` (JSONB, DEFAULT `'{}'::jsonb`)
- `created_at`, `updated_at` (TIMESTAMP WITH TIME ZONE)

### D. `registrations`
Represents atomic seat allocations.
- `id` (UUID, Primary Key, Default: `gen_random_uuid()`)
- `event_id` (UUID, Foreign Key -> `events(id)` ON DELETE CASCADE)
- `student_name` (VARCHAR(150), NOT NULL)
- `student_email` (VARCHAR(255), NOT NULL, CHECK: valid email format)
- `status` (ENUM: `CONFIRMED`, `CANCELLED`, Default: `CONFIRMED`)
- `created_at`, `updated_at` (TIMESTAMP WITH TIME ZONE)
- **Constraint**: `UNIQUE (event_id, student_email)` (Strictly prevents duplicate registrations)

---

## 2. Concurrency Control & Invariant Enforcement
To prevent overbooking under high concurrency:
1. Registration requests execute within a database transaction boundary.
2. A conditional compare-and-swap atomic query is executed:
   ```sql
   UPDATE events
   SET registered_count = registered_count + 1
   WHERE id = $1 AND registered_count < capacity;
   ```
3. If rows affected equals 0, the event is full; the transaction aborts and returns HTTP 409 `CAPACITY_EXCEEDED`.
4. If rows affected equals 1, the registration record is inserted and the transaction commits.
5. In conjunction with `CHECK (registered_count <= capacity)`, overbooking is impossible even under thousands of parallel requests.

---

## 3. MongoDB Polyglot Extension
For audit logging, MongoDB models:
- **`ActivityLog`**: Append-only log with TTL index (`expires: 7776000`, 90-day retention).
- **`Notification`**: Demonstrates embedding (`deliveryReceipt` subdocument) vs referencing (`eventId` reference).
- **Decoupled Dual-Write**: Relational writes are non-blocking; MongoDB audit writes occur asynchronously.
