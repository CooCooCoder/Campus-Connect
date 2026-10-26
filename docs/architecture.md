# CampusConnect System Architecture & Engineering Design

## 1. High-Level Architectural Pattern
CampusConnect is structured as a decoupled, multi-tier client-server web architecture engineered for academic excellence, developer ergonomics, and concurrency safety.

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Tier                           │
│        React 18 + Vite SPA (HTML5 / Vanilla CSS)            │
│         TanStack Query v5 Server State & Caching            │
└──────────────────────────────▲──────────────────────────────┘
                               │ HTTP / REST JSON
                               │ (X-Request-Id Propagated)
┌──────────────────────────────▼──────────────────────────────┐
│                       Backend Tier                          │
│               Node.js + Express REST API                    │
│   ├── Request ID & Structured Logging Middleware            │
│   ├── Layered Controllers (HTTP protocol translation)       │
│   ├── Services Layer (Business logic & calculations)        │
│   ├── Repositories Layer (Data access encapsulation)        │
│   └── Centralized Error Handling & Validation               │
└──────────────┬───────────────────────────────┬──────────────┘
               │ Prisma ORM (ACID)             │ Mongoose (Audit Log)
               │ Compare-and-Swap              │ Async Decoupled
┌──────────────▼──────────────┐ ┌──────────────▼──────────────┐
│    Relational Data Store    │ │    Document Data Store      │
│     PostgreSQL / SQLite     │ │       MongoDB Local         │
│  (Events, Clubs, Regs)      │ │   (Activity Logs, TTL 90d)  │
└─────────────────────────────┘ └─────────────────────────────┘
```

## 2. Layered Backend Responsibilities
The backend strictly adheres to Separation of Concerns:
- **Routes (`src/routes/`)**: Declares REST endpoints, HTTP verbs, and mounts route-specific validator middleware.
- **Middleware (`src/middleware/`)**:
  - `requestId.js`: Injects unique UUIDv4 on incoming requests and ensures `X-Request-Id` is mirrored in response headers for distributed tracing.
  - `logger.js`: Emits structured latency, status code, method, and URI telemetry.
  - `errorHandler.js`: Intercepts operational errors (`AppError`), Prisma constraint violations, and shields stack traces in production.
- **Validators (`src/validators/`)**: Sanitizes and validates user input prior to service invocation, rejecting invalid payloads with HTTP 400.
- **Controllers (`src/controllers/`)**: Extracts request parameters, delegates to services, and structures responses using `ApiResponse` standard envelopes.
- **Services (`src/services/`)**: Enforces core domain logic, seat availability mathematics, status filters, and triggers decoupled asynchronous MongoDB logging.
- **Repositories (`src/repositories/`)**: Encapsulates raw Prisma ORM interactions and transactional boundaries.

## 3. Frontend Architecture & Server State
- **Single Page Application (SPA)**: Powered by React 18 and Vite for near-instant Hot Module Replacement (HMR).
- **Server-State Management**: TanStack Query v5 manages asynchronous server state:
  - Automatic background refetching and cache invalidation.
  - Zero duplicate network calls on repeated component mounts.
  - Optimistic UI updates when reservations succeed.
- **Centralized API Client**: Axios instance configured with base URLs and response interceptors to normalize HTTP errors uniformly across views.
