import test from 'node:test';
import assert from 'node:assert';
import aiService from '../services/aiService.js';
import stateService from '../services/stateService.js';

test('AIService - getMockFanResponse for EN queries', (t) => {
  stateService.stopSimulation();

  // Food
  const enFood = aiService.getMockFanResponse("Where is the food?", "en");
  assert.ok(enFood.includes("Concession C"), "Should match food Concession C");

  // Exit
  const enExit = aiService.getMockFanResponse("How to exit the stadium?", "en");
  assert.ok(enExit.includes("Gate 4") && enExit.includes("West Plaza"), "Should match exit Gate 4");

  // Gate
  const enGate = aiService.getMockFanResponse("Which gate is fastest?", "en");
  assert.ok(enGate.includes("Gate 4 is the fastest"), "Should match gate recommendation");

  // Medical
  const enMedical = aiService.getMockFanResponse("Where is the nearest medical aid station?", "en");
  assert.ok(enMedical.includes("First Aid Room A"), "Should match First Aid Room A");

  // Transit
  const enTransit = aiService.getMockFanResponse("Show me dynamic transit options to Downtown.", "en");
  assert.ok(enTransit.includes("Electric Shuttle") || enTransit.includes("Metro Line"), "Should match transit shuttle/metro options");

  // Sustainability
  const enSust = aiService.getMockFanResponse("Sustainable tips for fans.", "en");
  assert.ok(enSust.includes("compost bins") && enSust.includes("green"), "Should match sustainability green advice");

  // Default fallback
  const enDefault = aiService.getMockFanResponse("Some random query", "en");
  assert.ok(enDefault.startsWith("Welcome to FIFA 2026!"), "Should match default welcome response");
});

test('AIService - getMockFanResponse for ES (Spanish) queries', (t) => {
  stateService.stopSimulation();

  // Food
  const esFood = aiService.getMockFanResponse("¿Dónde hay comida?", "es");
  assert.ok(esFood.includes("Concesión C"), "Should match food Concesión C");

  // Sustainability
  const esSust = aiService.getMockFanResponse("Consejos de sostenibilidad.", "es");
  assert.ok(esSust.includes("compostaje") && esSust.includes("verde"), "Should match Spanish sustainability advice");

  // Medical
  const esMedical = aiService.getMockFanResponse("¿Dónde está la estación médica?", "es");
  assert.ok(esMedical.includes("Sala de Auxilio A"), "Should match Spanish medical aid");
});

test('AIService - getMockFanResponse for FR (French) queries', (t) => {
  stateService.stopSimulation();

  // Food
  const frFood = aiService.getMockFanResponse("Où trouver de la nourriture?", "fr");
  assert.ok(frFood.includes("Concession C"), "Should match food Concession C");

  // Sustainability
  const frSust = aiService.getMockFanResponse("Conseils durables.", "fr");
  assert.ok(frSust.includes("compostage") && frSust.includes("éco-responsables"), "Should match French sustainability advice");
});

test('AIService - generateFanResponse Fallback Behavior', async (t) => {
  stateService.stopSimulation();

  // Test that generateFanResponse works even if geminiClient fails or is missing (goes to mock)
  const response = await aiService.generateFanResponse("Sustainable tips for fans.", "en");
  assert.ok(response.includes("compost bins") || response.includes("green"), "Should return sustainability mock response under fallback");
});
