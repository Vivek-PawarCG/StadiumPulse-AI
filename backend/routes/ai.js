import express from 'express';
import { z } from 'zod';
import aiService from '../services/aiService.js';

const router = express.Router();

const chatSchema = z.object({
  query: z.string().min(1).max(500),
  language: z.string().default('en')
});

// Chat endpoint (uses Google Gen AI Developer API for low latency fan queries)
router.post('/chat', async (req, res) => {
  try {
    const validation = chatSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: "Validation failed", details: validation.error.format() });
    }

    const { query, language } = validation.data;
    
    console.log(`💬 Requesting Direct Gemini response for: "${query}" in language "${language}"`);
    const aiResponse = await aiService.generateFanResponse(query, language);

    res.json({ response: aiResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
