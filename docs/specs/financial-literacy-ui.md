# Financial Literacy UI

## Design Principles

**High-density interface**: Compact spacing, minimal whitespace, enterprise-grade layout

**Icon System**:
- Lucide icons for UI controls
- Emoji icons for business types only

## Features

### 1. Module Grouping

Hardcoded module names:
- **Modul 1**: Fondasi Keuangan dan Pencatatan
- **Modul 2**: Pengelolaan Arus Kas
- **Modul 3**: Perencanaan Usaha
- **Modul 4**: Literasi Digital dan Keamanan

```javascript
const getModuleName = (moduleNum) => {
  const names = {
    1: 'Fondasi Keuangan dan Pencatatan',
    2: 'Pengelolaan Arus Kas',
    3: 'Perencanaan Usaha',
    4: 'Literasi Digital dan Keamanan'
  };
  return names[moduleNum] || `Module ${moduleNum}`;
};
```

### 2. Week Cards

Display: Week number, title, quiz count
Remove: Module indicator badge

### 3. Placeholder Replacement

Replace `[Sapaan]` with "Anda" in web UI only (not database, not WhatsApp)

```javascript
const replacePlaceholder = (text) => {
  if (!text || typeof text !== 'string') return text;
  return text.replace(/\[Sapaan\]/gi, 'Anda');
};
```

### 4. Modal Display

**Section 1: Quizzes**
- Show all options from `options` array
- Highlight correct answer (green background, checkmark)
- Display explanation below

**Section 2: Metadata**
- Description
- Materi penyampaian (all items)
- Indikator kelulusan (count)
- Logika feedback (count)
- Source doc ID (clickable link)
- Import timestamp

## Browser Caching

Cache key: `financialLiteracy`
TTL: 24 hours

```javascript
const cached = localStorage.getItem('financialLiteracy');
if (cached) {
  const { data, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp < 86400000) {
    setWeeks(data);
    return;
  }
}

// Fetch and cache
localStorage.setItem('financialLiteracy', JSON.stringify({ 
  data, 
  timestamp: Date.now() 
}));
```

## Testing Checklist

- [ ] Weeks grouped by module
- [ ] Module headers show correct names
- [ ] Week cards don't show M1/M2 badges
- [ ] Modal opens on click
- [ ] `[Sapaan]` replaced with "Anda"
- [ ] All quiz options displayed
- [ ] Correct answers highlighted
- [ ] Explanations shown
- [ ] Metadata section complete
- [ ] Source link works
- [ ] Cache works (instant load on revisit)
