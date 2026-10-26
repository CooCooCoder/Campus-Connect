const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const app = require('../src/app');
const prisma = require('../src/config/db');

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await prisma.$disconnect();
});

async function apiRequest(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  const data = await response.json();
  return { status: response.status, headers: response.headers, body: data };
}

describe('CampusConnect Comprehensive API & Concurrency Test Suite', () => {

  test('1. GET /api/health responds with 200 and healthy database status', async () => {
    const res = await apiRequest('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'OK');
    assert.strictEqual(res.body.database.status, 'healthy');
    assert.ok(res.body.requestId, 'Response should contain requestId');
  });

  test('2. GET /api/events lists events with pagination metadata', async () => {
    const res = await apiRequest('/api/events?page=1&limit=5');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.strictEqual(res.body.data.length, 5);
    assert.ok(res.body.pagination);
    assert.strictEqual(res.body.pagination.currentPage, 1);
    assert.strictEqual(res.body.pagination.pageSize, 5);
    assert.ok(res.body.pagination.totalRecords >= 12);
  });

  test('3. GET /api/events with search filter returns matching events', async () => {
    const res = await apiRequest('/api/events?search=HackCampus');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length > 0);
    assert.ok(res.body.data[0].title.includes('HackCampus'));
  });

  test('4. GET /api/events with category filter returns only that category', async () => {
    const res = await apiRequest('/api/events?category=Sports');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length > 0);
    res.body.data.forEach(event => {
      assert.strictEqual(event.category, 'Sports');
    });
  });

  test('5. GET /api/events sorting by date works correctly', async () => {
    const res = await apiRequest('/api/events?sortBy=date&order=asc&limit=4');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    const dates = res.body.data.map(e => new Date(e.date).getTime());
    for (let i = 0; i < dates.length - 1; i++) {
      assert.ok(dates[i] <= dates[i + 1], 'Dates should be sorted ascending');
    }
  });

  test('6. GET /api/events/:id retrieves single event with club metadata', async () => {
    const listRes = await apiRequest('/api/events?limit=1');
    const eventId = listRes.body.data[0].id;

    const res = await apiRequest(`/api/events/${eventId}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.id, eventId);
    assert.ok(res.body.data.club, 'Event should eagerly load associated club');
    assert.ok(res.body.data.remainingSeats !== undefined);
  });

  test('7. POST /api/events rejects invalid payload with HTTP 400 Bad Request', async () => {
    const invalidPayload = {
      title: 'X', // too short
      description: 'short',
      category: 'InvalidCategory'
    };
    const res = await apiRequest('/api/events', {
      method: 'POST',
      body: JSON.stringify(invalidPayload)
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'BAD_REQUEST');
  });

  test('8. POST /api/events creates a valid event and PATCH updates it', async () => {
    const clubsRes = await apiRequest('/api/clubs');
    const clubId = clubsRes.body.data[0].id;

    const newEvent = {
      title: 'DevOps & Cloud Native Bootcamp 2026',
      description: 'Comprehensive hands-on workshop covering Docker, Kubernetes, and CI/CD automation pipelines.',
      category: 'Workshop',
      venue: 'Cloud Computing Lab 201',
      date: new Date(Date.now() + 864000000).toISOString(),
      capacity: 30,
      clubId
    };

    const createRes = await apiRequest('/api/events', {
      method: 'POST',
      body: JSON.stringify(newEvent)
    });
    assert.strictEqual(createRes.status, 201);
    const createdId = createRes.body.data.id;
    assert.strictEqual(createRes.body.data.title, newEvent.title);

    // Update event
    const updateRes = await apiRequest(`/api/events/${createdId}`, {
      method: 'PATCH',
      body: JSON.stringify({ capacity: 45, venue: 'Grand Auditorium East' })
    });
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.body.data.capacity, 45);
    assert.strictEqual(updateRes.body.data.venue, 'Grand Auditorium East');
  });

  test('9. POST /api/events/:id/registrations succeeds when seats are available', async () => {
    const listRes = await apiRequest('/api/events?limit=5');
    const availableEvent = listRes.body.data.find(e => e.remainingSeats > 2);

    const registrationPayload = {
      studentName: 'Tanya Sengupta',
      studentEmail: `tanya.${Date.now()}@campus.edu`
    };

    const res = await apiRequest(`/api/events/${availableEvent.id}/registrations`, {
      method: 'POST',
      body: JSON.stringify(registrationPayload)
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.registration.studentName, registrationPayload.studentName);
    assert.strictEqual(res.body.data.event.remainingSeats, availableEvent.remainingSeats - 1);
  });

  test('10. POST /api/events/:id/registrations rejects duplicate registration with HTTP 409 Conflict', async () => {
    const listRes = await apiRequest('/api/events?limit=10');
    const availableEvent = listRes.body.data.find(e => e.remainingSeats > 3);
    assert.ok(availableEvent, 'Should find an event with available seats');
    const eventId = availableEvent.id;
    const email = `duplicate.test.${Date.now()}@campus.edu`;

    // First registration
    const res1 = await apiRequest(`/api/events/${eventId}/registrations`, {
      method: 'POST',
      body: JSON.stringify({ studentName: 'Test Student', studentEmail: email })
    });
    assert.strictEqual(res1.status, 201);

    // Duplicate registration attempt
    const res2 = await apiRequest(`/api/events/${eventId}/registrations`, {
      method: 'POST',
      body: JSON.stringify({ studentName: 'Test Student', studentEmail: email })
    });
    assert.strictEqual(res2.status, 409);
    assert.strictEqual(res2.body.error.code, 'CONFLICT');
    assert.ok(res2.body.error.message.includes('already registered'));
  });

  test('11. POST /api/events/:id/registrations rejects nonexistent event with HTTP 404', async () => {
    const res = await apiRequest('/api/events/non-existent-uuid/registrations', {
      method: 'POST',
      body: JSON.stringify({ studentName: 'Ghost', studentEmail: 'ghost@campus.edu' })
    });
    assert.strictEqual(res.status, 404);
  });

  test('12. POST /api/events/:id/registrations rejects registration for FULL event with HTTP 409', async () => {
    const listRes = await apiRequest('/api/events?limit=50');
    const fullEvent = listRes.body.data.find(e => e.isFull === true || e.remainingSeats === 0);
    assert.ok(fullEvent, 'Seed data should provide at least one full event for testing');

    const res = await apiRequest(`/api/events/${fullEvent.id}/registrations`, {
      method: 'POST',
      body: JSON.stringify({ studentName: 'Late Student', studentEmail: 'late@campus.edu' })
    });
    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.body.error.code, 'CAPACITY_EXCEEDED');
  });

  test('13. POST /api/events/:id/registrations validates student email syntax', async () => {
    const listRes = await apiRequest('/api/events?limit=1');
    const eventId = listRes.body.data[0].id;

    const res = await apiRequest(`/api/events/${eventId}/registrations`, {
      method: 'POST',
      body: JSON.stringify({ studentName: 'No Email', studentEmail: 'not-an-email' })
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.error.code, 'BAD_REQUEST');
  });

  test('14. CONCURRENCY: Simultaneous registrations cannot exceed configured capacity', async () => {
    const clubsRes = await apiRequest('/api/clubs');
    const clubId = clubsRes.body.data[0].id;

    // Create a flash event with capacity of exactly 2 seats
    const flashEventRes = await apiRequest('/api/events', {
      method: 'POST',
      body: JSON.stringify({
        title: `Flash Competition ${Date.now()}`,
        description: 'High-intensity limited capacity quiz competition with exactly 2 seats.',
        category: 'Technical',
        venue: 'Room 101',
        date: new Date(Date.now() + 100000000).toISOString(),
        capacity: 2,
        clubId
      })
    });
    const flashEventId = flashEventRes.body.data.id;

    // Launch 10 simultaneous registration requests concurrently
    const parallelAttempts = Array.from({ length: 10 }, (_, i) => ({
      studentName: `Parallel Student ${i + 1}`,
      studentEmail: `parallel.${i + 1}.${Date.now()}@campus.edu`
    }));

    const results = await Promise.all(
      parallelAttempts.map(student =>
        apiRequest(`/api/events/${flashEventId}/registrations`, {
          method: 'POST',
          body: JSON.stringify(student)
        })
      )
    );

    const successful = results.filter(r => r.status === 201);
    const rejected = results.filter(r => r.status === 409);

    assert.strictEqual(successful.length, 2, 'Exactly 2 registrations should succeed');
    assert.strictEqual(rejected.length, 8, '8 registrations should be rejected due to capacity limit');

    // Confirm final event status
    const finalEventRes = await apiRequest(`/api/events/${flashEventId}`);
    assert.strictEqual(finalEventRes.body.data.registeredCount, 2);
    assert.strictEqual(finalEventRes.body.data.remainingSeats, 0);
    assert.strictEqual(finalEventRes.body.data.isFull, true);
  });

  test('15. GET /api/clubs retrieves club listing with event counts', async () => {
    const res = await apiRequest('/api/clubs');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 8);
    assert.ok(res.body.data[0]._count.events >= 0);
  });
});
