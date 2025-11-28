# Feature Plan: Post-Approval User Access

## Current State
- ❌ Unverified users: Limited access, can't see Majelis schedule
- ✅ Verified users: Can ask questions, but features are limited

## Proposed Features After Approval

### 🎯 Tier 1: Essential Features (Implement First)

#### 1. **Majelis Schedule Access**
- **What**: View weekly meeting schedule
- **Command**: "Kapan Majelis?" or "Jadwal Majelis"
- **Response**: "Majelis Ibu dijadwalkan setiap Selasa pukul 10:00 di Balai Desa Sragen"
- **Why**: Core Amartha feature, users need this info

#### 2. **Loan Limit Check**
- **What**: Check available loan amount based on profile
- **Command**: "Berapa limit pinjaman saya?"
- **Response**: "Limit pinjaman Ibu saat ini: Rp 2.000.000 (Tahap 1). Setelah cicilan lancar, bisa naik ke Rp 5.000.000"
- **Why**: Users want to know borrowing capacity

#### 3. **Payment Reminder**
- **What**: Check next payment due date and amount
- **Command**: "Kapan bayar cicilan?" or "Cek tagihan"
- **Response**: "Cicilan berikutnya: Rp 150.000 jatuh tempo 25 November 2025"
- **Why**: Helps users manage payments

#### 4. **Transaction History**
- **What**: View recent transactions (loans, payments)
- **Command**: "Riwayat transaksi" or "History"
- **Response**: List of last 5 transactions with dates and amounts
- **Why**: Financial transparency

#### 5. **Business Tips (Personalized)**
- **What**: AI-generated tips based on their business type
- **Command**: "Tips usaha" or "Saran bisnis"
- **Response**: "Untuk warung sembako, tips: 1) Catat stok harian, 2) Jual produk cepat laku dulu..."
- **Why**: Value-add, improves financial literacy

---

### 🚀 Tier 2: Advanced Features (Implement Later)

#### 6. **Savings Goal Tracker**
- **What**: Set and track savings goals
- **Command**: "Buat target tabungan 1 juta"
- **Response**: Tracks progress, sends weekly updates
- **Why**: Encourages financial discipline

#### 7. **Expense Calculator**
- **What**: Calculate daily/monthly business expenses
- **Command**: "Hitung pengeluaran: belanja 500rb, listrik 200rb"
- **Response**: "Total pengeluaran: Rp 700.000. Sisa modal: Rp 1.300.000"
- **Why**: Helps with bookkeeping

#### 8. **Profit Calculator**
- **What**: Calculate profit margins
- **Command**: "Hitung untung: modal 10rb, jual 15rb"
- **Response**: "Keuntungan: Rp 5.000 (50% margin)"
- **Why**: Business education

#### 9. **Group Chat Access**
- **What**: Join WhatsApp group with other verified members
- **Command**: "Gabung grup"
- **Response**: Sends invite link to Amartha community group
- **Why**: Peer support, networking

#### 10. **Video Tutorial Access**
- **What**: Get links to financial literacy videos
- **Command**: "Video literasi keuangan"
- **Response**: Sends YouTube/Drive links to educational content
- **Why**: Visual learning for low-literacy users

---

### 🎨 Tier 3: Premium Features (Future)

#### 11. **Voice Message Support**
- **What**: Accept voice messages, transcribe, and respond
- **Why**: Accessibility for users who can't type well

#### 12. **Image Receipt Scanner**
- **What**: Upload receipt photo, AI extracts amounts
- **Command**: Send photo of receipt
- **Response**: "Terdeteksi: Belanja Rp 125.000 di Toko ABC"
- **Why**: Automated expense tracking

#### 13. **AI Business Consultant**
- **What**: Deep business analysis and recommendations
- **Command**: "Analisa usaha saya"
- **Response**: Detailed report on strengths, weaknesses, opportunities
- **Why**: Professional-level insights

#### 14. **Referral Program**
- **What**: Earn rewards for referring new members
- **Command**: "Kode referral saya"
- **Response**: "Kode Ibu: SITI2024. Ajak teman dapat bonus!"
- **Why**: Viral growth

---

## Implementation Priority

### Phase 1 (Week 1-2): Core Features
```
✅ Majelis Schedule Access
✅ Loan Limit Check
✅ Payment Reminder
```

### Phase 2 (Week 3-4): Value-Add
```
✅ Transaction History
✅ Business Tips (Personalized)
✅ Savings Goal Tracker
```

### Phase 3 (Month 2): Advanced
```
✅ Expense Calculator
✅ Profit Calculator
✅ Group Chat Access
```

### Phase 4 (Month 3+): Premium
```
✅ Voice Message Support
✅ Image Receipt Scanner
✅ AI Business Consultant
```

---

## Technical Requirements

### Database Schema Updates
```javascript
// Add to userDatabase
{
  // Existing fields...
  loan_limit: 2000000,
  next_payment_date: "2025-11-25",
  next_payment_amount: 150000,
  transactions: [
    { date: "2025-11-01", type: "loan", amount: 2000000 },
    { date: "2025-11-10", type: "payment", amount: 150000 }
  ],
  savings_goal: {
    target: 1000000,
    current: 250000,
    deadline: "2025-12-31"
  }
}
```

### New API Endpoints
```
GET  /api/users/:phone/transactions
GET  /api/users/:phone/loan-limit
GET  /api/users/:phone/payment-schedule
POST /api/users/:phone/savings-goal
POST /api/users/:phone/calculate-expense
```

### AI Tool Definitions
```javascript
// Add new tools for Gemini
- getLoanLimit
- getPaymentSchedule
- calculateProfit
- setSavingsGoal
```

---

## User Flow Example

### Before Approval
```
User: Kapan Majelis saya?
Bot: ❌ Maaf Bu, data Majelis harus diaktifkan oleh Petugas Lapangan (BP) dulu.
```

### After Approval
```
User: Kapan Majelis saya?
Bot: ✅ Majelis Ibu dijadwalkan setiap Selasa pukul 10:00 di Balai Desa Sragen.

User: Berapa limit pinjaman saya?
Bot: ✅ Limit pinjaman Ibu saat ini: Rp 2.000.000 (Tahap 1).

User: Tips usaha dong
Bot: ✅ Tips untuk warung sembako Ibu:
1. Catat stok barang setiap hari
2. Jual produk cepat laku dulu (mie, gula, minyak)
3. Beli grosir untuk margin lebih besar
```

---

## Success Metrics

### Engagement
- Daily active users (DAU)
- Messages per user per day
- Feature usage rate

### Business Impact
- Loan repayment rate (target: >95%)
- Savings goal completion rate
- User retention (3-month)

### User Satisfaction
- Response time (<2 seconds)
- Answer accuracy (>90%)
- User feedback score (4+/5)

---

## Next Steps

1. **Choose Phase 1 features** to implement
2. **Update database schema** in Firestore
3. **Add new AI tools** for Gemini
4. **Create API endpoints** for data access
5. **Test with real users** and iterate

Which features should we implement first?
