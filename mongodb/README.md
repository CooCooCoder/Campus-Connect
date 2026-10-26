# CampusConnect MongoDB Advanced Database Extension

## 1. Overview
The MongoDB extension in CampusConnect provides an append-only, high-throughput document store for **Event Activity Logs** and **Notification Audit Trails**. While PostgreSQL serves as the relational source of truth with ACID transaction boundaries, MongoDB handles unstructured metadata, multi-faceted aggregation, and TTL-based document expiration.

## 2. Document Models
### A. ActivityLog (`mongodb/models/ActivityLog.js`)
Tracks operational events:
- `REGISTRATION_SUCCESS`
- `REGISTRATION_CANCELLED`
- `EVENT_CREATED`
- `EVENT_UPDATED`
- `EVENT_FULL_ALERT`

**Indexes:**
- `action` (single-field index)
- `eventId` (single-field index)
- `studentEmail` (single-field index)
- `{ eventId: 1, createdAt: -1 }` (compound index for event-centric timeline retrieval)
- `createdAt` with `expires: 7776000` (**TTL Index**: documents are automatically purged by MongoDB background daemon after 90 days)

### B. Notification (`mongodb/models/Notification.js`)
Demonstrates **Embedding vs. Referencing**:
- **Referencing**: `eventId` references the external relational entity ID in PostgreSQL.
- **Embedding**: `deliveryReceipt` is an embedded subdocument (`sentAt`, `gateway`, `status`), ensuring atomic writes for delivery status updates without multi-document joins.

## 3. Advanced Aggregation Pipeline
The demonstration script (`mongodb/scripts/demo-aggregation.js`) executes a multi-stage `$facet` pipeline:
- **Facet 1 (actionsBreakdown)**: Groups activity logs by action type to measure system usage.
- **Facet 2 (topEvents)**: Aggregates total actions per event to rank trending campus events.
- **Facet 3 (channelStats)**: Groups metadata by access channel (`WEB`, `MOBILE`, `API`).

Run the demo via:
```bash
node mongodb/scripts/demo-aggregation.js
```

## 4. The Dual-Write Consistency Problem & Solution
When utilizing both PostgreSQL (relational) and MongoDB (document) in an application, updating both stores concurrently creates the **Dual-Write Consistency Challenge**:
- Writing to PostgreSQL then MongoDB is not distributed-transaction atomic (no two-phase commit 2PC).
- If PostgreSQL succeeds but MongoDB times out, data diverges.
- If MongoDB is down, core registration must not fail.

### Implementation Mitigation:
In `CampusConnect`, PostgreSQL is the **primary authority**. The MongoDB activity logging (`RegistrationService.logActivityAsync`) is **decoupled and fail-safe**:
1. Core registration and capacity decrement execute inside an atomic PostgreSQL/Prisma transaction.
2. The MongoDB write is executed asynchronously in the background.
3. If MongoDB is offline or experiences latency, the error is trapped and logged as a warning; the student's registration in PostgreSQL remains valid and unblocked.
4. For enterprise scale, the recommended architecture is an Outbox Pattern with a message broker (e.g., Apache Kafka / RabbitMQ) streaming CDC (Change Data Capture) from PostgreSQL into MongoDB.
