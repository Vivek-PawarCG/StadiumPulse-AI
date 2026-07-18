import test from 'node:test';
import assert from 'node:assert';
import { app } from '../server.js';

/**
 * API Integration Tests
 * Tests all HTTP endpoints, validation layers, edge cases, and the health check.
 */
test('API Integration - Health Check', async (t) => {
  const server = app.listen(0);
  const { port } = server.address();
  const baseUrl = `http://localhost:${port}`;
  const cleanup = () => new Promise(resolve => server.close(resolve));

  try {
    const res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.status, 200, 'Health check should return 200');
    const body = await res.json();
    assert.strictEqual(body.status, 'HEALTHY', 'Status should be HEALTHY');
    assert.ok(body.timestamp, 'Should include a timestamp');
    assert.ok(typeof body.activeIncidentsCount === 'number', 'Should include active incidents count');
  } finally {
    await cleanup();
  }
});

test('API Integration - Telemetry Endpoints', async (t) => {
  const server = app.listen(0);
  const { port } = server.address();
  const baseUrl = `http://localhost:${port}`;
  const cleanup = () => new Promise(resolve => server.close(resolve));

  try {
    // GET /api/v1/telemetry/sensors
    const sensorsRes = await fetch(`${baseUrl}/api/v1/telemetry/sensors`);
    assert.strictEqual(sensorsRes.status, 200, 'GET sensors should be 200');
    const sensors = await sensorsRes.json();
    assert.ok(Array.isArray(sensors), 'Sensors should be an array');
    assert.ok(sensors.length > 0, 'Sensors array should not be empty');
    assert.ok(sensors[0].name, 'Each sensor should have a name');
    assert.ok(typeof sensors[0].headCount === 'number', 'Each sensor should have headCount');

    // GET /api/v1/telemetry/transit
    const transitRes = await fetch(`${baseUrl}/api/v1/telemetry/transit`);
    assert.strictEqual(transitRes.status, 200, 'GET transit should be 200');
    const transit = await transitRes.json();
    assert.ok(Array.isArray(transit), 'Transit should be an array');

    // GET /api/v1/telemetry/sustainability
    const sustainRes = await fetch(`${baseUrl}/api/v1/telemetry/sustainability`);
    assert.strictEqual(sustainRes.status, 200, 'GET sustainability should be 200');
    const sustain = await sustainRes.json();
    assert.ok(sustain && typeof sustain === 'object', 'Sustainability should be an object');
    assert.ok(typeof sustain.powerKwh === 'number', 'Should have powerKwh');

    // GET /api/v1/telemetry/logs
    const logsRes = await fetch(`${baseUrl}/api/v1/telemetry/logs`);
    assert.strictEqual(logsRes.status, 200, 'GET logs should be 200');
    const logs = await logsRes.json();
    assert.ok(Array.isArray(logs), 'Logs should be an array');
  } finally {
    await cleanup();
  }
});

test('API Integration - AI Chat Endpoint', async (t) => {
  const server = app.listen(0);
  const { port } = server.address();
  const baseUrl = `http://localhost:${port}`;
  const cleanup = () => new Promise(resolve => server.close(resolve));

  try {
    // Valid sustainability query
    const chatRes = await fetch(`${baseUrl}/api/v1/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'Sustainable tips for fans.', language: 'en' })
    });
    assert.strictEqual(chatRes.status, 200, 'POST chat should return 200');
    const chatData = await chatRes.json();
    assert.ok(chatData.response, 'Response should contain text');
    assert.ok(
      chatData.response.includes('green') || chatData.response.includes('compost'),
      'Response should match sustainability mock template'
    );

    // Valid Spanish query
    const esChatRes = await fetch(`${baseUrl}/api/v1/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '¿Dónde hay comida?', language: 'es' })
    });
    assert.strictEqual(esChatRes.status, 200, 'Spanish chat should return 200');
    const esData = await esChatRes.json();
    assert.ok(esData.response.includes('Concesión C'), 'Spanish response should match food mock');
  } finally {
    await cleanup();
  }
});

test('API Integration - AI Chat Validation (Bad Payloads)', async (t) => {
  const server = app.listen(0);
  const { port } = server.address();
  const baseUrl = `http://localhost:${port}`;
  const cleanup = () => new Promise(resolve => server.close(resolve));

  try {
    // Empty query string (violates z.string().min(1))
    const emptyRes = await fetch(`${baseUrl}/api/v1/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '', language: 'en' })
    });
    assert.strictEqual(emptyRes.status, 400, 'Empty query should return 400');

    // Missing query field entirely
    const missingRes = await fetch(`${baseUrl}/api/v1/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: 'en' })
    });
    assert.strictEqual(missingRes.status, 400, 'Missing query field should return 400');

    // Query exceeding max length (500 chars)
    const longQuery = 'x'.repeat(501);
    const longRes = await fetch(`${baseUrl}/api/v1/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: longQuery, language: 'en' })
    });
    assert.strictEqual(longRes.status, 400, 'Overlong query should return 400');
  } finally {
    await cleanup();
  }
});

test('API Integration - Incident CRUD and Validation', async (t) => {
  const server = app.listen(0);
  const { port } = server.address();
  const baseUrl = `http://localhost:${port}`;
  const cleanup = () => new Promise(resolve => server.close(resolve));

  try {
    // CREATE a valid incident
    const incidentPayload = {
      title: 'Power failure at Concession A',
      category: 'FACILITY',
      priority: 'HIGH',
      location: 'Section 110 Concourse'
    };
    const createRes = await fetch(`${baseUrl}/api/v1/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incidentPayload)
    });
    assert.strictEqual(createRes.status, 201, 'POST incident should return 201');
    const created = await createRes.json();
    assert.ok(created.incident.id, 'Created incident should have an ID');
    assert.strictEqual(created.incident.title, incidentPayload.title, 'Title should match');
    assert.ok(created.aiAnalysis, 'Should include aiAnalysis from Vertex AI mock');
    assert.ok(created.aiAnalysis.severity, 'AI analysis should include severity');

    // PATCH (update) the incident
    const patchRes = await fetch(`${baseUrl}/api/v1/incidents/${created.incident.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'RESOLVED', assignedVolunteer: 'Volunteer Team Alpha' })
    });
    assert.strictEqual(patchRes.status, 200, 'PATCH incident should return 200');
    const patched = await patchRes.json();
    assert.strictEqual(patched.status, 'RESOLVED', 'Status should be updated to RESOLVED');
    assert.strictEqual(patched.assignedVolunteer, 'Volunteer Team Alpha', 'Volunteer should match');

    // PATCH non-existent incident
    const notFoundRes = await fetch(`${baseUrl}/api/v1/incidents/inc_nonexistent_999`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'RESOLVED' })
    });
    assert.strictEqual(notFoundRes.status, 404, 'Non-existent incident PATCH should return 404');

    // CREATE with invalid category (validation failure)
    const badIncident = {
      title: 'Short',
      category: 'INVALID_CATEGORY',
      priority: 'HIGH',
      location: 'Somewhere'
    };
    const badRes = await fetch(`${baseUrl}/api/v1/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(badIncident)
    });
    assert.strictEqual(badRes.status, 400, 'Invalid category should return 400');

    // CREATE with title too short (< 5 chars)
    const shortTitle = {
      title: 'Hi',
      category: 'MEDICAL',
      priority: 'HIGH',
      location: 'Gate 1'
    };
    const shortRes = await fetch(`${baseUrl}/api/v1/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shortTitle)
    });
    assert.strictEqual(shortRes.status, 400, 'Title too short should return 400');

    // GET all incidents (verify list returns array)
    const listRes = await fetch(`${baseUrl}/api/v1/incidents`);
    assert.strictEqual(listRes.status, 200, 'GET incidents should return 200');
    const list = await listRes.json();
    assert.ok(Array.isArray(list), 'Incidents list should be an array');
  } finally {
    await cleanup();
  }
});
