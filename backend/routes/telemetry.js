import express from 'express';
import stateService from '../services/stateService.js';
import aiService from '../services/aiService.js';

const router = express.Router();

// Retrieve all sensor telemetry
router.get('/sensors', (req, res) => {
  try {
    res.json(stateService.getSensors());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retrieve public transit and delay status
router.get('/transit', (req, res) => {
  try {
    res.json(stateService.getTransit());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retrieve sustainability consumption parameters
router.get('/sustainability', (req, res) => {
  try {
    res.json(stateService.getSustainability());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retrieve AI sustainability audit
router.get('/sustainability/audit', async (req, res) => {
  try {
    const suggestions = await aiService.generateSustainabilityReport();
    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retrieve recent system logs
router.get('/logs', (req, res) => {
  try {
    res.json(stateService.getLogs());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
