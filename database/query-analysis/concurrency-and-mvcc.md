# PostgreSQL MVCC, Concurrency Control & Overbooking Prevention

## 1. Multi-Version Concurrency Control (MVCC) Overview
PostgreSQL employs **Multi-Version Concurrency Control (MVCC)** to provide high-concurrency transaction processing. Unlike locking-based database engines that lock entire tables or rows during reads:
- **Readers never block writers**, and **writers never block readers**.
- Each database transaction operates on a consistent snapshot of the database determined by its transaction ID (`xmin`, `xmax`) and snapshot isolation boundary.
- When an `UPDATE` executes, PostgreSQL does not overwrite the physical row in place; instead, it marks the old tuple with `xmax` (current transaction ID) and appends a new physical version of the tuple with `xmin`.

## 2. The Event Overbooking Concurrency Problem
In a naive registration implementation:
1. Client A queries: `SELECT capacity, registered_count FROM events WHERE id = $1;` (Finds capacity = 100, count = 99).
2. Client B queries simultaneously: `SELECT capacity, registered_count FROM events WHERE id = $1;` (Also sees capacity = 100, count = 99).
3. Client A executes: `INSERT INTO registrations (...)` and updates count to 100.
4. Client B executes: `INSERT INTO registrations (...)` and updates count to 101.
**Result**: The event is overbooked by 1 seat, violating the capacity invariant.

## 3. Concurrency Control Mechanisms Evaluated

### Strategy 1: Pessimistic Row-Level Locking (`SELECT FOR UPDATE`)
```sql
BEGIN;
SELECT * FROM events WHERE id = $1 FOR UPDATE;
-- Checks count against capacity in application memory
UPDATE events SET registered_count = registered_count + 1 WHERE id = $1;
INSERT INTO registrations (...);
COMMIT;
```
*Pros*: Extremely safe; serializes concurrent attempts on the specific event row.  
*Cons*: Increases transaction latency under hot-row contention; transactions queue waiting for locks.

### Strategy 2: Atomic Compare-and-Swap (CAS) Conditional Update (Implemented in CampusConnect)
```sql
BEGIN;
UPDATE events 
SET registered_count = registered_count + 1 
WHERE id = $1 AND registered_count < capacity;
-- Application checks rows_affected:
-- If rows_affected == 0 -> Capacity exceeded! Abort & rollback.
-- If rows_affected == 1 -> Insert registration record & commit.
COMMIT;
```
*Why this is superior*:
1. Under PostgreSQL `READ COMMITTED` isolation, an `UPDATE` acquires an exclusive row lock only for the duration of the statement.
2. If two concurrent transactions execute the `UPDATE`, PostgreSQL evaluates the `WHERE` condition on the **latest committed row version**.
3. The first transaction increments `registered_count` from 99 to 100.
4. When the second transaction acquires the row lock, it re-evaluates `registered_count < capacity` (100 < 100 = FALSE).
5. The second transaction updates 0 rows, triggering an immediate `CapacityExceededError` (HTTP 409) with zero race condition.
6. Combined with the database `CHECK (registered_count <= capacity)` constraint and Prisma's `$transaction`, overbooking is mathematically impossible.

## 4. Duplicate Registration Prevention
Duplicate student registrations are prevented at two layers:
1. **Application Layer**: Immediate indexed lookup via `findByEventAndEmail`.
2. **Database Storage Layer**: Unique composite constraint:
   ```sql
   CONSTRAINT uq_registrations_event_student UNIQUE (event_id, student_email)
   ```
If concurrent requests with the identical student email bypass application caches, PostgreSQL rejects the second insertion with unique violation error `23505` (`P2002` in Prisma), preventing race condition duplicates.
