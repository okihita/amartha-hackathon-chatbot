#!/bin/bash
set -e

# Get project ID from gcloud config
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
  echo "❌ Error: No GCP project configured. Run: gcloud config set project YOUR_PROJECT_ID"
  exit 1
fi

# Get project number for Cloud Run URL
PROJECT_NUMBER=$(gcloud projects describe ${PROJECT_ID} --format='value(projectNumber)')

REGION="asia-southeast2"
SERVICE_NAME="whatsapp-bot"
IMAGE_NAME="asia-southeast2-docker.pkg.dev/${PROJECT_ID}/whatsapp-bot/app:latest"

echo "🔨 Building container (optimized)..."
gcloud builds submit \
  --tag ${IMAGE_NAME} \
  --machine-type=e2-highcpu-8 \
  --quiet

echo "🚀 Deploying to Cloud Run..."

# Load env vars from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --region ${REGION} \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0 \
  --timeout 300 \
  --concurrency 80 \
  --set-env-vars "GCP_PROJECT_ID=${PROJECT_ID},MY_VERIFY_TOKEN=${MY_VERIFY_TOKEN},WHATSAPP_TOKEN=${WHATSAPP_TOKEN},PHONE_NUMBER_ID=${PHONE_NUMBER_ID},GEMINI_API_KEY=${GEMINI_API_KEY}" \
  --quiet

echo "✅ Deployment complete!"
echo "🌐 URL: https://${SERVICE_NAME}-${PROJECT_NUMBER}.${REGION}.run.app"
