# Deployment Testing Standards

## Post-Deployment Testing Checklist

After every deployment to production, you MUST test the following:

### 1. Dashboard Pages
- [ ] **Users page** - Visit https://whatsapp-bot-435783355893.asia-southeast2.run.app/
  - Should load without errors
  - Should display user table
  - Navigation should work
  
- [ ] **Majelis page** - Visit https://whatsapp-bot-435783355893.asia-southeast2.run.app/majelis
  - Should load without errors (not download)
  - Should display majelis grid
  - Navigation should work

### 2. API Endpoints
Test with curl or browser:

```bash
# Health check
curl https://whatsapp-bot-435783355893.asia-southeast2.run.app/health

# Get users
curl https://whatsapp-bot-435783355893.asia-southeast2.run.app/api/users

# Get majelis
curl https://whatsapp-bot-435783355893.asia-southeast2.run.app/api/majelis
```

### 3. WhatsApp Bot
- [ ] Send test message from WhatsApp
- [ ] Check if bot responds
- [ ] Test "debug" or "cek data" command
- [ ] Test registration flow (if applicable)

### 4. Logs Check
```bash
gcloud run logs read whatsapp-bot --region asia-southeast2 --limit 20
```
- [ ] No critical errors
- [ ] Bot is processing messages
- [ ] No spam warnings (unless expected)

## Testing Commands

### Quick Test Script
```bash
# Test all endpoints
echo "Testing health..."
curl -s https://whatsapp-bot-435783355893.asia-southeast2.run.app/health

echo "\nTesting users API..."
curl -s https://whatsapp-bot-435783355893.asia-southeast2.run.app/api/users | jq '.[0]'

echo "\nTesting majelis API..."
curl -s https://whatsapp-bot-435783355893.asia-southeast2.run.app/api/majelis | jq '.[0]'

echo "\nDone!"
```

### Check Logs
```bash
# Recent logs
gcloud run logs read whatsapp-bot --region asia-southeast2 --limit 20

# Follow logs (real-time)
gcloud run logs tail whatsapp-bot --region asia-southeast2
```

## When to Test

1. **After every deployment** - Run full checklist
2. **After major changes** - Test affected features thoroughly
3. **Before demo/presentation** - Full system test
4. **After long idle period** - Verify Cloud Run didn't scale to zero issues

## What to Report

If issues found:
1. Which page/endpoint failed
2. Error message or behavior
3. Browser console errors (F12)
4. Cloud Run logs snippet

## Rollback Procedure

If critical issues found:
```bash
# List recent revisions
gcloud run revisions list --service whatsapp-bot --region asia-southeast2

# Rollback to previous revision
gcloud run services update-traffic whatsapp-bot \
  --to-revisions=REVISION_NAME=100 \
  --region asia-southeast2
```
