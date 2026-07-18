globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import CommandDashboard from '../src/components/CommandDashboard';

const mockSensors = [
  { id: 's1', name: 'Gate 1 - North', type: 'GATE', headCount: 750, limit: 1000, currentWaitMin: 12, predictedWaitMin15: 14, status: 'SAFE' },
  { id: 's2', name: 'Gate 2 - East', type: 'GATE', headCount: 980, limit: 1000, currentWaitMin: 22, predictedWaitMin15: 25, status: 'CRITICAL' },
  { id: 's3', name: 'Concession A', type: 'CONCESSION', headCount: 200, limit: 250, currentWaitMin: 18, predictedWaitMin15: 20, status: 'WARNING' },
];

const mockIncidents = [
  { id: 'inc_001', title: 'Overcrowding at Gate 2', category: 'CROWD_MANAGEMENT', priority: 'CRITICAL', location: 'East Plaza', status: 'REPORTED', aiResolution: 'Reroute to Gate 4', createdAt: new Date().toISOString() },
  { id: 'inc_002', title: 'Water leak', category: 'FACILITY', priority: 'MEDIUM', location: 'Section 104', status: 'RESOLVED', createdAt: new Date().toISOString() },
];

describe('CommandDashboard Component', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });

  it('renders KPI cards with correct telemetry data', () => {
    act(() => {
      const root = createRoot(container);
      root.render(
        <CommandDashboard
          sensors={mockSensors}
          incidents={mockIncidents}
          onReportIncident={() => {}}
          onResolveIncident={() => {}}
          isLoading={false}
        />
      );
    });

    const text = container.textContent;

    // Check headcount KPI (sum of GATE headCounts: 750 + 980 = 1730)
    expect(text).toContain('1,730');

    // Check congested zones count (only CRITICAL sensors)
    expect(text).toContain('1 Zones');

    // Check active alerts count (only non-RESOLVED incidents: 1)
    expect(text).toContain('1 Urgent');
  });

  it('displays active incidents with AI dispatch info', () => {
    act(() => {
      const root = createRoot(container);
      root.render(
        <CommandDashboard
          sensors={mockSensors}
          incidents={mockIncidents}
          onReportIncident={() => {}}
          onResolveIncident={() => {}}
          isLoading={false}
        />
      );
    });

    const text = container.textContent;

    // Active incident title is visible
    expect(text).toContain('Overcrowding at Gate 2');

    // AI resolution is visible
    expect(text).toContain('Reroute to Gate 4');

    // Resolved incident should NOT appear in active alerts
    expect(text).not.toContain('Water leak');
  });

  it('renders the incident report form with all required fields', () => {
    act(() => {
      const root = createRoot(container);
      root.render(
        <CommandDashboard
          sensors={mockSensors}
          incidents={mockIncidents}
          onReportIncident={() => {}}
          onResolveIncident={() => {}}
          isLoading={false}
        />
      );
    });

    // Check form elements exist
    const inputs = container.querySelectorAll('input[type="text"]');
    expect(inputs.length).toBe(2); // title + location

    const selects = container.querySelectorAll('select');
    expect(selects.length).toBe(2); // category + priority

    const submitBtn = container.querySelector('button[type="submit"]');
    expect(submitBtn).not.toBeNull();
    expect(submitBtn.textContent).toContain('Trigger Vertex AI Audit');
  });
});
