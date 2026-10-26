# CampusConnect Project Proposal

**Project Title**: CampusConnect: Campus Event & Club Management Portal  
**Student Name**: Shivamsh Anil Menon  
**Registration Number**: [Student Registration Number]  
**Faculty Guide**: [Faculty Guide Name, Designation]  
**Institution**: Alliance University, Department of Computer Science & Engineering  
**Academic Year**: 2025–2026  
**Subjects Involved**:
1. Full Stack Development
2. Backend Development
3. Advanced Database Systems

---

## 1. Problem Statement
Campus student life revolves around student-led clubs organizing technical hackathons, cultural fests, sports leagues, and academic seminars. However, existing registration workflows rely on uncoordinated Google Forms or social messaging groups, leading to frequent venue overcrowding, lack of real-time seat availability tracking, and duplicate registrations.

## 2. Proposed Solution
CampusConnect delivers a unified, high-performance web platform that consolidates campus club discovery, event categorization, and guaranteed seat reservations. The system enforces strict capacity bounds through atomic compare-and-swap database transactions, providing real-time feedback to students and administrative rosters to student coordinators.

## 3. Technology Stack & Architecture
- **Frontend**: React 18, Vite, React Router, Axios, TanStack Query v5, Custom Responsive Design Tokens.
- **Backend**: Node.js, Express, Layered Architecture (`routes`, `controllers`, `services`, `repositories`, `validators`, `middleware`), Request Tracing (`X-Request-Id`), Structured Logging.
- **Primary Database**: PostgreSQL (Prisma ORM, relational schema adhering to 3NF/BCNF, CHECK and UNIQUE constraints, composite indexes, CTEs, window functions).
- **Secondary Database**: MongoDB (Mongoose, append-only activity logs, TTL indexes, `$facet` multi-dimensional analytical aggregation).
- **Quality Assurance**: Automated Node.js integration tests (`node --test`), concurrency stress tests, Puppeteer screenshot capture.

## 4. Expected Deliverables
1. Working Full-Stack Web Application.
2. Verified REST API endpoints with standardized envelopes.
3. Automated test suite with 100% passing results under concurrency.
4. Three academic subject reports in DOCX and PDF format.
5. Project proposal in DOCX and PDF format.
6. Genuine browser screenshots demonstrating complete user journeys.
7. Clean, submission-ready ZIP archive: `CampusConnect_Shivamsh_Anil_Menon.zip`.
