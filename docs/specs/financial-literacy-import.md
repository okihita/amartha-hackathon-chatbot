# Financial Literacy Import Specification

## Overview
Import script for financial literacy course content from Google Drive documents into Firestore.

## Import Strategy: Nuclear Cleanup

### Approach
**Complete collection deletion before import** - ensures clean state and prevents stale data.

**Benefits**:
- ✅ No stale data from previous imports
- ✅ Schema changes handled automatically
- ✅ Deleted content properly removed
- ✅ Predictable database state
- ✅ Easier debugging and validation

**Process**:
1. Delete entire `financial_literacy` collection
2. Import all documents from scratch
3. Atomic operation - all or nothing

```javascript
async function clearCollection() {
  const snapshot = await db.collection('financial_literacy').get();
  const batch = db.batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
}
```

## Document Structure

### Firestore Collection: `financial_literacy`

**Document ID Convention**: `week_{number}` (zero-padded)
- Examples: `week_01`, `week_02`, `week_15`
- Benefits: Alphabetical sorting, easy browsing, direct access
- Query: `db.collection('financial_literacy').doc('week_05').get()`

### Data Model
```javascript
{
  week_number: 1,              // Primary key
  module_number: 1,            // Grouping metadata
  module_name: "Modul 1 - Minggu 1: Title",
  description: "Week overview",
  
  materi_penyampaian: {
    pancingan_awal: [],        // Hook to gain attention
    materi_inti: [],           // Core learning content
    instruksi_aksi: []         // Actionable items for user
  },
  
  bank_soal: [                 // Quiz questions
    {
      question: "Question text",
      options: ["A", "B", "C", "D"],
      correct: 1,              // Index of correct answer
      explanation: "Rationale"
    }
  ],
  
  indikator_kelulusan: [       // Bullet points from section
    "Indicator 1",
    "Indicator 2"
  ],
  
  logika_feedback: {           // Feedback logic with subsections
    jawaban_benar: [           // If answer is correct
      "Feedback 1",
      "Feedback 2"
    ],
    jawaban_salah: [           // If answer is wrong
      "Feedback 1",
      "Feedback 2"
    ]
  },
  
  source_doc_id: "google_doc_id",
  imported_at: "2025-11-23T10:00:00Z",
  modified_at: "2025-11-23T10:00:00Z"
}
```

## Parsing Rules

### 1. Materi Penyampaian
**Purpose**: Instructions for chatbot delivery

**Three Subsections**:
- **Pancingan Awal (Hook)**: Attention-grabbing introduction
- **Materi Inti (Content)**: Core learning material
- **Instruksi Aksi (Actionable)**: User confirmation/testing steps

**Parsing Logic**:
- Detect subsection headers (case-insensitive)
- Collect all content under each subsection
- Stop at next major section (Bank Soal, Indikator, etc.)

**Display**:
- Show as nested structure with icons
- 🎣 Pancingan Awal (blue)
- 📖 Materi Inti (green)
- ✅ Instruksi Aksi (orange)

### 2. Indikator Kelulusan
**Purpose**: Passing criteria for the week

**Parsing Logic**:
- Find "Indikator Kelulusan" section
- Skip first paragraph (section description)
- Extract numbered or bulleted items only
- Patterns: starts with `1.`, `2.`, `-`, or `•`
- Remove markers from stored text

**Example**:
```
Input:
  Indikator Kelulusan:
  Peserta dianggap lulus jika memenuhi kriteria berikut:
  1. Dapat membedakan uang usaha dan pribadi
  2. Mampu menjelaskan konsep dua dompet
  3. Berkomitmen memisahkan keuangan

Output:
  [
    "Dapat membedakan uang usaha dan pribadi",
    "Mampu menjelaskan konsep dua dompet",
    "Berkomitmen memisahkan keuangan"
  ]
```

### 3. Logika Feedback
**Purpose**: Feedback messages based on quiz performance

**Two Subsections**:
- **Jawaban Benar**: Feedback when answer is correct
- **Jawaban Salah**: Feedback when answer is wrong

**Parsing Logic**:
- Find "Logika Feedback" section
- Detect subsections: "Jawaban Benar", "Jika Benar", "Bila Benar"
- Detect subsections: "Jawaban Salah", "Jika Salah", "Bila Salah"
- Extract numbered or bulleted items under each subsection
- Store as structured object with two arrays

**Example**:
```
Input:
  Logika Feedback:
  
  Jawaban Benar:
  1. Selamat! Anda memahami konsep dengan baik
  2. Teruskan pembelajaran ke materi berikutnya
  
  Jawaban Salah:
  1. Jangan khawatir, mari kita pelajari lagi
  2. Baca kembali materi tentang pemisahan uang

Output:
  {
    jawaban_benar: [
      "Selamat! Anda memahami konsep dengan baik",
      "Teruskan pembelajaran ke materi berikutnya"
    ],
    jawaban_salah: [
      "Jangan khawatir, mari kita pelajari lagi",
      "Baca kembali materi tentang pemisahan uang"
    ]
  }
```

### 3. Bank Soal (Quiz Storage)
**IMPORTANT**: Renamed from `quizzes` to `bank_soal`

**Rationale**:
- Eliminates redundancy (old structure had both bank_soal and quizzes)
- Aligns with Indonesian terminology
- Clearer semantic meaning

**Parsing Logic**:
- Detect questions (starts with number: `1.`, `2.`, etc.)
- Extract options (A., B., C., D.)
- Identify correct answer (marked with ✅ or ✓)
- Extract explanation (line starting with "Pembahasan:")

**Data Structure**:
```javascript
{
  question: "Question text",
  options: ["Option A", "Option B", "Option C", "Option D"],
  correct: 1,  // 0-based index
  explanation: "Why this is correct"
}
```

## Frontend Integration

### API Response
Frontend expects `bank_soal` field (not `quizzes`):

```javascript
// Filter weeks with quizzes
const filtered = data.filter(w => 
  w.week_number && w.bank_soal && w.bank_soal.length > 0
);

// Display quiz count
const quizCount = week.bank_soal?.length || 0;

// Render quizzes
{selectedWeek.bank_soal.map((quiz, idx) => ...)}
```

### Materi Penyampaian Display
Show structured subsections:

```jsx
{selectedWeek.materi_penyampaian.pancingan_awal?.length > 0 && (
  <div>
    <strong>🎣 Pancingan Awal (Hook):</strong>
    <ul>{items}</ul>
  </div>
)}
```

## Migration Path

### From Old to New Structure

**Old Structure**:
```javascript
{
  materi_penyampaian: ["item1", "item2"],  // Flat array
  bank_soal: ["raw text"],                 // Unparsed
  quizzes: [{...}]                         // Redundant
}
```

**New Structure**:
```javascript
{
  materi_penyampaian: {                    // Structured object
    pancingan_awal: [],
    materi_inti: [],
    instruksi_aksi: []
  },
  bank_soal: [{...}]                       // Parsed quizzes (no redundancy)
}
```

### Running the Import

```bash
# Run new import script
node scripts/import-financial-literacy-v2.js

# Verify in dashboard
# Visit: /financial-literacy
# Check: Materi Penyampaian shows subsections
# Check: Bank Soal displays correctly
```

## Testing Checklist

- [ ] Collection is cleared before import
- [ ] All documents imported successfully
- [ ] Week numbers extracted correctly
- [ ] Materi penyampaian has three subsections
- [ ] Pancingan awal, materi inti, instruksi aksi populated
- [ ] Indikator kelulusan contains bullet points only
- [ ] Bank soal contains parsed quizzes
- [ ] Correct answers identified (checkmark detection)
- [ ] Explanations extracted
- [ ] Frontend displays bank_soal correctly
- [ ] Materi penyampaian shows structured subsections
- [ ] No redundant quizzes field
- [ ] Source doc ID and timestamps saved

## Error Handling

- Skip documents without week numbers
- Handle missing subsections gracefully
- Default correct answer to 0 if not found
- Log warnings for malformed content
- Continue import even if one document fails
