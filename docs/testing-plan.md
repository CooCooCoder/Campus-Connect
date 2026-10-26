# CampusConnect Testing Plan

## 1. Objectives & Scope
The test plan validates end-to-end reliability, data integrity, concurrency protection, and input sanitization across the CampusConnect web application.

## 2. Test Matrix

| ID | Test Scenario | Target Endpoint | Strategy | Expected Outcome |
|---|---|---|---|---|
| TC-01 | Health Verification | `GET /api/health` | Service & DB probe | HTTP 200, status "OK", DB latency metric |
| TC-02 | Pagination Verification | `GET /api/events` | Limit/offset bounds | HTTP 200, array of 5, metadata present |
| TC-03 | Search Filter | `GET /api/events?search=...` | Keyword matching | HTTP 200, matching titles/descriptions |
| TC-04 | Category Filter | `GET /api/events?category=Sports` | Categorical isolation | HTTP 200, strictly Sports events |
| TC-05 | Sorting Logic | `GET /api/events?sortBy=date` | Monotonic ordering | HTTP 200, dates ordered ascending |
| TC-06 | Detail Retrieval | `GET /api/events/:id` | Relational join | HTTP 200, event with nested club object |
| TC-07 | Input Validation | `POST /api/events` | Malformed payload | HTTP 400, structured validation errors |
| TC-08 | Lifecycle Management | `POST` & `PATCH /api/events` | Entity mutation | HTTP 201 on create, HTTP 200 on update |
| TC-09 | Registration Success | `POST /api/events/:id/registrations` | Valid reservation | HTTP 201, remaining seats decremented |
| TC-10 | Duplicate Prevention | `POST /api/events/:id/registrations` | Repeated email | HTTP 409 Conflict, duplicate notice |
| TC-11 | Not Found Handling | `POST /api/events/:id/registrations` | Invalid UUID | HTTP 404 Not Found |
| TC-12 | Full Event Rejection | `POST /api/events/:id/registrations` | Saturated capacity | HTTP 409 Capacity Exceeded |
| TC-13 | Email Syntax Check | `POST /api/events/:id/registrations` | Bad email string | HTTP 400 Bad Request |
| TC-14 | Concurrency Stress | `POST /api/events/:id/registrations` | 10 parallel requests | Exactly 2 succeed, 8 rejected, no overbooking |
| TC-15 | Club Aggregation | `GET /api/clubs` | Count calculation | HTTP 200, club array with `_count.events` |
