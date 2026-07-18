# StadiumPulse AI 🏟️
### FIFA World Cup 2026 Smart Stadium Operations Command Center

StadiumPulse AI is an intelligent, real-time command center designed to optimize stadium logistics, manage crowd control, triage safety incidents, and assist fans during high-traffic sports events like the FIFA World Cup 2026. 

By combining real-time telemetry simulation with Google Gen AI and Google Cloud Vertex AI, StadiumPulse AI bridges the gap between raw data and actionable operational intelligence.

---

## ✨ Key Features

### 1. 👮 Ops Commander Dashboard
* **Crowding Visualizer**: Live telemetry feed tracking headcount percentages and queue wait times for stadium gates and food concessions.
* **AI Dispatch Protocol**: Automated incident analysis powered by **Vertex AI**. Instantly triages reports (e.g., ticket scanner outages, medical emergencies), assigns severity levels, generates responder instructions, and designs localized fan rerouting advice.

### 2. 💬 Fan Assistant (Accessibility-First)
* **Smart Concierge**: A low-latency conversational assistant powered by the **Google Gen AI Developer API (`gemini-2.5-flash-lite`)** to guide fans on concessions queues, gate exit times, and transit options.
* **WCAG 2.2 AA Compliant**:
  * **Contrast Toggle**: Extreme contrast mode for visual clarity.
  * **Text Scaling**: Interactive font resizing (SM, MD, LG, XL).
  * **Screen Reader**: Built-in Text-to-Speech (TTS) engine.
  * **Voice Input**: Speech-to-text voice recognition for hands-free queries.

### 3. ♻️ Transit & Sustainability Dashboard
* **Green Transit Options**: Tracks delays and schedules for electric shuttles and metro lines to encourage zero-emission travel.
* **FIFA Green Initiative Auditor**: Real-time energy audits evaluating solar energy generation surplus and waste sorting splits (recyclables vs compost vs landfill), generating AI recommendation logs to optimize stadium resource usage on the fly.

### 4. 👷 Volunteer Portal
* A localized portal for stadium helpers to coordinate, view active incident assignments, and receive broadcast instructions from the dispatcher.

---

## 🛠️ Technology Stack

* **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, and standard web speech APIs.
* **Backend**: Node.js & Express.js.
* **AI Integration**:
  * **Google Gen AI SDK** (`@google/generative-ai`) for direct, low-latency client-facing queries.
  * **Vertex AI Node.js SDK** (`@google-cloud/vertexai`) for secure, structured enterprise dispatch and sustainability operations.
* **Infrastructure & SRE**: Ready for Google Cloud Run, Cloud Build, GCP Secret Manager, Cloud Logging, and Cloud Monitoring.

---

## 📂 Project Structure

```text
StadiumPulse-AI/
├── backend/                  # Node.js + Express backend
│   ├── config/               # Vertex AI and Direct Gemini configurations
│   ├── data/                 # In-memory simulator data
│   ├── routes/               # Express endpoints (Telemetry, Incidents, AI)
│   ├── services/             # AI Coordination and State Management services
│   └── server.js             # Main server entrypoint
├── frontend/                 # Vite + React frontend
│   ├── src/
│   │   ├── components/       # Operations panels (Command center, Fan assistant, etc.)
│   │   ├── App.jsx           # Main portal shell
│   │   ├── index.css         # Styling system
│   │   └── main.jsx          # React app mounting
│   └── vite.config.js        # Vite + Proxy settings
├── .env                      # Global environment configurations
├── Dockerfile                # Multi-stage production build configuration
├── gcp_deploy_guide.md       # GCP Cloud Run deployment guidelines
└── README.md                 # Project overview and documentation
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v18+) installed.

### 2. Installation
Clone the repository and install the dependencies for all layers:

```bash
# Install root workspace runner dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 3. Environment Variables
Create a `.env` file in the **root** directory (or edit the existing `.env` template):

```env
# Server Configuration
PORT=5000

# Direct Google Gen AI (Gemini Developer API)
GEMINI_API_KEY=your_gemini_api_key_here

# Enterprise Google Cloud Vertex AI
GCP_PROJECT=your_gcp_project_id_here
GCP_LOCATION=us-central1
```

*Note: If no API keys are provided, both the Fan Assistant and the Dispatch Protocols automatically degrade to high-fidelity mock fallback modes, allowing offline development.*

### 4. Running the App
Run the following command at the **root** of the workspace to start the frontend and backend servers concurrently:

```bash
npm run dev
```

* Backend server will run on `http://localhost:5000`
* Frontend dev server will run on `http://localhost:3000` (automatically proxying `/api` requests to the backend)

---

## 🧪 Testing

StadiumPulse AI includes a unit test suite to verify state management, simulation state changes, and the multi-lingual AI mock fallback handlers. The tests are written using the built-in, lightweight Node.js test runner.

To execute the test suite, run the following command at the **root** of the workspace:

```bash
npm test
```

---

## 📦 Production Deployment

For step-by-step instructions on deploying StadiumPulse AI containerized to **Google Cloud Run** using Google Cloud Build, GCP Secret Manager, and setting up SRE Latency Alerts on Cloud Monitoring, follow the details in the [GCP Deployment Guide](file:///c:/Users/vivpawar/Downloads/Something%20New/2026_Projects/StadiumPulse-AI/gcp_deploy_guide.md).
