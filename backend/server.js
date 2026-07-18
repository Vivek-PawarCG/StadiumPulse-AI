import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import telemetryRoutes from './routes/telemetry.js';
import incidentRoutes from './routes/incidents.js';
import aiRoutes from './routes/ai.js';
import stateService from './services/stateService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with environment-aware origin restriction
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000'];

app.use(cors({
  origin: ALLOWED_ORIGINS,
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS']
}));

app.use(express.json());

// In-Memory sliding-window Rate Limiting Middleware
const ipRequestCounts = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 120;

// Periodic cleanup to prevent memory leaks from inactive IPs
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [ip, requestTimes] of ipRequestCounts.entries()) {
    const activeRequests = requestTimes.filter(time => now - time < RATE_LIMIT_WINDOW);
    if (activeRequests.length === 0) {
      ipRequestCounts.delete(ip);
    } else {
      ipRequestCounts.set(ip, activeRequests);
    }
  }
}, 5 * 60 * 1000);

// Ensure the interval timer doesn't prevent Node process termination during tests
if (cleanupInterval.unref) {
  cleanupInterval.unref();
}

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
  
  // Avoid leaking internal error details in production
  const clientMessage = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred. Please try again later.'
    : err.message;

  res.status(500).json({
    error: "Internal Server Error",
    message: clientMessage
  });
});

// Export the app for integration testing
export { app };

// Start Server Listener only when run directly (not imported by tests)
const isDirectRun = process.argv[1] && (process.argv[1].includes('server.js') || process.argv[1].includes('start'));
if (isDirectRun) {
  app.listen(PORT, () => {
    console.log(`🚀 StadiumPulse AI Server listening on port ${PORT}`);
    stateService.addLog("SYSTEM", "SERVER_STARTUP", `Express listener established on port ${PORT}`);
  });
}
