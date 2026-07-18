globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import FanAssistant from '../src/components/FanAssistant';

describe('FanAssistant Component', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });

  it('renders initial welcome message and quick prompts', () => {
    act(() => {
      const root = createRoot(container);
      root.render(<FanAssistant />);
    });

    // Check welcome message is displayed
    const welcomeMsg = container.querySelector('p');
    expect(welcomeMsg).not.toBeNull();
    expect(welcomeMsg.textContent).toContain('StadiumPulse AI Fan Assistant');

    // Check prompt buttons are rendered
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('toggles language when language buttons are clicked', () => {
    act(() => {
      const root = createRoot(container);
      root.render(<FanAssistant />);
    });

    const buttons = Array.from(container.querySelectorAll('button'));
    const esButton = buttons.find(b => b.textContent.trim() === 'ES');
    expect(esButton).not.toBeNull();

    // Click Spanish language button
    act(() => {
      esButton.click();
    });

    // Verify input placeholder changes to Spanish
    const input = container.querySelector('input');
    expect(input.placeholder).toBe('Pregúntame algo...');
  });

  it('toggles contrast mode when WCAG Contrast button is clicked', () => {
    act(() => {
      const root = createRoot(container);
      root.render(<FanAssistant />);
    });

    const buttons = Array.from(container.querySelectorAll('button'));
    const contrastToggle = buttons.find(b => b.getAttribute('aria-label') === 'Toggle High Contrast Mode');
    expect(contrastToggle).not.toBeNull();

    // Click contrast toggle
    act(() => {
      contrastToggle.click();
    });

    // Verify contrast toggle text changes to ON
    expect(contrastToggle.textContent.trim()).toBe('ON');
  });
});
