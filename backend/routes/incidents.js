import express from 'express';
import { z } from 'zod';
import stateService from '../services/stateService.js';
import aiService from '../services/aiService.js';

const router = express.Router();

// Zod Schema for validation
const incidentCreateSchema = z.object({
  title: z.string().min(5).max(100),
  category: z.enum(["MEDICAL", "SECURITY", "FACILITY", "CROWD_MANAGEMENT", "SUSTAINABILITY"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  location: z.string().min(3),
  description: z.string().optional()
});

const incidentUpdateSchema = z.object({
  status: z.enum(["REPORTED", "DISPATCHED", "RESOLVED", "ARCHIVED"]),
  assignedVolunteer: z.string().optional()
});

// Retrieve all incidents
router.get('/', (req, res) => {
  try {
    res.json(stateService.getIncidents());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new incident (and run Vertex AI safety response coordinator)
router.post('/', async (req, res) => {
  try {
    const validation = incidentCreateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: "Validation failed", details: validation.error.format() });
    }

    const { title, category, priority, location } = validation.data;

    // Call Vertex AI to get immediate safety and dispatch recommendations
    console.log(`🧠 Triggering Vertex AI safety protocol for: ${title}`);
    const aiResponse = await aiService.generateSafetyResponse(title, location, category);

    // Create incident log and record
    const incidentData = {
      title,
      category,
      priority,
      location,
      aiResolution: aiResponse.instructions + "\n\n" + `Rerouting Guidance: ${aiResponse.rerouteAdvice}`
    };

    const newIncident = stateService.addIncident(incidentData);
    
    res.status(201).json({
      incident: newIncident,
      aiAnalysis: aiResponse
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update incident status/assignment
router.patch('/:id', (req, res) => {
  try {
    const validation = incidentUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: "Validation failed", details: validation.error.format() });
    }

    const { id } = req.params;
    const { status, assignedVolunteer } = validation.data;

    const updated = stateService.updateIncidentStatus(id, status, assignedVolunteer);
    if (!updated) {
      return res.status(404).json({ error: "Incident not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
