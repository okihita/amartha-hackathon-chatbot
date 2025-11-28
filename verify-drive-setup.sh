#!/bin/bash

echo "🔍 Verifying Google Drive Setup..."
echo "===================================="
echo ""

# Check if APIs are enabled
echo "1. Checking if Google Drive API is enabled..."
if gcloud services list --enabled | grep -q "drive.googleapis.com"; then
    echo "   ✅ Google Drive API: Enabled"
else
    echo "   ❌ Google Drive API: Not enabled"
    echo "   Run: gcloud services enable drive.googleapis.com"
fi

echo ""
echo "2. Checking if Google Docs API is enabled..."
if gcloud services list --enabled | grep -q "docs.googleapis.com"; then
    echo "   ✅ Google Docs API: Enabled"
else
    echo "   ❌ Google Docs API: Not enabled"
    echo "   Run: gcloud services enable docs.googleapis.com"
fi

echo ""
echo "3. Checking if service account exists..."
if gcloud iam service-accounts list | grep -q "drive-reader@"; then
    echo "   ✅ Service account: Exists"
    echo "   📧 Email: drive-reader@stellar-zoo-478021-v8.iam.gserviceaccount.com"
else
    echo "   ❌ Service account: Not found"
fi

echo ""
echo "4. Checking if service account key exists..."
if [ -f "service-account-key.json" ]; then
    echo "   ✅ Service account key: Found"
    echo "   📄 File: service-account-key.json"
else
    echo "   ❌ Service account key: Not found"
    echo "   Run: gcloud iam service-accounts keys create service-account-key.json \\"
    echo "        --iam-account=drive-reader@stellar-zoo-478021-v8.iam.gserviceaccount.com"
fi

echo ""
echo "5. Checking if googleapis is installed..."
if npm list googleapis 2>/dev/null | grep -q "googleapis@"; then
    echo "   ✅ googleapis: Installed"
else
    echo "   ❌ googleapis: Not installed"
    echo "   Run: npm install googleapis"
fi

echo ""
echo "===================================="
echo "📋 NEXT STEPS"
echo "===================================="
echo ""
echo "If all checks passed, you need to:"
echo ""
echo "1. Share Google Drive folders with:"
echo "   drive-reader@stellar-zoo-478021-v8.iam.gserviceaccount.com"
echo ""
echo "2. Business Types Folder:"
echo "   https://drive.google.com/drive/folders/14D6sdUsJevp30p1xNGQVKh_1im_QAKVH"
echo ""
echo "3. Financial Literacy Folder:"
echo "   https://drive.google.com/drive/folders/1_qBhLNCfdxkLVTro_jJACF6sm_rG9ZBt"
echo ""
echo "4. Then run the import script:"
echo "   node scripts/fetch-from-google-drive.js"
echo ""
