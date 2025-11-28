# Setup Guide

Complete installation and configuration guide for Amartha WhatsApp Chatbot.

## Prerequisites

### Required
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Google Cloud Platform** account ([Sign up](https://cloud.google.com/))
- **WhatsApp Business API** access ([Apply](https://business.whatsapp.com/))
- **Gemini API** key ([Get key](https://makersuite.google.com/app/apikey))

### Optional
- **Docker** for containerization
- **gcloud CLI** for deployment
- **Git** for version control

## Local Development Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd wa-chatbot-gcp-ai
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web server
- `@google-cloud/firestore` - Database
- `@google/generative-ai` - Gemini AI
- `axios` - HTTP client
- `body-parser` - Request parsing
- `cors` - Cross-origin requests

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```bash
# WhatsApp Configuration
MY_VERIFY_TOKEN=my_secret_token_123
WHATSAPP_TOKEN=EAAxxxxxxxxxxxxx
PHONE_NUMBER_ID=123456789012345

# Gemini AI
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Google Cloud
GCP_PROJECT_ID=your-project-id

# Server
PORT=8080
```

### 4. Set Up Google Cloud Firestore

#### Enable Firestore

```bash
# Login to GCP
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Enable Firestore API
gcloud services enable firestore.googleapis.com

# Create Firestore database (Native mode)
gcloud firestore databases create --region=asia-southeast2
```

#### Create Collections

Firestore will auto-create collections when first document is added. No manual setup needed.

Collections:
- `users` - User profiles
- `majelis` - Group information

### 5. Set Up WhatsApp Business API

#### Get Access Token

1. Go to [Meta Developer Portal](https://developers.facebook.com/)
2. Create an app or use existing
3. Add WhatsApp product
4. Get temporary access token (24 hours)
5. Generate permanent token (see [Meta docs](https://developers.facebook.com/docs/whatsapp/business-management-api/get-started))

#### Configure Webhook

1. In Meta Developer Portal, go to WhatsApp > Configuration
2. Set webhook URL: `https://your-app-url.run.app/webhook`
3. Set verify token: Same as `MY_VERIFY_TOKEN` in `.env`
4. Subscribe to messages

### 6. Run Locally

```bash
npm start
```

Server will start on `http://localhost:8080`

Test endpoints:
- `http://localhost:8080/health` - Health check
- `http://localhost:8080/` - Dashboard
- `http://localhost:8080/majelis` - Majelis page

### 7. Test with ngrok (Optional)

To test WhatsApp webhook locally:

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok tunnel
ngrok http 8080

# Use ngrok URL as webhook in Meta Developer Portal
# Example: https://abc123.ngrok.io/webhook
```

## Production Deployment

### Option 1: Google Cloud Run (Recommended)

#### Prerequisites

```bash
# Install gcloud CLI
# https://cloud.google.com/sdk/docs/install

# Login
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

#### Create Artifact Registry

```bash
gcloud artifacts repositories create whatsapp-bot-repo \
  --repository-format=docker \
  --location=asia-southeast2 \
  --description="WhatsApp Bot Docker images"
```

#### Deploy

```bash
# Make deploy script executable
chmod +x deploy.sh

# Deploy
./deploy.sh
```

The script will:
1. Build Docker image
2. Push to Artifact Registry
3. Deploy to Cloud Run
4. Set environment variables
5. Configure region and scaling

#### Manual Deployment

```bash
# Build image
docker build -t asia-southeast2-docker.pkg.dev/YOUR_PROJECT_ID/whatsapp-bot-repo/whatsapp-bot:latest .

# Push image
docker push asia-southeast2-docker.pkg.dev/YOUR_PROJECT_ID/whatsapp-bot-repo/whatsapp-bot:latest

# Deploy to Cloud Run
gcloud run deploy whatsapp-bot \
  --image asia-southeast2-docker.pkg.dev/YOUR_PROJECT_ID/whatsapp-bot-repo/whatsapp-bot:latest \
  --platform managed \
  --region asia-southeast2 \
  --allow-unauthenticated \
  --set-env-vars MY_VERIFY_TOKEN=xxx,WHATSAPP_TOKEN=xxx,PHONE_NUMBER_ID=xxx,GEMINI_API_KEY=xxx,GCP_PROJECT_ID=xxx
```

### Option 2: Docker Compose

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Option 3: Traditional VPS

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone <repo-url>
cd wa-chatbot-gcp-ai
npm install

# Set environment variables
nano .env

# Run with PM2
npm install -g pm2
pm2 start index.js --name whatsapp-bot
pm2 save
pm2 startup
```

## Configuration

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `MY_VERIFY_TOKEN` | Yes | Webhook verification token | `my_secret_123` |
| `WHATSAPP_TOKEN` | Yes | WhatsApp API access token | `EAAxxxxx` |
| `PHONE_NUMBER_ID` | Yes | WhatsApp Business phone ID | `123456789` |
| `GEMINI_API_KEY` | Yes | Google Gemini API key | `AIzaSyXXX` |
| `GCP_PROJECT_ID` | Yes | Google Cloud project ID | `my-project-123` |
| `PORT` | No | Server port (default: 8080) | `8080` |
| `NODE_ENV` | No | Environment mode | `production` |

### Firestore Security Rules

Add these rules in Firestore console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if true;
      allow write: if true; // Add authentication later
    }
    
    // Majelis collection
    match /majelis/{majelisId} {
      allow read: if true;
      allow write: if true; // Add authentication later
    }
  }
}
```

**⚠️ Warning**: These rules allow public access. Implement authentication for production.

## Testing

### 1. Health Check

```bash
curl https://your-app-url.run.app/health
```

Expected: `🤖 Akademi-AI (Modular) is Online!`

### 2. Dashboard Access

Visit: `https://your-app-url.run.app/`

Should show user management interface.

### 3. API Test

```bash
# Get users
curl https://your-app-url.run.app/api/users

# Get majelis
curl https://your-app-url.run.app/api/majelis
```

### 4. WhatsApp Test

Send message from WhatsApp to your bot number:
- "Halo" - Should get greeting
- "Nama saya Ibu Test, usaha warung, Jakarta" - Should register
- "cek data" - Should show profile

### 5. View Logs

```bash
# Cloud Run logs
gcloud run logs read whatsapp-bot --region asia-southeast2 --limit 50

# Follow logs (real-time)
gcloud run logs tail whatsapp-bot --region asia-southeast2
```

## Troubleshooting

### Issue: Webhook verification fails

**Symptoms**: WhatsApp webhook shows "Failed to verify"

**Solutions**:
1. Check `MY_VERIFY_TOKEN` matches in both `.env` and Meta portal
2. Ensure webhook URL is correct: `https://your-app.run.app/webhook`
3. Check Cloud Run logs for errors
4. Verify app is deployed and accessible

### Issue: Bot doesn't respond to messages

**Symptoms**: Messages sent but no reply

**Solutions**:
1. Check webhook is subscribed to `messages` event
2. Verify `WHATSAPP_TOKEN` is valid (not expired)
3. Check Cloud Run logs: `gcloud run logs read whatsapp-bot`
4. Test health endpoint: `curl https://your-app.run.app/health`
5. Verify Gemini API key is valid

### Issue: Firestore permission denied

**Symptoms**: Error: "Missing or insufficient permissions"

**Solutions**:
1. Check Firestore is enabled in GCP project
2. Verify `GCP_PROJECT_ID` is correct
3. Check Firestore security rules allow access
4. Ensure Cloud Run service account has Firestore permissions

### Issue: Image analysis fails

**Symptoms**: Images sent but get error message

**Solutions**:
1. Verify `GEMINI_API_KEY` has Vision API access
2. Check image size (max 20MB)
3. Ensure image format is supported (JPEG, PNG)
4. Check Cloud Run logs for specific error

### Issue: Dashboard shows blank page

**Symptoms**: Dashboard loads but no data

**Solutions**:
1. Check browser console for errors (F12)
2. Verify API endpoints return data: `/api/users`, `/api/majelis`
3. Check CORS is enabled in `index.js`
4. Clear browser cache
5. Check Firestore has data

### Issue: Deployment fails

**Symptoms**: `./deploy.sh` fails with error

**Solutions**:
1. Check Docker is running
2. Verify gcloud is authenticated: `gcloud auth list`
3. Check project ID is correct: `gcloud config get-value project`
4. Ensure Artifact Registry exists
5. Check build logs for specific error

### Issue: High latency/slow responses

**Symptoms**: Bot takes >5 seconds to respond

**Solutions**:
1. Check Cloud Run region (use closest to users)
2. Increase Cloud Run memory (default: 512MB)
3. Check Gemini API quota and limits
4. Optimize database queries
5. Enable Cloud Run minimum instances (prevents cold starts)

## Performance Optimization

### Cloud Run Configuration

```bash
# Increase memory and CPU
gcloud run services update whatsapp-bot \
  --memory 1Gi \
  --cpu 2 \
  --region asia-southeast2

# Set minimum instances (prevent cold starts)
gcloud run services update whatsapp-bot \
  --min-instances 1 \
  --region asia-southeast2

# Set max instances
gcloud run services update whatsapp-bot \
  --max-instances 10 \
  --region asia-southeast2
```

### Firestore Optimization

- Use composite indexes for complex queries
- Limit query results with pagination
- Cache frequently accessed data
- Use batch operations for multiple writes

### Gemini API Optimization

- Reduce `maxOutputTokens` for faster responses
- Lower `temperature` for more consistent output
- Use streaming for long responses
- Implement request caching

## Security Best Practices

### 1. Environment Variables

- Never commit `.env` to git
- Use Cloud Secret Manager for production
- Rotate tokens regularly

### 2. API Security

- Implement API key authentication
- Add rate limiting
- Validate all inputs
- Sanitize user data

### 3. Firestore Security

- Implement proper security rules
- Use authentication
- Limit read/write access
- Enable audit logging

### 4. WhatsApp Security

- Verify webhook signatures
- Validate message sender
- Implement spam detection
- Rate limit per user

## Monitoring

### Cloud Run Metrics

View in GCP Console:
- Request count
- Response time
- Error rate
- CPU/Memory usage

### Custom Logging

Add structured logging:

```javascript
console.log(JSON.stringify({
  level: 'info',
  message: 'User registered',
  phone: '628xxx',
  timestamp: new Date().toISOString()
}));
```

### Alerts

Set up alerts for:
- High error rate (>5%)
- Slow response time (>2s)
- High memory usage (>80%)
- Failed deployments

## Backup and Recovery

### Firestore Backup

```bash
# Export data
gcloud firestore export gs://your-bucket/backup-$(date +%Y%m%d)

# Import data
gcloud firestore import gs://your-bucket/backup-20251122
```

### Rollback Deployment

```bash
# List revisions
gcloud run revisions list --service whatsapp-bot --region asia-southeast2

# Rollback to previous
gcloud run services update-traffic whatsapp-bot \
  --to-revisions=REVISION_NAME=100 \
  --region asia-southeast2
```

## Next Steps

1. ✅ Complete setup and test locally
2. ✅ Deploy to Cloud Run
3. ✅ Configure WhatsApp webhook
4. ✅ Test with real users
5. ✅ Monitor logs and metrics
6. ✅ Implement authentication
7. ✅ Add rate limiting
8. ✅ Set up monitoring alerts
9. ✅ Configure backups
10. ✅ Document custom features

## Support

- **Documentation**: See `/docs` folder
- **Issues**: Check troubleshooting section above
- **Logs**: `gcloud run logs read whatsapp-bot`
- **Community**: Open GitHub issue

---

**Need help?** Check the [API documentation](./API.md) or review [test scenarios](../test-chats.md).
