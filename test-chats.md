# Test Chat Scenarios

## ✅ Valid Chats (Should Work)

### New User Registration
1. **Complete registration in one message**
   ```
   User: Nama saya Ibu Siti, usaha warung sembako di Bogor
   Expected: Bot registers user and confirms
   ```

2. **Step-by-step registration**
   ```
   User: Halo
   Bot: (asks for name, business, location)
   User: Ibu Ani, jualan gorengan, Jakarta
   Expected: Bot registers user
   ```

3. **Registration with example format**
   ```
   User: Saya mau daftar
   Bot: (provides example)
   User: Nama: Ibu Dewi, Usaha: Warung Kopi, Lokasi: Bandung
   Expected: Bot registers user
   ```

### Registered User Questions
4. **Business question**
   ```
   User: Bagaimana cara menghitung laba usaha?
   Expected: Bot provides financial literacy answer
   ```

5. **Amartha terms**
   ```
   User: Apa itu Majelis?
   Expected: Bot explains from knowledge base
   ```

6. **Check profile**
   ```
   User: cek data
   Expected: Bot shows user profile
   ```

## ⚠️ Edge Cases (Should Handle Gracefully)

### Spam/Malicious
7. **Repeated characters**
   ```
   User: aaaaaaaaaaaaaaaaaaa
   Expected: "Maaf, pesan tidak valid. Silakan kirim pertanyaan yang jelas."
   ```

8. **Too long message**
   ```
   User: [1000+ characters of text]
   Expected: "Maaf, pesan terlalu panjang. Mohon kirim pesan yang lebih singkat."
   ```

9. **Only special characters**
   ```
   User: !@#$%^&*()!@#$%^&*()!@#$%^&*()
   Expected: "Maaf, pesan tidak valid."
   ```

10. **URLs/Links**
    ```
    User: Check this out https://scam-site.com
    Expected: "Maaf, pesan tidak valid."
    ```

### Off-Topic
11. **Politics**
    ```
    User: Siapa yang akan menang pemilu?
    Expected: "Maaf Bu, saya hanya bisa membantu literasi keuangan dan usaha."
    ```

12. **Religion**
    ```
    User: Apa pendapat kamu tentang agama X?
    Expected: "Maaf Bu, saya hanya bisa membantu literasi keuangan dan usaha."
    ```

13. **Gossip**
    ```
    User: Kamu tau gosip tentang artis X?
    Expected: "Maaf Bu, saya hanya bisa membantu literasi keuangan dan usaha."
    ```

14. **Personal/inappropriate**
    ```
    User: Kamu cantik gak?
    Expected: "Maaf Bu, saya hanya bisa membantu literasi keuangan dan usaha."
    ```

### Unverified User Restrictions
15. **Ask about Majelis (unverified)**
    ```
    User: Kapan jadwal Majelis saya?
    Expected: "Maaf Bu, data Majelis harus diaktifkan oleh Petugas Lapangan (BP) dulu."
    ```

## 🧪 How to Test

### Option 1: WhatsApp (Real Test)
1. Send messages from your WhatsApp to the bot number
2. Test each scenario above
3. Check if responses match expectations

### Option 2: API Test (Quick Test)
```bash
# Test via webhook endpoint
curl -X POST https://whatsapp-bot-435783355893.asia-southeast2.run.app/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "6281335607447",
            "type": "text",
            "text": {
              "body": "Nama saya Ibu Test, usaha warung, Jakarta"
            }
          }]
        }
      }]
    }]
  }'
```

### Option 3: Check Logs
```bash
# View Cloud Run logs to see spam detection
gcloud run logs read whatsapp-bot --region asia-southeast2 --limit 50
```

## 📊 Expected Results

| Scenario | Input Type | Expected Behavior |
|----------|-----------|-------------------|
| Valid registration | Complete data | User registered in Firestore |
| Valid question | Business/finance | Helpful answer from AI |
| Spam | Repeated chars | Rejected with message |
| Off-topic | Politics/religion | Politely redirected |
| Too long | 1000+ chars | Rejected with message |
| Unverified user | Majelis question | Told to contact BP |

## 🔍 What to Check

1. **Dashboard**: https://whatsapp-bot-435783355893.asia-southeast2.run.app
   - New users appear after registration
   - Can verify/delete users

2. **Firestore Console**: https://console.cloud.google.com/firestore
   - Check if users are saved correctly
   - Verify data structure

3. **Logs**: Look for spam warnings
   ```
   ⚠️ Spam detected from 628xxx: aaaaaaaaaa...
   ```
