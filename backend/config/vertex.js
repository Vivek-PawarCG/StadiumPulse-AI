import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { VertexAI } from '@google-cloud/vertexai';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GCP_PROJECT = process.env.GCP_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || '';
const GCP_LOCATION = process.env.GCP_LOCATION || 'us-central1';

let geminiClient = null;
let vertexClient = null;

// Initialize Direct Gemini Client
if (GEMINI_API_KEY) {
  try {
    geminiClient = new GoogleGenerativeAI(GEMINI_API_KEY);
    console.log("✅ Google Gen AI (Direct Gemini) initialized successfully.");
  } catch (error) {
    console.error("❌ Failed to initialize Google Gen AI:", error.message);
  }
} else {
  console.warn("⚠️ GEMINI_API_KEY missing in .env. Fan Assistant will run on mock fallback mode.");
}

// Initialize Vertex AI Client
if (GCP_PROJECT) {
  try {
    vertexClient = new VertexAI({ project: GCP_PROJECT, location: GCP_LOCATION });
    console.log(`✅ Vertex AI SDK initialized for project: ${GCP_PROJECT}, region: ${GCP_LOCATION}`);
  } catch (error) {
    console.error("❌ Failed to initialize Vertex AI SDK:", error.message);
  }
} else {
  console.warn("⚠️ GCP_PROJECT missing in .env. Emergency Dispatch and Sustainability audits will run on mock fallback mode.");
}

export {
  geminiClient,
  vertexClient,
  GCP_PROJECT,
  GCP_LOCATION
};
