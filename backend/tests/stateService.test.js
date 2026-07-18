import test from 'node:test';
import assert from 'node:assert';
import stateService from '../services/stateService.js';

test('StateService initialization and initial values', (t) => {
  const sensors = stateService.getSensors();
  const transit = stateService.getTransit();
  const incidents = stateService.getIncidents();
  const sustainability = stateService.getSustainability();
  const logs = stateService.getLogs();

  assert.ok(Array.isArray(sensors), 'Sensors should be an array');
  assert.ok(Array.isArray(transit), 'Transit should be an array');
  assert.ok(Array.isArray(incidents), 'Incidents should be an array');
  assert.ok(sustainability && typeof sustainability === 'object', 'Sustainability should be an object');
  assert.ok(Array.isArray(logs), 'Logs should be an array');
});

test('StateService Incident Management', (t) => {
  const initialCount = stateService.getIncidents().length;
  
  // Add a new incident
  const mockIncident = {
    title: 'Water leak in section 104',
    category: 'FACILITY',
    priority: 'MEDIUM',
    location: 'Section 104'
  };

  const added = stateService.addIncident(mockIncident);
  assert.ok(added.id.startsWith('inc_'), 'Incident ID should start with inc_');
  assert.strictEqual(added.title, mockIncident.title);
  assert.strictEqual(added.category, mockIncident.category);
  assert.strictEqual(added.status, 'REPORTED');
  
  const incidents = stateService.getIncidents();
  assert.strictEqual(incidents.length, initialCount + 1);
  assert.strictEqual(incidents[0].id, added.id);

  // Update incident status
  const updated = stateService.updateIncidentStatus(added.id, 'ASSIGNED', 'Volunteer Jane');
  assert.ok(updated, 'Updated incident should be returned');
  assert.strictEqual(updated.status, 'ASSIGNED');
  assert.strictEqual(updated.assignedVolunteer, 'Volunteer Jane');

  // Try updating non-existent incident
  const missing = stateService.updateIncidentStatus('inc_invalid_999', 'RESOLVED');
  assert.strictEqual(missing, null, 'Updating non-existent incident should return null');
});

test('StateService Logging System', (t) => {
  const initialLogsCount = stateService.getLogs().length;

  stateService.addLog('SYSTEM', 'TEST_ACTION', 'This is a test log message');

  const logs = stateService.getLogs();
  assert.strictEqual(logs.length, initialLogsCount + 1);
  assert.strictEqual(logs[0].actor, 'SYSTEM');
  assert.strictEqual(logs[0].action, 'TEST_ACTION');
  assert.strictEqual(logs[0].message, 'This is a test log message');
  assert.ok(logs[0].id.startsWith('log_'), 'Log ID should start with log_');
});
