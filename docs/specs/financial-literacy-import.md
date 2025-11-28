# Financial Literacy Import

## Strategy: Nuclear Cleanup

Delete entire collection before import - ensures clean state, no stale data.

```javascript
async function clearCollection() {
  const snapshot = await db.collection('financial_literacy').get();
  const batch = db.batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
}
```

## Document Structure

**Collection**: `financial_literacy`
**Document ID**: `week_01`, `week_02`, etc.

```javascript
{
  week_number: 1,
  module_number: 1,
  module_name: "Modul 1 - Minggu 1: Title",
  description: "Week overview",
  
  materi_penyampaian: {
    pancingan_awal: [],    // Hook
    materi_inti: [],       // Core content
    instruksi_aksi: []     // Actions
  },
  
  bank_soal: [             // Quizzes
    {
      question: "...",
      options: ["A", "B", "C", "D"],
      correct: 1,          // Index (0-based)
      explanation: "..."
    }
  ],
  
  indikator_kelulusan: [], // Passing criteria
  
  logika_feedback: {
    jawaban_benar: [],     // Correct feedback
    jawaban_salah: []      // Wrong feedback
  },
  
  source_doc_id: "...",
  imported_at: "...",
  modified_at: "..."
}
```

## Parsing Rules

### Materi Penyampaian
Three subsections:
- **Pancingan Awal**: Hook/introduction
- **Materi Inti**: Core content
- **Instruksi Aksi**: Actionable steps

### Indikator Kelulusan
- Skip first paragraph (description)
- Extract numbered/bulleted items only
- Remove markers from text

### Logika Feedback
Two subsections:
- **Jawaban Benar**: Correct answer feedback
- **Jawaban Salah**: Wrong answer feedback

### Bank Soal
- Detect questions (starts with number)
- Extract options (A., B., C., D.)
- Identify correct (marked with ✅)
- Extract explanation ("Pembahasan:")

## Running Import

```bash
node scripts/import-financial-literacy.js
```

## Testing Checklist

- [ ] Collection cleared before import
- [ ] All documents imported
- [ ] Week numbers extracted
- [ ] Materi has three subsections
- [ ] Indikator has bullet points only
- [ ] Bank soal parsed correctly
- [ ] Correct answers identified
- [ ] Explanations extracted
- [ ] Frontend displays correctly
