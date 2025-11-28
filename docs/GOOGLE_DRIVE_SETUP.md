# Google Drive API Setup Guide

This guide explains how to set up Google Drive API access to automatically fetch documents and import them to Firestore.

---

## Prerequisites

- Google Cloud Project (already have: stellar-zoo-478021-v8)
- Google Drive folders with documents
- Admin access to Google Drive folders

---

## Step 1: Enable Google Drive API

### Via Console:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `stellar-zoo-478021-v8`
3. Go to **APIs & Services** → **Library**
4. Search for "Google Drive API"
5. Click **Enable**
6. Search for "Google Docs API"
7. Click **Enable**

### Via gcloud CLI:
```bash
gcloud services enable drive.googleapis.com
gcloud services enable docs.googleapis.com
```

---

## Step 2: Create Service Account

### Via Console:
1. Go to **IAM & Admin** → **Service Accounts**
2. Click **Create Service Account**
3. Name: `drive-reader`
4. Description: `Read access to Google Drive for RAG import`
5. Click **Create and Continue**
6. Skip role assignment (we'll use Drive sharing)
7. Click **Done**

### Via gcloud CLI:
```bash
gcloud iam service-accounts create drive-reader \
  --display-name="Drive Reader for RAG Import" \
  --description="Read access to Google Drive documents"
```

---

## Step 3: Create Service Account Key

### Via Console:
1. Go to **Service Accounts**
2. Click on `drive-reader@stellar-zoo-478021-v8.iam.gserviceaccount.com`
3. Go to **Keys** tab
4. Click **Add Key** → **Create new key**
5. Choose **JSON**
6. Click **Create**
7. Save the downloaded file as `service-account-key.json`

### Via gcloud CLI:
```bash
gcloud iam service-accounts keys create service-account-key.json \
  --iam-account=drive-reader@stellar-zoo-478021-v8.iam.gserviceaccount.com
```

### ⚠️ Security:
```bash
# Move to project root
mv ~/Downloads/service-account-key.json ./

# Add to .gitignore (already done)
echo "service-account-key.json" >> .gitignore

# Set permissions
chmod 600 service-account-key.json
```

---

## Step 4: Share Google Drive Folders

You need to share the Drive folders with the service account email.

### Service Account Email:
```
drive-reader@stellar-zoo-478021-v8.iam.gserviceaccount.com
```

### Share Business Types Folder:
1. Go to: https://drive.google.com/drive/folders/14D6sdUsJevp30p1xNGQVKh_1im_QAKVH
2. Click **Share** button
3. Add email: `drive-reader@stellar-zoo-478021-v8.iam.gserviceaccount.com`
4. Set permission: **Viewer**
5. Uncheck "Notify people"
6. Click **Share**

### Share Financial Literacy Folder:
1. Go to: https://drive.google.com/drive/folders/1_qBhLNCfdxkLVTro_jJACF6sm_rG9ZBt
2. Click **Share** button
3. Add email: `drive-reader@stellar-zoo-478021-v8.iam.gserviceaccount.com`
4. Set permission: **Viewer**
5. Uncheck "Notify people"
6. Click **Share**

---

## Step 5: Install Dependencies

```bash
npm install googleapis
```

Or add to package.json:
```json
{
  "dependencies": {
    "googleapis": "^128.0.0"
  }
}
```

---

## Step 6: Set Environment Variable

### Option A: Export in terminal
```bash
export GOOGLE_APPLICATION_CREDENTIALS="./service-account-key.json"
```

### Option B: Add to .env
```bash
echo "GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json" >> .env
```

### Option C: Use in script directly
The script already looks for `./service-account-key.json` by default.

---

## Step 7: Run Import Script

```bash
# Make executable
chmod +x scripts/fetch-from-google-drive.js

# Run import
node scripts/fetch-from-google-drive.js
```

### Expected Output:
```
🚀 Starting Google Drive to Firestore Import...

✅ Google APIs initialized
📂 Fetching files from folder: 14D6sdUsJevp30p1xNGQVKh_1im_QAKVH
   Found 20 documents

📊 Processing Business Classifications...

   Processing: Warung Sembako - Maturity Levels.gdoc
   ✅ Imported: Warung Sembako (5 levels)

   Processing: Jual Bakwan - Maturity Levels.gdoc
   ✅ Imported: Jual Bakwan (5 levels)

   ...

✅ Imported 20/20 business classifications

📂 Fetching files from folder: 1_qBhLNCfdxkLVTro_jJACF6sm_rG9ZBt
   Found 15 documents

📚 Processing Financial Literacy Modules...

   Processing: Week 1 - Pengenalan Literasi Keuangan.gdoc
   ✅ Imported: Week 1 - Pengenalan Literasi Keuangan (10 questions)

   ...

✅ Imported 15/15 financial modules

============================================================
✅ Import Complete!
============================================================
📊 Business Classifications: 20
📚 Financial Modules: 15
============================================================

🔍 Verifying Firestore data...
   - business_classifications: 20 documents
   - financial_literacy_modules: 15 documents

✅ All done!
```

---

## Document Format Requirements

### Business Classification Documents

Expected structure in Google Docs:

```
Warung Sembako - Maturity Levels

Level 1: Pemula - Baru Memulai

Kriteria:
- Omzet < Rp 5 juta/bulan
- Belum ada pembukuan
- Modal dari tabungan pribadi

Karakteristik:
- Usaha baru berjalan <6 bulan
- Belum memiliki pelanggan tetap

Langkah Selanjutnya:
- Mulai catat pemasukan dan pengeluaran harian
- Buat daftar pelanggan tetap

Kekuatan:
- Lokasi strategis di dekat rumah
- Kenal dengan warga sekitar

Kelemahan:
- Modal terbatas
- Belum ada sistem pembukuan

Peluang:
- Banyak warga yang membutuhkan warung dekat
- Bisa jual produk tambahan

Ancaman:
- Ada warung lain yang lebih besar
- Harga sembako naik turun

Rekomendasi:
- Bergabung dengan Majelis
- Mulai gunakan buku kas sederhana

Level 2: Berkembang - Mulai Stabil
...
```

### Financial Literacy Documents

Expected structure in Google Docs:

```
Week 1 - Pengenalan Literasi Keuangan

Tujuan Pembelajaran:
- Memahami apa itu literasi keuangan
- Mengetahui manfaat literasi keuangan untuk usaha
- Mampu membedakan kebutuhan dan keinginan

Pengantar:
Literasi keuangan adalah kemampuan untuk memahami dan mengelola keuangan dengan baik...

Ringkasan:
Literasi keuangan adalah fondasi penting untuk kesuksesan UMKM...

Poin Penting:
- Literasi keuangan = kemampuan mengelola uang dengan baik
- Penting untuk kesuksesan UMKM
- Bedakan kebutuhan dan keinginan

Kuis:

1. Apa yang dimaksud dengan literasi keuangan?
A. Kemampuan membaca dan menulis tentang uang
B. Kemampuan mengelola keuangan dengan baik
C. Kemampuan menghitung uang dengan cepat
D. Kemampuan menghasilkan uang banyak

Jawaban: B
Penjelasan: Literasi keuangan adalah kemampuan untuk memahami dan mengelola keuangan dengan baik...

2. Manakah yang termasuk kebutuhan untuk usaha warung?
A. Membeli HP baru untuk jualan online
B. Membeli stok beras dan minyak
C. Renovasi warung dengan cat warna-warni
D. Membeli etalase kaca yang mahal

Jawaban: B
Penjelasan: Kebutuhan adalah hal yang harus dipenuhi untuk menjalankan usaha...
```

---

## Troubleshooting

### Error: "Permission denied"
**Solution:** Make sure you shared the Drive folders with the service account email.

### Error: "API not enabled"
**Solution:** Enable Google Drive API and Google Docs API in Cloud Console.

### Error: "Invalid credentials"
**Solution:** Check that `service-account-key.json` exists and is valid.

### Error: "Cannot find module 'googleapis'"
**Solution:** Run `npm install googleapis`

### Error: "Quota exceeded"
**Solution:** Google Drive API has quotas. Wait a few minutes and try again.

---

## Updating Documents

### To update existing documents:
1. Edit the Google Doc in Drive
2. Run the import script again
3. The script will overwrite existing Firestore documents

### To add new documents:
1. Add new Google Doc to the folder
2. Follow the naming convention
3. Run the import script

---

## Automation (Optional)

### Run import on schedule:

#### Option 1: Cloud Scheduler
```bash
# Create Cloud Function that runs the import
gcloud functions deploy import-rag-data \
  --runtime nodejs20 \
  --trigger-http \
  --entry-point main

# Schedule it
gcloud scheduler jobs create http import-rag-weekly \
  --schedule="0 0 * * 0" \
  --uri="https://REGION-PROJECT.cloudfunctions.net/import-rag-data" \
  --http-method=POST
```

#### Option 2: GitHub Actions
```yaml
# .github/workflows/import-rag.yml
name: Import RAG Data
on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday
  workflow_dispatch:  # Manual trigger

jobs:
  import:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: node scripts/fetch-from-google-drive.js
        env:
          GOOGLE_APPLICATION_CREDENTIALS: ${{ secrets.SERVICE_ACCOUNT_KEY }}
```

---

## Security Best Practices

1. ✅ Never commit `service-account-key.json` to git
2. ✅ Use environment variables for credentials
3. ✅ Limit service account permissions (Viewer only)
4. ✅ Rotate service account keys regularly
5. ✅ Use Cloud Secret Manager in production
6. ✅ Monitor API usage and quotas

---

## Next Steps

1. ✅ Enable Google Drive API
2. ✅ Create service account
3. ✅ Download service account key
4. ✅ Share Drive folders with service account
5. ✅ Install googleapis package
6. ✅ Run import script
7. ✅ Verify data in Firestore
8. ✅ Integrate with chatbot

---

**Questions?** Check the [RAG Implementation Guide](./RAG_IMPLEMENTATION_GUIDE.md) for integration details.
