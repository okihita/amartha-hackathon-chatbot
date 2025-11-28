#!/bin/bash
set -e

PROJECT_ID="stellar-zoo-478021-v8"
REGION="asia-southeast2"
SERVICE_NAME="whatsapp-bot"
IMAGE_NAME="asia-southeast2-docker.pkg.dev/${PROJECT_ID}/whatsapp-bot/app:latest"

echo "🔨 Building container (optimized)..."
gcloud builds submit \
  --tag ${IMAGE_NAME} \
  --machine-type=e2-highcpu-8 \
  --quiet

echo "🚀 Deploying to Cloud Run..."
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
  --quiet

echo "✅ Deployment complete!"
echo "🌐 URL: https://${SERVICE_NAME}-435783355893.${REGION}.run.app"
