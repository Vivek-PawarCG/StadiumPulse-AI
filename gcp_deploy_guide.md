# Google Cloud Platform (GCP) Deployment & Operations Guide

This guide details the step-by-step commands to configure, secure, build, and deploy **StadiumPulse AI** to Google Cloud Run, leveraging GCP Secret Manager, Vertex AI, Cloud Logging, and Cloud Monitoring.

---

## 🛠️ Phase 1: Environment Variables Setup
Run these commands in your local bash shell to define the deployment variables:

```bash
# Set your GCP Project ID
export PROJECT_ID="stadiumpulse-ai-2026"

# Set target region (highly recommended us-central1 for Vertex AI and Gemini support)
export REGION="us-central1"

# Service name on Cloud Run
export SERVICE_NAME="stadiumpulse-center"

# Artifact registry repository name
export REPO_NAME="stadiumpulse-repo"

# Set the active project in gcloud CLI
gcloud config set project $PROJECT_ID
```

---

## 🔑 Phase 2: Enable Necessary Google Cloud APIs
Enable the Google Cloud APIs required for Serverless Compute, Container Registries, Secret Storage, Generative AI, and Logging/Monitoring:

```bash
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  aiplatform.googleapis.com \
  logging.googleapis.com \
  monitoring.googleapis.com \
  cloudbuild.googleapis.com
```

---

## 🔒 Phase 3: Setup Secret Manager & Gemini API Key
Create a secret to store your Gemini Developer API Key, keeping it out of the container image and environment configuration:

```bash
# Create the secret holder
gcloud secrets create gemini-api-key \
  --replication-policy="automatic" \
  --description="Gemini Developer API Key for StadiumPulse AI Fan Assistant"

# Add your actual API key as version 1 of the secret
# Replace "AIzaSy..." with your actual Google Gemini API Key
echo -n "AIzaSyYourGeminiApiKeyHere" | gcloud secrets versions add gemini-api-key --data-file=-
```

---

## 🛂 Phase 4: Configure IAM Roles for Cloud Run Service Account
To comply with the principle of least privilege, grant the Cloud Run runtime service account permission to access Secret Manager and call the Vertex AI APIs:

```bash
# Get the project number
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

# Define the default Compute Engine service account used by Cloud Run
export RUN_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

# 1. Grant permission to access the Gemini API Key Secret
gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:${RUN_SA}" \
  --role="roles/secretmanager.secretAccessor"

# 2. Grant permission to call Vertex AI (Gemini 2.5 models)
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${RUN_SA}" \
  --role="roles/aiplatform.user"

# 3. Grant permission to write logs (Cloud Logging)
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${RUN_SA}" \
  --role="roles/logging.logWriter"

# 4. Grant permission to write monitoring telemetry (Cloud Monitoring)
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${RUN_SA}" \
  --role="roles/monitoring.metricWriter"
```

---

## 📦 Phase 5: Build & Push Container Image using Cloud Build
Create a repository in **Artifact Registry** and build the Docker container using **Cloud Build**:

```bash
# Create the Artifact Registry docker repository
gcloud artifacts repositories create $REPO_NAME \
  --repository-format=docker \
  --location=$REGION \
  --description="StadiumPulse Container Repository"

# Trigger Google Cloud Build to compile React, pack Express, and store the image
gcloud builds submit --tag ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${SERVICE_NAME}:latest .
```

---

## 🚀 Phase 6: Deploy to Google Cloud Run
Deploy the container to Cloud Run, mounting the Secret Manager secret to the `GEMINI_API_KEY` environment variable:

```bash
gcloud run deploy $SERVICE_NAME \
  --image="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${SERVICE_NAME}:latest" \
  --region=$REGION \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --set-env-vars="NODE_ENV=production,GCP_PROJECT=${PROJECT_ID},GCP_LOCATION=${REGION}" \
  --set-secrets="GEMINI_API_KEY=gemini-api-key:latest"
```

---

## 📈 Phase 7: Configure Monitoring & Alerts (SRE Ops)

### 1. View Logs (Cloud Logging)
Stream live operations and AI coordination logs directly from Cloud Run:
```bash
gcloud beta run services logs tail $SERVICE_NAME --region=$REGION
```

### 2. Configure Cloud Monitoring Alert Policy
Create a JSON configuration file `latency_alert.json` to trigger an alert if Vertex AI or API endpoint latency exceeds 3 seconds:

```json
{
  "displayName": "StadiumPulse Latency Warning",
  "combiner": "OR",
  "conditions": [
    {
      "displayName": "HTTP latency > 3000ms",
      "conditionThreshold": {
        "filter": "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"stadiumpulse-center\" AND metric.type=\"run.googleapis.com/request_latencies\"",
        "aggregations": [
          {
            "alignmentPeriod": "60s",
            "perSeriesAligner": "ALIGN_PERCENTILE_99"
          }
        ],
        "comparison": "COMPARISON_GT",
        "thresholdValue": 3000,
        "duration": "180s",
        "trigger": {
          "count": 1
        }
      }
    }
  ]
}
```

Deploy the Alert Policy:
```bash
gcloud alpha monitoring policies create --policy-from-file=latency_alert.json
```
