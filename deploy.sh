#!/bin/bash
set -e

PROJECT_ID="stellar-zoo-478021-v8"
REGION="asia-southeast2"
SERVICE_NAME="whatsapp-bot"
IMAGE_NAME="asia-southeast2-docker.pkg.dev/${PROJECT_ID}/whatsapp-bot/app:latest"

echo "🔨 Building container..."
gcloud builds submit --tag ${IMAGE_NAME} --quiet

echo "🚀 Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --region ${REGION} \
  --platform managed \
  --allow-unauthenticated \
  --quiet

echo "✅ Deployment complete!"
echo "🌐 URL: https://${SERVICE_NAME}-435783355893.${REGION}.run.app"
