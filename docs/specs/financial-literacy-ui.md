# Financial Literacy UI Specification

## Design Principles

### Information Density
**High-density, enterprise-grade interface** - maximize information per screen while maintaining readability.

**Guidelines**:
- Compact spacing (8px-12px between elements)
- Dense typography (14px body, 16px headings)
- Minimal whitespace, purposeful padding
- Grid layouts for efficient space usage
- Collapsible sections for optional details
- Table-like structures for structured data

**Visual Style**:
- Clean, professional appearance
- Subtle borders and dividers
- Muted color palette (grays, blues)
- Icons for quick scanning
- Consistent alignment and spacing
- Enterprise dashboard aesthetic

**Avoid**:
- ❌ Large padding/margins
- ❌ Oversized fonts
- ❌ Excessive whitespace
- ❌ Decorative elements
- ❌ Consumer-app styling

## Overview
This document specifies the UI/UX requirements for the Financial Literacy course dashboard.

## Requirements

### 1. Module Grouping
**Requirement**: Group weeks by module number with hardcoded module names.

**Module Names** (Hardcoded):
- **Modul 1**: Fondasi Keuangan dan Pencatatan
- **Modul 2**: Pengelolaan Arus Kas
- **Modul 3**: Perencanaan Usaha
- **Modul 4**: Literasi Digital dan Keamanan

**Implementation**:
- Weeks are grouped by `module_number` field
- Module names are hardcoded (not derived from week data)
- Week titles are taken from `module_name` field (after removing "Modul X -" prefix)
- Each module is displayed in a separate card section
- Module header shows: "Modul {number}: {hardcoded_name}"

**Rationale**:
- Modules don't have names in the database
- Week data contains full titles like "Modul 1 - Minggu 1: Title"
- We extract only the week-specific title for display
- Module names are consistent across the application

**Example**:
```
Modul 1: Fondasi Keuangan dan Pencatatan
  [Week 1: Pengenalan Dasar] [Week 2: Pencatatan] [Week 3: Analisis]

Modul 2: Pengelolaan Arus Kas
  [Week 4: Pemasukan] [Week 5: Pengeluaran] [Week 6: Saldo]
```

### 2. Week Card Display
**Requirement**: Simplify week cards by removing module indicator.

**Changes**:
- ❌ Remove: `M{module_number}` badge from week cards
- ✅ Keep: Week number, title, and quiz count
- Rationale: Module context is already provided by the grouping

**Before**:
```
┌─────────────────┐
│ Week 1      M1  │
│ Title           │
│ 5 questions     │
└─────────────────┘
```

**After**:
```
┌─────────────────┐
│ Week 1          │
│ Title           │
│ 5 questions     │
└─────────────────┘
```

### 3. Placeholder Replacement
**Requirement**: Replace `[Sapaan]` placeholder with "Anda" in the web dashboard only.

**Scope**:
- ✅ Apply to: Quiz questions and options displayed in the web UI
- ❌ Do NOT modify: Database content
- ❌ Do NOT modify: WhatsApp chatbot responses (handled separately)

**Implementation**:
```javascript
const replacePlaceholder = (text) => {
  if (!text || typeof text !== 'string') return text;
  return text.replace(/\[Sapaan\]/gi, 'Anda');
};
```

**Error Handling**:
- Check if value exists and is a string before calling `.replace()`
- Return original value if not a string (prevents TypeError)
- Case-insensitive replacement with `/gi` flag

**Example**:
- Database: "Apa yang [Sapaan] lakukan untuk menabung?"
- Web Display: "Apa yang Anda lakukan untuk menabung?"
- WhatsApp: "Apa yang Ibu Siti lakukan untuk menabung?" (uses actual user name)

## Technical Details

### Component: `FinancialLiteracy.jsx`

**Module Name Mapping** (Hardcoded):
```javascript
const getModuleName = (moduleNum) => {
  const moduleNames = {
    1: 'Fondasi Keuangan dan Pencatatan',
    2: 'Pengelolaan Arus Kas',
    3: 'Perencanaan Usaha',
    4: 'Literasi Digital dan Keamanan'
  };
  return moduleNames[moduleNum] || `Module ${moduleNum}`;
};
```

**Data Structure**:
```javascript
{
  week_number: 1,
  module_number: 1,
  module_name: "Modul 1 - Minggu 1: Pengenalan Dasar Keuangan", // Full title
  
  materi_penyampaian: {
    pancingan_awal: ["Hook items"],
    materi_inti: ["Content items"],
    instruksi_aksi: ["Actionable items"]
  },
  
  bank_soal: [  // Renamed from quizzes
    {
      question: "Apa yang [Sapaan] lakukan?",
      options: [
        "Option A text",
        "Option B text", 
        "Option C text",
        "Option D text"
      ],
      correct: 1,  // Index of correct answer (0-based)
      explanation: "Rationale text here"
    }
  ]
}
```

**Quiz Data Structure Notes**:
- Field name: `bank_soal` (not `quizzes` - eliminates redundancy)
- `options` is an array of strings (not option_a, option_b, etc.)
- `correct` is a zero-based index (0 = first option, 1 = second option, etc.)
- `explanation` contains the answer rationale
- Option labels (a, b, c, d) are generated from array index: `String.fromCharCode(97 + optIdx)`

**Title Extraction**:
```javascript
// Extract week-specific title from full module_name
let title = week.module_name || `Week ${week.week_number}`;
title = title.replace(/^Modul\s+\d+\s*-\s*/i, '');  // Remove "Modul X -"
title = title.replace(/^Minggu\s+\d+:\s*/i, '');    // Remove "Minggu X:"
// Result: "Pengenalan Dasar Keuangan"
```

**Grouping Logic**:
```javascript
const groupedByModule = weeks.reduce((acc, week) => {
  const moduleNum = week.module_number || 0;
  if (!acc[moduleNum]) acc[moduleNum] = [];
  acc[moduleNum].push(week);
  return acc;
}, {});
```

### Modal Display
**Requirement**: Show two sections when a week card is clicked.

#### Section 1: Quizzes
**STRICT REQUIREMENT**: All quiz options MUST be displayed with the correct answer clearly highlighted.

Display all quiz questions with:
- Question text with `[Sapaan]` replaced by "Anda"
- ALL answer options from the `options` array displayed
- Correct answer (identified by `correct` index) highlighted with:
  - Green background (#d4edda)
  - Green border (2px solid #28a745)
  - Checkmark icon (✅) on the right
- Answer explanation (from `explanation` field) displayed below options in yellow info box

**Implementation Requirements**: 
- Iterate through `quiz.options` array (not option_a/b/c/d fields)
- Compare array index with `quiz.correct` to identify correct answer: `const isCorrect = optIdx === quiz.correct`
- Generate option labels dynamically: `String.fromCharCode(97 + optIdx)` produces 'a', 'b', 'c', 'd'
- Use `quiz.explanation` field (not `quiz.rationale`)
- MUST render all options - no conditional hiding

**Quiz Display Format**:
```
1. [Question text]
   a. [Option 0 from array]
   b. [Option 1 from array] ✅  (highlighted if correct === 1)
   c. [Option 2 from array]
   d. [Option 3 from array]
   
   💡 Pembahasan: [Explanation text]
```

#### Section 2: Week Metadata
Display non-quiz database fields to verify data integrity:

**Fields to Display**:
- `description` - Week overview and target audience (full-width)
- `materi_penyampaian` - Teaching materials (show ALL items, not limited)
- `indikator_kelulusan` - Passing indicators (show count)
- `logika_feedback` - Feedback logic (show count)
- `source_doc_id` - Google Drive source document ID (clickable link)
- `imported_at` - Last import timestamp

**Excluded Fields**:
- ❌ `bank_soal` - Not displayed (redundant with quiz section)

**Source Document Link**:
- Format: `https://docs.google.com/document/d/{source_doc_id}`
- Opens in new tab with `target="_blank"`
- Security: `rel="noopener noreferrer"`
- Styled as blue underlined link

**Purpose**: 
- Verify database is correctly populated
- Confirm import script is working
- Show data freshness for admin review
- Quick access to source Google Doc

**Layout**:
- 2-column grid for metadata fields
- Full-width for description and materi_penyampaian
- Gray background (#f8f9fa) for each field
- Timestamps formatted as locale string

**Example**:
```
📊 Week Metadata
┌─────────────────────────────────────┐
│ Description: Topik: Disiplin...    │
├─────────────────────────────────────┤
│ Materi Penyampaian:                 │
│ • Item 1                            │
│ • Item 2                            │
│ • ... (all items shown)             │
├──────────────────┬──────────────────┤
│ Source Doc ID:   │ Last Imported:   │
│ [clickable link] │ 2025-11-23 10:00 │
├──────────────────┼──────────────────┤
│ Indikator: 3     │ Logika: 5        │
│ items            │ items            │
└──────────────────┴──────────────────┘
```

## User Interaction

### Week Card Click Behavior
**Current Implementation**: Modal Popup

When a user clicks on a week card:
1. `onClick` handler sets `selectedWeek` state
2. Modal overlay appears with week details
3. Modal contains two sections: Quizzes and Metadata
4. Click outside modal or close button (×) dismisses it

**Click Handler**:
```javascript
onClick={() => {
  console.log('Week clicked:', week.week_number);
  setSelectedWeek(week);
}}
```

**Troubleshooting**:
- Cursor changes to pointer on hover
- Console log confirms click registration
- Modal uses fixed positioning with z-index 9999
- Click propagation stopped on modal content

**Alternative Implementation** (if modal conflicts occur):
Navigate to dedicated detail page:
- Route: `/financial-literacy/week/:weekNumber`
- Full page display instead of overlay
- Browser back button returns to list
- Better for mobile/accessibility


1. User sees modules grouped by number
2. Clicks on a week card within a module
3. Modal opens showing all quizzes for that week
4. All `[Sapaan]` placeholders are replaced with "Anda"
5. Correct answers are visually highlighted

### Visual Hierarchy
```
Page Title: Financial Literacy Course - 15 Weeks
  └─ Modul 1: Fondasi Keuangan dan Pencatatan
      └─ Week Cards Grid (Week 1, 2, 3, 4)
  └─ Modul 2: Pengelolaan Arus Kas
      └─ Week Cards Grid (Week 5, 6, 7, 8)
  └─ Modul 3: Perencanaan Usaha
      └─ Week Cards Grid (Week 9, 10, 11, 12)
  └─ Modul 4: Literasi Digital dan Keamanan
      └─ Week Cards Grid (Week 13, 14, 15)
```

## Testing Checklist

- [ ] Weeks are correctly grouped by module
- [ ] Module headers display correct hardcoded names
- [ ] Week cards do not show M1/M2/M3 badges
- [ ] Modal opens when clicking week card
- [ ] All `[Sapaan]` instances are replaced with "Anda"
- [ ] Quiz options are displayed (a, b, c, d)
- [ ] Correct answers are highlighted in green with 2px border and checkmark
- [ ] Answer rationale is displayed below each quiz in yellow box
- [ ] Metadata section shows all non-quiz fields
- [ ] Import timestamp is displayed correctly
- [ ] Source document ID is a clickable link to Google Docs
- [ ] Source link opens in new tab
- [ ] Materi penyampaian shows ALL items (not limited to 5)
- [ ] Bank soal field is NOT displayed in metadata
- [ ] Database content remains unchanged
- [ ] Responsive layout works on mobile/tablet

## Future Enhancements

- Add progress tracking per module
- Show completion status for each week
- Add search/filter functionality
- Export quiz results
