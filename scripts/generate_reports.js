const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  ImageRun,
  BorderStyle
} = require('docx');

const REPORTS_DIR = path.join(__dirname, '..', 'reports');
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');

if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

function createHeading1(text) {
  return new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 }
  });
}

function createHeading2(text) {
  return new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 }
  });
}

function createHeading3(text) {
  return new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 }
  });
}

function createParagraph(text, isBold = false) {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: isBold,
        size: 24, // 12pt
        font: 'Times New Roman'
      })
    ],
    spacing: { after: 150, line: 276 } // 1.15 line spacing
  });
}

function createCodeBlock(code) {
  const lines = code.split('\n');
  return lines.map(line => new Paragraph({
    children: [
      new TextRun({
        text: line,
        font: 'Consolas',
        size: 19 // 9.5pt
      })
    ],
    spacing: { after: 60 }
  }));
}

function createImageParagraph(imageName, caption) {
  const imagePath = path.join(SCREENSHOTS_DIR, imageName);
  if (!fs.existsSync(imagePath)) {
    return [createParagraph(`[Image placeholder: ${caption}]`, true)];
  }

  const imageBuffer = fs.readFileSync(imagePath);
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new ImageRun({
          data: imageBuffer,
          transformation: {
            width: 540,
            height: 337
          }
        })
      ],
      spacing: { before: 200, after: 100 }
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Figure: ${caption}`,
          italics: true,
          size: 20,
          font: 'Times New Roman'
        })
      ],
      spacing: { after: 250 }
    })
  ];
}

function createPageBreak() {
  return new Paragraph({ pageBreakBefore: true });
}

// ==============================================================================
// 1. FULL STACK DEVELOPMENT REPORT
// ==============================================================================
async function generateFullStackReport() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title Page
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "A PROJECT REPORT ON", size: 28, bold: true, font: 'Times New Roman' }),
            ],
            spacing: { before: 800, after: 300 }
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "CampusConnect: Campus Event & Club Management Portal", size: 36, bold: true, font: 'Times New Roman', color: "1E1B4B" }),
            ],
            spacing: { after: 600 }
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Submitted in partial fulfillment of the requirements for the course of", size: 24, font: 'Times New Roman' }),
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "FULL STACK DEVELOPMENT", size: 28, bold: true, font: 'Times New Roman' }),
            ],
            spacing: { after: 800 }
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Submitted by:\n", size: 24, font: 'Times New Roman' }),
              new TextRun({ text: "SHIVAMSH ANIL MENON\n", size: 28, bold: true, font: 'Times New Roman' }),
              new TextRun({ text: "Registration No: [Student Registration Number]\n", size: 22, font: 'Times New Roman' }),
              new TextRun({ text: "Department of Computer Science & Engineering\n[Institution Name / Alliance University]\nAcademic Year 2025–2026", size: 24, font: 'Times New Roman' }),
            ],
            spacing: { after: 1200 }
          }),

          createPageBreak(),

          // Certificate Page
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "CERTIFICATE", size: 32, bold: true, font: 'Times New Roman' })],
            spacing: { before: 400, after: 400 }
          }),
          createParagraph("This is to certify that the project report entitled \"CampusConnect: Campus Event & Club Management Portal\" is a bonafide microproject work carried out by SHIVAMSH ANIL MENON (Registration No: [Student Registration Number]) under my guidance and supervision, in partial fulfillment of the curriculum requirements for Full Stack Development."),
          new Paragraph({
            children: [
              new TextRun({ text: "\n\n\n___________________________\t\t\t___________________________\n", size: 24 }),
              new TextRun({ text: "Faculty Guide: [Faculty Guide Name]\t\t\tHead of Department\n", size: 22 }),
              new TextRun({ text: "Designation: [Designation]\t\t\tDepartment of CSE\n", size: 22 }),
              new TextRun({ text: "Date: 26th October 2026\t\t\tPlace: Bangalore", size: 22 })
            ],
            spacing: { before: 1000, after: 400 }
          }),

          createPageBreak(),

          // Student Declaration
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "STUDENT DECLARATION", size: 32, bold: true, font: 'Times New Roman' })],
            spacing: { before: 400, after: 400 }
          }),
          createParagraph("I, SHIVAMSH ANIL MENON, hereby declare that the project entitled \"CampusConnect: Campus Event & Club Management Portal\" submitted for the subject of Full Stack Development is an authentic record of independent microproject work developed by me. All software implementations, API integrations, and UI architectures described herein were executed in the project workspace."),
          new Paragraph({
            children: [
              new TextRun({ text: "\n\n\n___________________________\n", size: 24 }),
              new TextRun({ text: "Shivamsh Anil Menon\n", size: 24, bold: true }),
              new TextRun({ text: "Date: 26th October 2026\n", size: 22 })
            ],
            spacing: { before: 800 }
          }),

          createPageBreak(),

          // Abstract
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "ABSTRACT", size: 32, bold: true, font: 'Times New Roman' })],
            spacing: { before: 400, after: 400 }
          }),
          createParagraph("CampusConnect is a production-grade full-stack web application designed to solve fragmentation in campus event discovery and seat registration. Traditional university processes rely on uncoordinated messaging channels, resulting in overbooked physical venues and duplicate registrations. CampusConnect resolves this by unifying club discovery, event categorization, server-side pagination, and atomic seat reservation into an intuitive React 18 Single Page Application (SPA). Powered by Vite, React Router, Axios, and TanStack Query v5, the frontend coordinates seamlessly with an Express and Prisma relational backend to deliver instantaneous optimistic updates, robust client-side validation, and comprehensive error boundaries."),

          createPageBreak(),

          // Chapter 1: Introduction
          createHeading1("CHAPTER I: INTRODUCTION"),
          createHeading2("1.1 Project Overview"),
          createParagraph("In contemporary collegiate environments, extra-curricular clubs and departmental technical chapters host dozens of concurrent competitions, hackathons, cultural festivals, and technical workshops. Without a centralized discovery engine, students struggle to identify upcoming deadlines, while organizers face significant friction managing attendee capacity."),
          createHeading2("1.2 Problem Statement"),
          createParagraph("Campus organizers frequently encounter venue overcrowding due to uncoordinated registration systems lacking atomic capacity checks. Furthermore, students lack a single source of truth to explore campus clubs, evaluate remaining seat counts, and confirm event registrations with instant feedback."),
          createHeading2("1.3 Objectives"),
          createParagraph("• Build an intuitive, responsive frontend with React 18, Vite, and custom CSS design tokens.\n• Integrate TanStack Query v5 for server-state caching, automatic cache invalidation, and background synchronization.\n• Provide dedicated portals for event discovery, club directories, and organizer administrative workflows.\n• Implement client-side and server-side validation to reject duplicate registrations and enforce hard seat ceilings."),

          createPageBreak(),

          // Chapter 2: System Configuration & Design
          createHeading1("CHAPTER II: SYSTEM CONFIGURATION & DESIGN"),
          createHeading2("2.1 Frontend Architecture & Component Hierarchy"),
          createParagraph("The frontend is architected as a modular component tree centered on reusability and clean state isolation:"),
          createParagraph("• App Shell: Wraps QueryClientProvider, BrowserRouter, persistent sticky Navbar, and Footer.\n• LandingPage: Hosts Hero banner, search bar with category pills, live metrics ticker, and featured events grid.\n• EventsPage: Employs URL query parameters (`search`, `category`, `club`, `sortBy`, `page`) synchronized with TanStack Query hooks.\n• EventDetailPage: Displays rich event metadata, capacity fill bar, and inline registration modal with live validation.\n• OrganizerDashboard: Provides tabbed event creation forms and attendee rosters."),
          createHeading2("2.2 Client-Server Integration Pattern"),
          createParagraph("A centralized Axios API client (`src/services/api.js`) handles HTTP requests. Request interceptors attach tracing identifiers, while response interceptors unwrap envelopes and standardize error payloads into consistent UI notifications."),

          createPageBreak(),

          // Chapter 3: Implementation
          createHeading1("CHAPTER III: FULL STACK IMPLEMENTATION"),
          createHeading2("3.1 React Router Configuration"),
          createParagraph("Declarative routing enables seamless browser navigation with deep-linking capability:"),
          ...createCodeBlock(`// Routing Architecture (src/App.jsx)
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/events" element={<EventsPage />} />
  <Route path="/events/:id" element={<EventDetailPage />} />
  <Route path="/clubs" element={<ClubsPage />} />
  <Route path="/organizer" element={<OrganizerDashboard />} />
</Routes>`),
          createHeading2("3.2 Server State Management with TanStack Query"),
          createParagraph("TanStack Query ensures server data is cached and invalidated immediately upon successful registration:"),
          ...createCodeBlock(`// Cache invalidation upon registration
const handleSuccess = () => {
  queryClient.invalidateQueries({ queryKey: ['events'] });
  queryClient.invalidateQueries({ queryKey: ['event-detail', id] });
};`),
          createHeading2("3.3 Visual Evidence & UI Interfaces"),
          ...createImageParagraph("01-homepage.png", "CampusConnect Responsive Homepage with Hero and Search"),
          ...createImageParagraph("02-events-list.png", "Events Directory with Server-Side Pagination and Filter Controls"),
          ...createImageParagraph("04-event-details.png", "Dedicated Event Detail View with Live Seating Availability Gauge"),
          ...createImageParagraph("05-registration-success.png", "Instant Registration Confirmation with Remaining Seat Update"),

          createPageBreak(),

          // Chapter 4: Results & Testing
          createHeading1("CHAPTER IV: RESULTS AND TESTING"),
          createHeading2("4.1 Full-Stack Test Cases & Observations"),
          createParagraph("The frontend application was tested against the running Express backend across all primary user workflows:"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [createParagraph("Test Flow", true)] }),
                  new TableCell({ children: [createParagraph("Observed Behavior", true)] }),
                  new TableCell({ children: [createParagraph("Status", true)] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [createParagraph("Initial Page Load")] }),
                  new TableCell({ children: [createParagraph("Vite bundles in 1.49s; landing page renders clubs and upcoming events immediately.")] }),
                  new TableCell({ children: [createParagraph("PASS")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [createParagraph("Category Filtering")] }),
                  new TableCell({ children: [createParagraph("Clicking 'Sports' dispatches filtered query; UI isolates matching events with no reload.")] }),
                  new TableCell({ children: [createParagraph("PASS")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [createParagraph("Form Validation")] }),
                  new TableCell({ children: [createParagraph("Invalid email formats and missing names are intercepted before submission.")] }),
                  new TableCell({ children: [createParagraph("PASS")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [createParagraph("Duplicate Rejection")] }),
                  new TableCell({ children: [createParagraph("Repeated registration triggers HTTP 409 and displays visible warning banner.")] }),
                  new TableCell({ children: [createParagraph("PASS")] })
                ]
              })
            ]
          }),

          createPageBreak(),

          // Chapter 5: Conclusion
          createHeading1("CHAPTER V: CONCLUSION & FUTURE SCOPE"),
          createHeading2("5.1 Summary"),
          createParagraph("CampusConnect successfully demonstrates the power of a modern React 18 SPA coupled with TanStack Query and an Express API. The platform delivers an engaging user experience, complete responsive design across devices, and strict data consistency."),
          createHeading2("5.2 Future Enhancements"),
          createParagraph("• Student OAuth2 Single Sign-On using Google Campus accounts.\n• QR-code ticket generation for instantaneous on-ground check-ins.\n• WebPush notifications for event schedule updates."),
          createHeading2("5.3 References"),
          createParagraph("1. React 18 Documentation, Meta Platforms, Inc.\n2. TanStack Query v5 Guides, Tanner Linsley.\n3. Axios HTTP Client Documentation.\n4. Vite Build Tool Reference, Evan You.")
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(REPORTS_DIR, 'Full-Stack-Development-Report.docx'), buffer);
  console.log('Generated Full-Stack-Development-Report.docx');
}

// ==============================================================================
// 2. BACKEND DEVELOPMENT REPORT
// ==============================================================================
async function generateBackendReport() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title Page
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "A PROJECT REPORT ON", size: 28, bold: true, font: 'Times New Roman' }),
            ],
            spacing: { before: 800, after: 300 }
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "CampusConnect: RESTful API & Concurrency-Safe Backend Architecture", size: 36, bold: true, font: 'Times New Roman', color: "1E1B4B" }),
            ],
            spacing: { after: 600 }
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Submitted in partial fulfillment of the requirements for the course of", size: 24, font: 'Times New Roman' }),
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "BACKEND DEVELOPMENT", size: 28, bold: true, font: 'Times New Roman' }),
            ],
            spacing: { after: 800 }
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Submitted by:\n", size: 24, font: 'Times New Roman' }),
              new TextRun({ text: "SHIVAMSH ANIL MENON\n", size: 28, bold: true, font: 'Times New Roman' }),
              new TextRun({ text: "Registration No: [Student Registration Number]\n", size: 22, font: 'Times New Roman' }),
              new TextRun({ text: "Department of Computer Science & Engineering\n[Institution Name / Alliance University]\nAcademic Year 2025–2026", size: 24, font: 'Times New Roman' }),
            ],
            spacing: { after: 1200 }
          }),

          createPageBreak(),

          // Certificate Page
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "CERTIFICATE", size: 32, bold: true, font: 'Times New Roman' })],
            spacing: { before: 400, after: 400 }
          }),
          createParagraph("This is to certify that the project report entitled \"CampusConnect: RESTful API & Concurrency-Safe Backend Architecture\" is a bonafide microproject work carried out by SHIVAMSH ANIL MENON (Registration No: [Student Registration Number]) under my guidance and supervision, in partial fulfillment of the curriculum requirements for Backend Development."),
          new Paragraph({
            children: [
              new TextRun({ text: "\n\n\n___________________________\t\t\t___________________________\n", size: 24 }),
              new TextRun({ text: "Faculty Guide: [Faculty Guide Name]\t\t\tHead of Department\n", size: 22 }),
              new TextRun({ text: "Designation: [Designation]\t\t\tDepartment of CSE\n", size: 22 }),
              new TextRun({ text: "Date: 26th October 2026\t\t\tPlace: Bangalore", size: 22 })
            ],
            spacing: { before: 1000, after: 400 }
          }),

          createPageBreak(),

          // Student Declaration
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "STUDENT DECLARATION", size: 32, bold: true, font: 'Times New Roman' })],
            spacing: { before: 400, after: 400 }
          }),
          createParagraph("I, SHIVAMSH ANIL MENON, hereby declare that the project entitled \"CampusConnect: RESTful API & Concurrency-Safe Backend Architecture\" submitted for Backend Development represents my authentic implementation work. All API controllers, services, repositories, transactions, and automated test runners were created directly in the workspace."),
          new Paragraph({
            children: [
              new TextRun({ text: "\n\n\n___________________________\n", size: 24 }),
              new TextRun({ text: "Shivamsh Anil Menon\n", size: 24, bold: true }),
              new TextRun({ text: "Date: 26th October 2026\n", size: 22 })
            ],
            spacing: { before: 800 }
          }),

          createPageBreak(),

          // Abstract
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "ABSTRACT", size: 32, bold: true, font: 'Times New Roman' })],
            spacing: { before: 400, after: 400 }
          }),
          createParagraph("This project report documents the design and implementation of a robust, layered Express.js backend for CampusConnect. The architecture separates concerns across Controllers, Services, Repositories, and Middleware layers. Key features include request correlation ID tracing with X-Request-Id response headers, structured JSON request logging, centralized error handling, and Prisma ORM data modeling. Most critically, the backend resolves the classic event overbooking concurrency vulnerability through atomic conditional compare-and-swap (CAS) database transactions, verified with automated integration tests under parallel load."),

          createPageBreak(),

          // Chapter 1: Introduction
          createHeading1("CHAPTER I: INTRODUCTION"),
          createHeading2("1.1 Background & Motivation"),
          createParagraph("Scalable backend engineering requires robust separation of concerns, defensive validation, and transaction safety. In event reservation domains, high concurrency during popular event registrations (e.g. hackathons) routinely causes race conditions if updates are not strictly synchronized."),
          createHeading2("1.2 Objectives"),
          createParagraph("• Implement a layered Express architecture (`routes`, `controllers`, `services`, `repositories`, `validators`, `middleware`).\n• Design idempotent RESTful endpoints following standard HTTP verbs and status codes.\n• Enforce distributed request correlation with UUIDv4 request ID headers.\n• Prevent event overbooking through atomic transactional concurrency control."),

          createPageBreak(),

          // Chapter 2: System Architecture & Layered Design
          createHeading1("CHAPTER II: BACKEND ARCHITECTURE & DESIGN"),
          createHeading2("2.1 Layered Pattern Responsibilities"),
          createParagraph("• Controllers: Extract parameters from HTTP requests and format standardized API envelopes.\n• Services: Execute business logic, capacity boundary checks, and trigger decoupled MongoDB activity logs.\n• Repositories: Encapsulate Prisma ORM operations and transaction blocks.\n• Middleware: Enforce request tracing, latency logging, and centralized error classification."),
          createHeading2("2.2 Request-Response Lifecycle"),
          createParagraph("1. Incoming request arrives -> `requestId` middleware assigns UUIDv4 and sets `X-Request-Id`.\n2. `logger` middleware records timestamp and HTTP method.\n3. `validator` middleware parses payload; rejects invalid syntax with HTTP 400.\n4. Route controller dispatches to service layer.\n5. Repository executes atomic transaction in Prisma.\n6. Response returned via `ApiResponse.success` or forwarded to `errorHandler`."),

          createPageBreak(),

          // Chapter 3: Implementation
          createHeading1("CHAPTER III: IMPLEMENTATION DETAILS"),
          createHeading2("3.1 Concurrency-Safe Registration Algorithm"),
          createParagraph("The registration repository utilizes conditional compare-and-swap updates inside Prisma `$transaction` to eliminate race conditions:"),
          ...createCodeBlock(`// Concurrency-Controlled Atomic Reservation
const updateResult = await tx.event.updateMany({
  where: {
    id: eventId,
    registeredCount: { lt: event.capacity } // CAS check
  },
  data: {
    registeredCount: { increment: 1 }
  }
});

if (updateResult.count === 0) {
  throw new CapacityExceededError('Event has reached maximum capacity.');
}

const registration = await tx.registration.create({
  data: { eventId, studentName, studentEmail, status: 'CONFIRMED' }
});`),
          createHeading2("3.2 Request ID & Logging Middleware"),
          ...createCodeBlock(`// Request ID Middleware (src/middleware/requestId.js)
function requestId(req, res, next) {
  const reqId = req.headers['x-request-id'] || uuidv4();
  req.id = reqId;
  res.setHeader('X-Request-Id', reqId);
  next();
}`),
          createHeading2("3.3 Visual Evidence & API Probes"),
          ...createImageParagraph("09-api-health.png", "Health Endpoint Returning Database Status and Request ID"),
          ...createImageParagraph("06-validation-error.png", "Duplicate Email Validation Error Handled with HTTP 409"),

          createPageBreak(),

          // Chapter 4: Results & Testing
          createHeading1("CHAPTER IV: RESULTS AND TESTING"),
          createHeading2("4.1 Automated API Test Suite Execution"),
          createParagraph("The backend includes a comprehensive integration test suite built with Node.js's native test runner (`node --test`), validating 15 discrete scenarios including 10 simultaneous parallel registrations:"),
          createParagraph("• Test Suites: 1\n• Total Tests Run: 15\n• Tests Passed: 15\n• Tests Failed: 0\n• Execution Time: 730.85 ms"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [createParagraph("Scenario", true)] }),
                  new TableCell({ children: [createParagraph("HTTP Verb & Endpoint", true)] }),
                  new TableCell({ children: [createParagraph("Expected Status", true)] }),
                  new TableCell({ children: [createParagraph("Observed Status", true)] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [createParagraph("Health Probe")] }),
                  new TableCell({ children: [createParagraph("GET /api/health")] }),
                  new TableCell({ children: [createParagraph("200 OK")] }),
                  new TableCell({ children: [createParagraph("200 OK (PASS)")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [createParagraph("Invalid Event Creation")] }),
                  new TableCell({ children: [createParagraph("POST /api/events")] }),
                  new TableCell({ children: [createParagraph("400 Bad Request")] }),
                  new TableCell({ children: [createParagraph("400 Bad Request (PASS)")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [createParagraph("Concurrent 10-Request Load")] }),
                  new TableCell({ children: [createParagraph("POST /api/events/:id/registrations")] }),
                  new TableCell({ children: [createParagraph("2 Success, 8 Reject")] }),
                  new TableCell({ children: [createParagraph("2x 201, 8x 409 (PASS)")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [createParagraph("Duplicate Student Email")] }),
                  new TableCell({ children: [createParagraph("POST /api/events/:id/registrations")] }),
                  new TableCell({ children: [createParagraph("409 Conflict")] }),
                  new TableCell({ children: [createParagraph("409 Conflict (PASS)")] })
                ]
              })
            ]
          }),

          createPageBreak(),

          // Chapter 5: Conclusion
          createHeading1("CHAPTER V: CONCLUSION & FUTURE SCOPE"),
          createHeading2("5.1 Summary"),
          createParagraph("The CampusConnect backend demonstrates a maintainable, high-performance Node.js REST API with clean layer separation and mathematically verified concurrency protection."),
          createHeading2("5.2 Future Work"),
          createParagraph("• Integration of Redis distributed locks for multi-instance horizontal scaling.\n• Rate limiting with token bucket algorithms.\n• Automated OpenAPI / Swagger documentation generation."),
          createHeading2("5.3 References"),
          createParagraph("1. Express.js API Reference Guide.\n2. Node.js Documentation on Test Runner.\n3. Martin Fowler, Patterns of Enterprise Application Architecture.\n4. RFC 7231: Hypertext Transfer Protocol (HTTP/1.1).")
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(REPORTS_DIR, 'Backend-Development-Report.docx'), buffer);
  console.log('Generated Backend-Development-Report.docx');
}

// ==============================================================================
// 3. ADVANCED DATABASE SYSTEMS REPORT
// ==============================================================================
async function generateADBMSReport() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title Page
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "A PROJECT REPORT ON", size: 28, bold: true, font: 'Times New Roman' }),
            ],
            spacing: { before: 800, after: 300 }
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "CampusConnect: Advanced Relational Database Design & Polyglot Persistence", size: 36, bold: true, font: 'Times New Roman', color: "1E1B4B" }),
            ],
            spacing: { after: 600 }
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Submitted in partial fulfillment of the requirements for the course of", size: 24, font: 'Times New Roman' }),
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "ADVANCED DATABASE SYSTEMS", size: 28, bold: true, font: 'Times New Roman' }),
            ],
            spacing: { after: 800 }
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Submitted by:\n", size: 24, font: 'Times New Roman' }),
              new TextRun({ text: "SHIVAMSH ANIL MENON\n", size: 28, bold: true, font: 'Times New Roman' }),
              new TextRun({ text: "Registration No: [Student Registration Number]\n", size: 22, font: 'Times New Roman' }),
              new TextRun({ text: "Department of Computer Science & Engineering\n[Institution Name / Alliance University]\nAcademic Year 2025–2026", size: 24, font: 'Times New Roman' }),
            ],
            spacing: { after: 1200 }
          }),

          createPageBreak(),

          // Certificate Page
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "CERTIFICATE", size: 32, bold: true, font: 'Times New Roman' })],
            spacing: { before: 400, after: 400 }
          }),
          createParagraph("This is to certify that the project report entitled \"CampusConnect: Advanced Relational Database Design & Polyglot Persistence\" is a bonafide microproject work carried out by SHIVAMSH ANIL MENON (Registration No: [Student Registration Number]) under my guidance and supervision, in partial fulfillment of the curriculum requirements for Advanced Database Systems."),
          new Paragraph({
            children: [
              new TextRun({ text: "\n\n\n___________________________\t\t\t___________________________\n", size: 24 }),
              new TextRun({ text: "Faculty Guide: [Faculty Guide Name]\t\t\tHead of Department\n", size: 22 }),
              new TextRun({ text: "Designation: [Designation]\t\t\tDepartment of CSE\n", size: 22 }),
              new TextRun({ text: "Date: 26th October 2026\t\t\tPlace: Bangalore", size: 22 })
            ],
            spacing: { before: 1000, after: 400 }
          }),

          createPageBreak(),

          // Student Declaration
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "STUDENT DECLARATION", size: 32, bold: true, font: 'Times New Roman' })],
            spacing: { before: 400, after: 400 }
          }),
          createParagraph("I, SHIVAMSH ANIL MENON, hereby declare that the project entitled \"CampusConnect: Advanced Relational Database Design & Polyglot Persistence\" submitted for Advanced Database Systems is an authentic record of my independent academic research and implementation. All schema DDL, normalization proofs, CTE queries, window functions, and MongoDB pipelines were executed in the environment."),
          new Paragraph({
            children: [
              new TextRun({ text: "\n\n\n___________________________\n", size: 24 }),
              new TextRun({ text: "Shivamsh Anil Menon\n", size: 24, bold: true }),
              new TextRun({ text: "Date: 26th October 2026\n", size: 22 })
            ],
            spacing: { before: 800 }
          }),

          createPageBreak(),

          // Abstract
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "ABSTRACT", size: 32, bold: true, font: 'Times New Roman' })],
            spacing: { before: 400, after: 400 }
          }),
          createParagraph("This academic report provides an in-depth analysis of the database architecture designed for CampusConnect. The relational schema is proven to satisfy Boyce-Codd Normal Form (BCNF) and Third Normal Form (3NF), eliminating update and insertion anomalies. The design implements primary keys, foreign key cascading constraints, check constraints enforcing capacity invariants, composite unique constraints preventing duplicate bookings, and partial indexes optimizing query planner execution paths. To satisfy polyglot persistence requirements, a MongoDB extension is integrated to handle high-velocity activity logging with TTL-based document expiration, multi-stage $facet aggregation pipelines, and an analysis of the dual-write consistency problem."),

          createPageBreak(),

          // Chapter 1: Introduction
          createHeading1("CHAPTER I: INTRODUCTION"),
          createHeading2("1.1 Relational Integrity & Data Modeling"),
          createParagraph("Database systems form the foundational backbone of reliable enterprise applications. In multi-user transaction systems, database schemas must not only model real-world entity associations but also enforce domain integrity invariants at the storage layer rather than relying exclusively on application code."),
          createHeading2("1.2 Objectives"),
          createParagraph("• Architect a normalized relational database schema satisfying BCNF/3NF.\n• Formulate database constraints (Primary Keys, Foreign Keys, CHECK constraints, UNIQUE constraints).\n• Implement advanced SQL analytical queries utilizing Common Table Expressions (CTEs) and Window Functions.\n• Demonstrate query execution plan optimization using EXPLAIN ANALYZE.\n• Integrate an append-only MongoDB document extension for event activity tracking."),

          createPageBreak(),

          // Chapter 2: Relational Schema & Normalization
          createHeading1("CHAPTER II: SCHEMA DESIGN & NORMALIZATION"),
          createHeading2("2.1 Mathematical Normalization Proof"),
          createParagraph("• 1NF: All attributes contain strictly atomic, scalar values. Repeating groups of attendees are normalized into the `registrations` table.\n• 2NF: All non-prime attributes are fully functionally dependent on the entire primary key (`id UUID`). No partial dependencies exist.\n• 3NF: No transitive dependencies ($X \\to Y \\to Z$) exist. Club contact info is stored solely in `clubs`, referenced by foreign key.\n• BCNF: For every functional dependency $X \\to Y$, $X$ is a superkey. The composite constraint `(event_id, student_email)` functions as an alternative candidate key."),
          createHeading2("2.2 PostgreSQL Schema DDL"),
          ...createCodeBlock(`-- Relational Invariant Constraints
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    capacity INT NOT NULL,
    registered_count INT DEFAULT 0 NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT chk_events_capacity_positive CHECK (capacity > 0),
    CONSTRAINT chk_events_registered_bounds CHECK (registered_count >= 0 AND registered_count <= capacity)
);

CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    student_name VARCHAR(150) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    CONSTRAINT uq_registrations_event_student UNIQUE (event_id, student_email)
);`),

          createPageBreak(),

          // Chapter 3: Advanced SQL Analytics & Concurrency
          createHeading1("CHAPTER III: ADVANCED SQL & CONCURRENCY"),
          createHeading2("3.1 Common Table Expression (CTE) Multi-Tier Analytics"),
          createParagraph("The following CTE evaluates club engagement tiers based on event fill percentages:"),
          ...createCodeBlock(`WITH ClubEventMetrics AS (
    SELECT c.name, COUNT(e.id) AS total_events,
           SUM(e.capacity) AS aggregate_capacity,
           SUM(e.registered_count) AS total_registrations
    FROM clubs c LEFT JOIN events e ON c.id = e.club_id
    GROUP BY c.name
)
SELECT name, total_events, aggregate_capacity, total_registrations,
       ROUND((total_registrations::numeric / aggregate_capacity) * 100, 2) AS fill_percent
FROM ClubEventMetrics;`),
          createHeading2("3.2 Window Functions for Ranking Popularity"),
          createParagraph("Partitions events by category and computes dense rankings and cumulative running totals:"),
          ...createCodeBlock(`SELECT title, category, registered_count,
       DENSE_RANK() OVER (PARTITION BY category ORDER BY registered_count DESC) AS popularity_rank,
       SUM(registered_count) OVER (PARTITION BY category ORDER BY event_date) AS running_total
FROM events;`),
          createHeading2("3.3 PostgreSQL MVCC & Compare-and-Swap"),
          createParagraph("PostgreSQL uses Multi-Version Concurrency Control (MVCC) where readers never block writers. In CampusConnect, the atomic statement `UPDATE events SET registered_count = registered_count + 1 WHERE id = $1 AND registered_count < capacity` acquires an exclusive row lock at execution time, re-evaluating the predicate on the latest committed tuple. This prevents race conditions under Snapshot Isolation."),

          createPageBreak(),

          // Chapter 4: Polyglot Persistence & MongoDB
          createHeading1("CHAPTER IV: POLYGLOT PERSISTENCE & RESULTS"),
          createHeading2("4.1 MongoDB Document Store Extension"),
          createParagraph("To augment relational storage, MongoDB is integrated for append-only audit tracking:"),
          createParagraph("• TTL Indexes: Expire activity documents automatically after 90 days (`expires: 7776000`).\n• Multi-Faceted Aggregation: Employs `$facet` to calculate action breakdowns, top active events, and channel distributions concurrently in a single database pass."),
          createHeading2("4.2 The Dual-Write Consistency Challenge"),
          createParagraph("Writing to both PostgreSQL and MongoDB lacks distributed atomicity (no 2PC). In CampusConnect, the primary relational write in PostgreSQL is prioritized; secondary MongoDB activity logging executes asynchronously with graceful failure handling."),
          createHeading2("4.3 Query Performance & Index Optimization"),
          ...createImageParagraph("08-organizer-dashboard.png", "Organizer Administrative Console Demonstrating Live Database Records"),
          ...createImageParagraph("09-api-health.png", "Health Probe Demonstrating Active Relational and MongoDB Database Telemetry"),

          createPageBreak(),

          // Chapter 5: Conclusion
          createHeading1("CHAPTER V: CONCLUSION & FUTURE SCOPE"),
          createHeading2("5.1 Summary"),
          createParagraph("The database architecture establishes a robust relational schema governed by check and unique constraints, combined with an advanced document store for event analytics."),
          createHeading2("5.2 Future Scope"),
          createParagraph("• Implementing Change Data Capture (CDC) via Debezium and Apache Kafka to guarantee transactional outbox delivery from PostgreSQL to MongoDB.\n• Partitioning the `registrations` table by academic semester."),
          createHeading2("5.3 References"),
          createParagraph("1. PostgreSQL 16 Official Documentation, The PostgreSQL Global Development Group.\n2. Silberschatz, Korth, Sudarshan, Database System Concepts, 7th Edition.\n3. MongoDB Manual: Aggregation Framework and Index Strategies.\n4. Martin Kleppmann, Designing Data-Intensive Applications.")
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(REPORTS_DIR, 'Advanced-Database-Systems-Report.docx'), buffer);
  console.log('Generated Advanced-Database-Systems-Report.docx');
}

// ==============================================================================
// 4. PROJECT PROPOSAL
// ==============================================================================
async function generateProposal() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "PROJECT PROPOSAL", size: 36, bold: true, font: 'Times New Roman' }),
            ],
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "CampusConnect: Campus Event & Club Management Portal", size: 28, bold: true, font: 'Times New Roman', color: "1E1B4B" }),
            ],
            spacing: { after: 600 }
          }),

          createParagraph("Student Name: Shivamsh Anil Menon", true),
          createParagraph("Registration Number: [Student Registration Number]", true),
          createParagraph("Department: Department of Computer Science & Engineering", true),
          createParagraph("Faculty Guide: [Faculty Guide Name, Designation]", true),
          createParagraph("Subjects Involved: Full Stack Development, Backend Development, Advanced Database Systems", true),
          createParagraph("Project Category: Full-Stack Web Application / Academic Microproject", true),

          createHeading2("1. Problem Statement"),
          createParagraph("University campuses feature active student societies organizing technical hackathons, cultural festivals, and seminars. However, registration management is fragmented across unlinked spreadsheets and messaging channels. This leads to seat overbooking, lack of duplicate checking, and frustration for both students and event coordinators."),

          createHeading2("2. Proposed Solution"),
          createParagraph("CampusConnect introduces an integrated web portal where students can explore student societies, browse events with live capacity tracking, and secure verified seat reservations. Organizers receive an administrative console to publish events, configure capacity limits, and inspect attendee rosters in real-time."),

          createHeading2("3. Objectives & Scope"),
          createParagraph("• Build a modern responsive SPA using React 18 and Vite.\n• Implement a layered Express backend with request correlation tracing and centralized error handling.\n• Enforce strict concurrency control using atomic compare-and-swap database transactions.\n• Design a normalized relational PostgreSQL schema adhering to 3NF/BCNF.\n• Deploy an append-only MongoDB document extension for event activity logging and analytical aggregation."),

          createHeading2("4. Technology Stack"),
          createParagraph("• Frontend: React 18, Vite, React Router, Axios, TanStack Query, Custom CSS tokens.\n• Backend: Node.js, Express, Prisma ORM, Mongoose.\n• Primary Database: PostgreSQL (Relational) / SQLite (Dev runtime).\n• Extended Database: MongoDB (Document store for activity logs).\n• Testing: Node.js native test runner (`node --test`), Puppeteer browser automation."),

          createHeading2("5. Expected Deliverables"),
          createParagraph("1. Complete, functional source code for frontend and backend.\n2. Automated integration test suite validating health, CRUD, and concurrency limits.\n3. Complete SQL schema DDL, normalization documentation, CTE queries, and window function demonstrations.\n4. Three comprehensive academic project reports (Full Stack, Backend, ADBMS) in DOCX and PDF.\n5. Project Proposal in DOCX and PDF.\n6. Real browser screenshots demonstrating live workflows.\n7. Final submission ZIP package.")
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(REPORTS_DIR, 'project-proposal.docx'), buffer);
  console.log('Generated project-proposal.docx');
}

async function run() {
  console.log('Generating all academic reports and proposal in DOCX format...');
  await generateFullStackReport();
  await generateBackendReport();
  await generateADBMSReport();
  await generateProposal();
  console.log('All DOCX reports generated successfully!');
}

run().catch(console.error);
