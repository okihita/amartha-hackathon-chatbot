# Deployment Testing Standards

## Post-Deployment Testing Checklist

After every deployment to production, run the automated test suite:

```bash
# Run all tests against production
./tests/integration.test.sh

# Or with verbose output
VERBOSE=true ./tests/integration.test.sh
```

The test suite automatically checks:
- ✅ Health endpoints
- ✅ All dashboard pages (Users, Majelis, Business Types, Financial Literacy)
- ✅ All API endpoints
- ✅ Navigation consistency
- ✅ CSS and styling
- ✅ Feature functionality

### Manual Checks

After automated tests pass, verify:

1. **WhatsApp Bot**
   - [ ] Send test message from WhatsApp
   - [ ] Check if bot responds
   - [ ] Test "debug" or "cek data" command
   - [ ] Test registration flow

2. **Logs Check**
   ```bash
   gcloud run logs read whatsapp-bot --region asia-southeast2 --limit 20
   ```
   - [ ] No critical errors
   - [ ] Bot is processing messages
   - [ ] No spam warnings (unless expected)

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
