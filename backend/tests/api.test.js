import test from 'node:test';
import assert from 'node:assert';
import express from 'express';
import telemetryRoutes from '../routes/telemetry.js';
import incidentRoutes from '../routes/incidents.js';
import aiRoutes from '../routes/ai.js';
import stateService from '../services/stateService.js';

test('API Integration - Telemetry, Incidents and AI endpoints', async (t) => {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/telemetry', telemetryRoutes);
  app.use('/api/v1/incidents', incidentRoutes);
  app.use('/api/v1/ai', aiRoutes);

  // Start server on a dynamic port
  const server = app.listen(0);
  const { port } = server.address();
  const baseUrl = `http://localhost:${port}`;

  const cleanup = () => new Promise(resolve => server.close(resolve));

  try {
    // 1. GET /api/v1/telemetry/sensors
    const sensorsRes = await fetch(`${baseUrl}/api/v1/telemetry/sensors`);
    assert.strictEqual(sensorsRes.status, 200, 'GET sensors status should be 200');
    const sensors = await sensorsRes.json();
    assert.ok(Array.isArray(sensors), 'Sensors response should be an array');

    // 2. GET /api/v1/telemetry/transit
    const transitRes = await fetch(`${baseUrl}/api/v1/telemetry/transit`);
    assert.strictEqual(transitRes.status, 200, 'GET transit status should be 200');
    const transit = await transitRes.json();
    assert.ok(Array.isArray(transit), 'Transit response should be an array');

    // 3. GET /api/v1/telemetry/sustainability
    const sustainRes = await fetch(`${baseUrl}/api/v1/telemetry/sustainability`);
    assert.strictEqual(sustainRes.status, 200, 'GET sustainability status should be 200');
    const sustain = await sustainRes.json();
    assert.ok(sustain && typeof sustain === 'object', 'Sustainability response should be an object');

    // 4. POST /api/v1/ai/chat (English, Sustainability query)
    const chatRes = await fetch(`${baseUrl}/api/v1/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'Sustainable tips for fans.', language: 'en' })
    });
    assert.strictEqual(chatRes.status, 200, 'POST chat status should be 200');
    const chatData = await chatRes.json();
    assert.ok(chatData.response, 'Response should contain text');
    assert.ok(chatData.response.includes('green') || chatData.response.includes('compost'), 'Response should match sustainability mock template');

    // 5. POST /api/v1/incidents (Create incident)
    const incidentPayload = {
      title: 'Power failure at Concession A',
      category: 'FACILITY',
      priority: 'HIGH',
      location: 'Section 110 Concourse'
    };
    const createIncRes = await fetch(`${baseUrl}/api/v1/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incidentPayload)
    });
    assert.strictEqual(createIncRes.status, 201, 'POST incident status should be 201');
    const created = await createIncRes.json();
    assert.ok(created.incident.id, 'Created incident should have an ID');
    assert.strictEqual(created.incident.title, incidentPayload.title, 'Title should match');

    // 6. PATCH /api/v1/incidents/:id (Update incident)
    const patchRes = await fetch(`${baseUrl}/api/v1/incidents/${created.incident.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'RESOLVED', assignedVolunteer: 'Volunteer Team Alpha' })
    });
    assert.strictEqual(patchRes.status, 200, 'PATCH incident status should be 200');
    const patched = await patchRes.json();
    assert.strictEqual(patched.status, 'RESOLVED', 'Status should be updated to RESOLVED');
    assert.strictEqual(patched.assignedVolunteer, 'Volunteer Team Alpha', 'Volunteer assignment should match');

    // 7. POST /api/v1/ai/chat (Bad Payload - Validation check)
    const badChatRes = await fetch(`${baseUrl}/api/v1/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '', language: 'en' }) // Empty query (invalid)
    });
    assert.strictEqual(badChatRes.status, 400, 'Bad chat payload should return 400 Bad Request');

  } finally {
    await cleanup();
  }
});
