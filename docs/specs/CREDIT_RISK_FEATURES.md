# Credit Risk & Education Feature Specs

Based on "Amartha's Credit Risk and Education" document, these features fill gaps in the A-Score system.

---

## Project USPs & Dashboard Integration

### Three USPs

1. **Last Mile Solution**: UMKM users interact via WhatsApp (no app install, no complex websites)
2. **Income Optimizer**: Raise creditworthiness by increasing income through daily business coaching
3. **Expense Reducer**: Raise creditworthiness by reducing expenses through financial literacy education

### Dashboard Goal

Show Field Officers how WhatsApp interactions actively improve each borrower's RPC over time.

### Data Model for Dashboard

```javascript
// getCompleteProfile() response structure
{
  // Basic info
  phone, name, status, majelis_id,
  profile: { gender },
  business: { name, category, location, maturity_level },
  
  // RPC Components (USP 2 + 3 combined)
  rpc: {
    monthly_income: 12500000,
    monthly_expenses: 8500000,
    sustainable_disposable_cash: 4000000,
    max_installment: 1200000,
    income_change_pct: +15,
    expense_change_pct: -8,
  },
  
  // USP 2: Income Optimizer
  business_growth: {
    current_level: 2,
    target_level: 3,
    kpis: [
      { name: "Omset Rp 500k/hari", completed: true },
      { name: "Tambah 3 produk baru", completed: false },
    ],
    last_coaching_date: "2025-11-28T14:32:00Z",
    last_coaching_topic: "Bu, omset hari ini gimana?"
  },
  
  // USP 3: Expense Reducer  
  literacy: {
    completed_weeks: 9,
    total_weeks: 15,
    avg_score: 85,
    current_module: "Pisahkan Uang Usaha",
    estimated_savings: 300000,
  },
  
  // USP 1: WhatsApp Engagement
  engagement: {
    total_interactions: 47,
    streak_days: 12,
    response_rate: 0.94,
    activity_calendar: { "2025-11-01": true, "2025-11-02": false },
    activity_breakdown: { quiz: 18, business_advice: 15, check_data: 8 }
  },
  
  // Composite Score
  a_score: {
    score: 72,
    zone: 'A',
    components: { character: 75, capacity: 68, literacy: 80, engagement: 65 }
  },
  
  business_intelligence: [...],
  loan: { limit, remaining, history }
}
```

### RPC Formula

```
RPC = (Monthly Income - Monthly Expenses) × 30%

Where:
- Monthly Income = Daily Revenue × Active Days (improved by USP 2)
- Monthly Expenses = COGS + Household + Obligations (reduced by USP 3)
- 30% = Safety buffer per Amartha policy
```

### A-Score Formula

```
A-Score = (Character × 0.25) + (Capacity × 0.30) + (Literacy × 0.25) + (Engagement × 0.20)

Risk Zones:
- Zone A (≥70): Auto-approve
- Zone B (55-69): Approve with conditions  
- Zone C (40-54): Approve with coaching
- Zone D (<40): Reject
```

---

## 1. CRBI Psychometric Assessment via WhatsApp

### Gap Addressed
- Currently: Field Officers administer CRBI orally, manual scoring
- Solution: Chatbot delivers standardized psychometric questions, auto-scores

### Data Model

```javascript
// Add to User entity
User.createPsychometric = (data) => ({
  crbi_score: null,           // 0-100 composite score
  conscientiousness: null,    // 0-100
  integrity: null,            // 0-100
  risk_appetite: null,        // 0-100 (lower = more conservative)
  neuroticism: null,          // 0-100 (lower = more stable)
  social_desirability_flags: 0, // Lie detection counter
  assessment_date: null,
  assessment_version: 'v1',
  created_at: new Date().toISOString()
});
```

### Question Bank Structure

```javascript
// Store in Firestore: psychometric_questions collection
{
  id: "crbi_001",
  trait: "conscientiousness",  // or integrity, risk_appetite, neuroticism
  question_id: "Bahasa Indonesia question text",
  options: [
    { text: "Sangat setuju", score: 5 },
    { text: "Setuju", score: 4 },
    { text: "Netral", score: 3 },
    { text: "Tidak setuju", score: 2 },
    { text: "Sangat tidak setuju", score: 1 }
  ],
  reverse_scored: false,  // true if high answer = low trait
  is_lie_detector: false  // true for social desirability checks
}
```

### Sample Questions (10 questions, ~3 min)

| Trait | Question (ID) | Type |
|-------|---------------|------|
| Conscientiousness | "Saya selalu mencatat pengeluaran harian" | Normal |
| Conscientiousness | "Saya sering lupa janji dengan pelanggan" | Reverse |
| Integrity | "Jika ada uang lebih dari kembalian, saya kembalikan" | Normal |
| Integrity | "Kadang saya melebihkan harga ke pelanggan baru" | Reverse |
| Risk Appetite | "Saya berani pinjam uang untuk stok besar" | Normal |
| Neuroticism | "Saya panik jika penjualan sepi 1 minggu" | Normal |
| Lie Detector | "Saya tidak pernah berbohong seumur hidup" | Flag if "Sangat setuju" |

### Flow

```
User: "daftar" or "assessment"
Bot: Sends intro + first question as WhatsApp list message
User: Selects answer
Bot: Records, sends next question
... (10 questions)
Bot: "Terima kasih! Penilaian selesai. Skor Anda: [simplified feedback]"
```

### Scoring Formula

```javascript
// In PsychometricService.js
calculateCRBIScore(answers) {
  const weights = {
    conscientiousness: 0.35,  // Highest weight per research
    integrity: 0.30,
    risk_appetite: 0.20,      // Inverted: conservative = higher score
    neuroticism: 0.15         // Inverted: stable = higher score
  };
  
  // Normalize each trait to 0-100
  const traits = this.calculateTraitScores(answers);
  
  // Check lie detector flags
  if (traits.social_desirability_flags >= 2) {
    traits.integrity *= 0.8; // Penalty for likely dishonesty
  }
  
  // Weighted composite
  const crbi = 
    (traits.conscientiousness * weights.conscientiousness) +
    (traits.integrity * weights.integrity) +
    ((100 - traits.risk_appetite) * weights.risk_appetite) +
    ((100 - traits.neuroticism) * weights.neuroticism);
  
  return Math.round(crbi);
}
```

### Tool Declaration (aiEngine.js)

```javascript
const startPsychometricTool = {
  name: "startPsychometric",
  description: "Start CRBI psychometric assessment when user says: 'assessment', 'penilaian', 'tes karakter', or during registration flow.",
  parameters: { type: "OBJECT", properties: {} }
};
```

---

## 2. Capacity Assessment (RPC Calculator)

### Gap Addressed
- Currently: Field Officers manually reconstruct P&L
- Solution: Guided chat flow to estimate Sustainable Disposable Cash Flow

### Data Model

```javascript
// Add to User.business
User.createCapacityAssessment = (data) => ({
  // Revenue
  daily_revenue_estimate: null,      // Rp
  active_days_per_month: null,       // 20-30
  monthly_revenue: null,             // Calculated
  
  // Costs
  cogs_percentage: null,             // 40-80% typical
  monthly_cogs: null,
  
  // Household (proxies)
  household_members: null,
  electricity_monthly: null,         // PLN proxy
  school_children: null,
  
  // Obligations
  existing_debt_monthly: null,       // Arisan, other loans
  
  // Calculated
  monthly_profit: null,
  sustainable_disposable_cash: null, // RPC
  max_installment_30pct: null,       // 30% of SDC
  
  assessment_date: null,
  confidence: 'low' | 'medium' | 'high'
});
```

### Chat Flow

```
Bot: "Untuk membantu menghitung kemampuan usaha Ibu, saya perlu beberapa info. Berapa omset harian rata-rata?"
User: "500 ribu"
Bot: "Dalam sebulan, berapa hari Ibu buka usaha?"
User: "25 hari"
Bot: "Berapa persen dari omset untuk modal/belanja barang?"
User: "60%"
Bot: "Berapa pengeluaran listrik per bulan?"
User: "200 ribu"
Bot: "Ada tanggungan sekolah anak? Berapa per bulan?"
User: "300 ribu"
Bot: "Ada cicilan atau arisan bulanan?"
User: "500 ribu arisan"

Bot: "📊 *Estimasi Kapasitas Usaha*
Omset: Rp 12.500.000/bulan
Modal: Rp 7.500.000
Laba Kotor: Rp 5.000.000
Pengeluaran: Rp 1.000.000
Sisa Bersih: Rp 4.000.000

💰 Kemampuan cicilan: ~Rp 1.200.000/bulan (30%)

Ini estimasi awal. Petugas lapangan akan verifikasi."
```

### RPC Formula

```javascript
// In CapacityService.js
calculateRPC(data) {
  const monthlyRevenue = data.daily_revenue * data.active_days;
  const cogs = monthlyRevenue * (data.cogs_percentage / 100);
  const grossProfit = monthlyRevenue - cogs;
  
  // Household expenses (use proxies)
  const householdExp = this.estimateHouseholdExpenses(data);
  
  const sustainableDisposableCash = grossProfit - householdExp - data.existing_debt_monthly;
  
  // 30% buffer rule from Amartha
  const maxInstallment = sustainableDisposableCash * 0.30;
  
  return {
    monthly_revenue: monthlyRevenue,
    gross_profit: grossProfit,
    sustainable_disposable_cash: sustainableDisposableCash,
    max_installment: Math.max(0, maxInstallment),
    rpc_ratio: sustainableDisposableCash / (data.existing_debt_monthly || 1)
  };
}

estimateHouseholdExpenses(data) {
  // Proxy-based estimation
  const basePerPerson = 500000; // Rp 500k/person/month baseline
  const electricityMultiplier = data.electricity_monthly / 100000; // Higher = higher lifestyle
  const schoolCost = data.school_children * 300000;
  
  return (data.household_members * basePerPerson * electricityMultiplier) + schoolCost;
}
```

---

## 3. Cashpor Housing Index via Image

### Gap Addressed
- Currently: Field Officers visually assess housing
- Solution: Vision AI extracts housing quality from uploaded photos

### Already Built (imageAnalyzer.js)
Your existing `extractBusinessIntelligence()` already handles building analysis. Extend it:

```javascript
// Add to extractBusinessIntelligence prompt
HOUSING_INDEX (for home photos):
- roof_material: "thatch" | "tin" | "tile" | "concrete"
- wall_material: "bamboo" | "wood" | "brick" | "cement"
- floor_material: "dirt" | "cement" | "ceramic"
- sanitation_visible: boolean
- electricity_visible: boolean
- cashpor_score: 1-9 (calculated)
```

### Scoring

```javascript
// In ImageAnalyzer or separate HousingService
calculateCashporIndex(extracted) {
  const scores = {
    roof: { thatch: 1, tin: 2, tile: 3, concrete: 3 },
    wall: { bamboo: 1, wood: 2, brick: 3, cement: 3 },
    floor: { dirt: 1, cement: 2, ceramic: 3 }
  };
  
  return scores.roof[extracted.roof_material] +
         scores.wall[extracted.wall_material] +
         scores.floor[extracted.floor_material];
  // Range: 3-9, higher = more stable household
}
```

---

## 4. Majelis Attendance Tracking

### Gap Addressed
- Currently: Manual attendance at weekly meetings
- Solution: WhatsApp check-in, early warning for dropouts

### Data Model

```javascript
// Extend Majelis entity
Majelis.createAttendance = (data) => ({
  date: data.date,
  week_number: data.week_number,
  attendees: [],           // [{ phone, checked_in_at, method: 'whatsapp'|'manual' }]
  absentees: [],           // [{ phone, consecutive_absences }]
  tanggung_renteng_triggered: false,
  notes: '',
  created_at: new Date().toISOString()
});

// Add to User
User.attendance = {
  total_meetings: 0,
  attended: 0,
  attendance_rate: 0,      // 0-100%
  consecutive_absences: 0, // Early warning if >= 2
  last_attendance: null
};
```

### Flow

```
[Weekly cron job or Field Officer triggers]
Bot → All Majelis members: "📅 Pengingat: Pertemuan Majelis [Name] hari ini jam [Time]. Ketik HADIR untuk konfirmasi."

User: "HADIR"
Bot: "✅ Kehadiran tercatat. Sampai jumpa di [Location]!"

[After meeting time]
Bot → Absent members: "Kami tidak melihat konfirmasi kehadiran Ibu hari ini. Semoga sehat selalu. Jika ada kendala, hubungi ketua majelis."
```

### Group Health Score

```javascript
// In MajelisService.js
calculateGroupHealthScore(majelisId) {
  const members = await this.getMembers(majelisId);
  
  const avgAttendance = members.reduce((sum, m) => sum + m.attendance_rate, 0) / members.length;
  const aScores = members.map(m => m.crbi_score || 50);
  const avgAScore = aScores.reduce((a, b) => a + b, 0) / aScores.length;
  const variance = this.calculateVariance(aScores);
  
  // High variance = risky (mix of good and bad borrowers)
  const variancePenalty = Math.min(variance / 100, 0.3);
  
  const groupScore = (avgAScore * 0.5) + (avgAttendance * 0.5) - (variancePenalty * 100);
  
  return {
    score: Math.round(groupScore),
    avg_attendance: avgAttendance,
    avg_a_score: avgAScore,
    variance: variance,
    risk_level: groupScore > 70 ? 'low' : groupScore > 50 ? 'medium' : 'high',
    flagged_members: members.filter(m => m.consecutive_absences >= 2)
  };
}
```

---

## 5. Financial Literacy as Risk Signal

### Already Built (QuizService.js)
Your 15-week quiz system is perfect. Add correlation tracking:

```javascript
// Add to User.literacy
literacy: {
  week_01: { score: 100, completed: true },
  // ...
  completion_rate: 0.6,        // 60% = 9/15 weeks
  avg_score: 85,
  commitment_signal: 'high'    // Completed LWK = high commitment
}
```

### LWK (Pre-Loan Training) Module

```javascript
// Special 2-day training quiz (mandatory before first loan)
const LWK_MODULES = [
  { id: 'lwk_day1', name: 'Pemisahan Uang Usaha & Pribadi', questions: 10 },
  { id: 'lwk_day2', name: 'Memahami Tanggung Renteng', questions: 10 }
];

// In QuizService
async startLWK(phone) {
  // Must complete both modules with 80%+ to be eligible for loan
  // Acts as "Commitment Device" - filters out non-serious borrowers
}
```

---

## 6. Composite A-Score Calculation

### Bringing It Together

```javascript
// In CreditScoringService.js
async calculateAScore(phone) {
  const user = await UserRepository.findByPhone(phone);
  
  // Individual Score Components
  const P_crbi = user.psychometric?.crbi_score || 50;  // Default 50 if not assessed
  const D_demo = this.calculateDemographicScore(user);
  const C_cap = this.calculateCapacityScore(user);
  const H_hist = this.calculateHistoryScore(user);
  
  // Weights shift based on loan cycle
  const cycle = user.loan?.cycle || 0;
  const weights = cycle === 0 
    ? { crbi: 0.40, demo: 0.25, cap: 0.25, hist: 0.10 }  // New borrower: psychometric heavy
    : { crbi: 0.20, demo: 0.15, cap: 0.25, hist: 0.40 }; // Repeat: history heavy
  
  const S_ind = 
    (P_crbi * weights.crbi) +
    (D_demo * weights.demo) +
    (C_cap * weights.cap) +
    (H_hist * weights.hist);
  
  // Group Score (if in Majelis)
  let S_group = 50; // Default
  if (user.majelis_id) {
    const groupHealth = await MajelisService.calculateGroupHealthScore(user.majelis_id);
    S_group = groupHealth.score;
  }
  
  // Final A-Score (60% individual, 40% group)
  const A_Score = (S_ind * 0.6) + (S_group * 0.4);
  
  return {
    a_score: Math.round(A_Score),
    components: { P_crbi, D_demo, C_cap, H_hist, S_group },
    risk_zone: this.getRiskZone(S_ind, S_group),
    recommended_action: this.getRecommendation(S_ind, S_group)
  };
}

getRiskZone(S_ind, S_group) {
  if (S_ind >= 70 && S_group >= 70) return 'A'; // Auto-approve
  if (S_ind >= 70 && S_group < 70) return 'B';  // Approve, lower limit
  if (S_ind < 70 && S_group >= 70) return 'C';  // Approve with coaching
  return 'D'; // Reject
}
```

---

## Implementation Priority

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Attendance Tracking | High (early warning) | Low | 1 |
| LWK Training Module | High (commitment filter) | Low | 2 |
| CRBI Psychometric | High (Character score) | Medium | 3 |
| RPC Calculator | High (Capacity score) | Medium | 4 |
| Cashpor via Image | Medium (already partial) | Low | 5 |
| A-Score Dashboard | High (visibility) | Medium | 6 |

---

## Files to Create/Modify

```
src/
├── services/
│   ├── PsychometricService.js    # NEW
│   ├── CapacityService.js        # NEW
│   ├── CreditScoringService.js   # NEW
│   ├── AttendanceService.js      # NEW
│   └── QuizService.js            # MODIFY (add LWK)
├── repositories/
│   ├── PsychometricRepository.js # NEW
│   └── AttendanceRepository.js   # NEW
├── core/
│   └── User.js                   # MODIFY (add psychometric, capacity)
└── chatbot/
    └── aiEngine.js               # MODIFY (add tools)
```
