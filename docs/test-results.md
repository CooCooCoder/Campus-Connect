# CampusConnect Automated Test Execution Results

**Execution Timestamp**: 2026-10-26T03:25:04Z  
**Runtime**: Node.js v24.19.0 Test Runner (`node --test`)  
**Database**: SQLite (Development) / PostgreSQL (Target Architecture)  
**Total Tests**: 15  
**Passed**: 15  
**Failed**: 0  
**Blocked**: 0  
**Suite Duration**: 730.85 ms  

---

## Detailed Test Case Outcomes

| Test Case | Description | Observed Result | Status | Duration |
|---|---|---|---|---|
| **TC-01** | `GET /api/health` responds with 200 and healthy DB | HTTP 200, status "OK", DB latency 16ms | **PASS** | 67.2 ms |
| **TC-02** | `GET /api/events` lists events with pagination metadata | HTTP 200, returned 5 records, total 12+ records | **PASS** | 6.3 ms |
| **TC-03** | `GET /api/events` with search filter matches term | HTTP 200, HackCampus returned in results | **PASS** | 8.2 ms |
| **TC-04** | `GET /api/events` with category filter isolates category | HTTP 200, strictly Sports events returned | **PASS** | 3.3 ms |
| **TC-05** | `GET /api/events` sorts by date ascending | HTTP 200, monotonically increasing timestamps | **PASS** | 11.7 ms |
| **TC-06** | `GET /api/events/:id` retrieves single event with club | HTTP 200, eager-loaded club object attached | **PASS** | 12.0 ms |
| **TC-07** | `POST /api/events` rejects invalid payload | HTTP 400, code `BAD_REQUEST`, details array | **PASS** | 24.5 ms |
| **TC-08** | `POST` & `PATCH /api/events` lifecycle | HTTP 201 created, HTTP 200 updated capacity to 45 | **PASS** | 27.6 ms |
| **TC-09** | `POST /api/events/:id/registrations` succeeds | HTTP 201, registration object and remaining seats | **PASS** | 40.9 ms |
| **TC-10** | `POST /api/events/:id/registrations` rejects duplicate | HTTP 409, code `CONFLICT`, email already registered | **PASS** | 49.9 ms |
| **TC-11** | Nonexistent event registration fails gracefully | HTTP 404, code `NOT_FOUND` | **PASS** | 14.3 ms |
| **TC-12** | Registration for full event rejected | HTTP 409, code `CAPACITY_EXCEEDED` | **PASS** | 15.5 ms |
| **TC-13** | Invalid email format rejected | HTTP 400, code `BAD_REQUEST` | **PASS** | 27.8 ms |
| **TC-14** | **Concurrency Stress**: 10 simultaneous registrations on capacity 2 | Exactly 2 succeeded (201), 8 rejected (409), final count 2 | **PASS** | 222.0 ms |
| **TC-15** | `GET /api/clubs` retrieves clubs with counts | HTTP 200, array of 8 clubs with event counters | **PASS** | 4.8 ms |

---

## Concurrency Validation Analysis
During execution of Test 14, 10 asynchronous HTTP requests were dispatched concurrently via `Promise.all` targeting an event with a configured capacity of 2. 
- Requests 1 and 2 secured the exclusive conditional compare-and-swap update (`registeredCount < 2`), successfully reserving seats.
- Requests 3 through 10 evaluated `registeredCount < 2` as FALSE, updating 0 rows and immediately returning HTTP 409 `CAPACITY_EXCEEDED`.
- Final database query verified `registeredCount: 2`, `remainingSeats: 0`, and zero overbooking.
