import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import telemetryRoutes from './routes/telemetry.js';
import incidentRoutes from './routes/incidents.js';
import aiRoutes from './routes/ai.js';
import stateService from './services/stateService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend port (3000)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS']
}));

app.use(express.json());

// In-Memory sliding-window Rate Limiting Middleware
const ipRequestCounts = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 120;

const rateLimiter = (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();

  if (!ipRequestCounts.has(ip)) {
    ipRequestCounts.set(ip, []);
  }

  const requestTimes = ipRequestCounts.get(ip);
  // Filter out requests outside the 1-minute window
  const activeRequests = requestTimes.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (activeRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    stateService.addLog("SECURITY", "RATE_LIMIT_EXCEEDED", `IP ${ip} exceeded API rate limit threshold.`);
    return res.status(429).json({ 
      error: "Too many requests", 
      message: `Limit exceeded. Max ${MAX_REQUESTS_PER_WINDOW} requests per minute.` 
    });
  }

  activeRequests.push(now);
  ipRequestCounts.set(ip, activeRequests);
  next();
};

app.use(rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: "HEALTHY",
    timestamp: new Date().toISOString(),
    simulationActive: true,
    activeIncidentsCount: stateService.getIncidents().filter(i => i.status !== 'RESOLVED').length
  });
});

// Register Module Routes
app.use('/api/v1/telemetry', telemetryRoutes);
app.use('/api/v1/incidents', incidentRoutes);
app.use('/api/v1/ai', aiRoutes);

// Serve static assets in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
}

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  stateService.addLog("SYSTEM", "ERROR_THROWN", err.message);
  
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message
  });
});

// Start Server Listener
app.listen(PORT, () => {
  console.log(`🚀 StadiumPulse AI Server listening on port ${PORT}`);
  stateService.addLog("SYSTEM", "SERVER_STARTUP", `Express listener established on port ${PORT}`);
});
