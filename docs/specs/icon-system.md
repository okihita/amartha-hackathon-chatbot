# Icon System Specification

## Overview
Standardized icon usage across the Amartha WhatsApp Chatbot admin dashboard.

## Icon Libraries

### Lucide Icons (Primary)
**Library**: `lucide-preact`  
**Usage**: All UI controls, actions, and navigation elements  
**Size**: 14-16px for consistency

**Installation**:
```bash
npm install lucide-preact
```

**Import**:
```javascript
import { Check, X, Trash2, Plus, Edit2 } from 'lucide-preact';
```

**Benefits**:
- Professional SVG icons
- Tree-shakeable (only imports used icons)
- Consistent sizing and styling
- Accessible (proper ARIA attributes)
- Cross-platform rendering
- Lightweight (~1KB per icon)

### Emoji Icons (Secondary)
**Usage**: Business type categorization ONLY  
**Rationale**: Quick visual recognition, culturally appropriate for Indonesian UMKM context

**NOT used for**:
- ❌ UI controls or buttons
- ❌ Navigation elements
- ❌ Action indicators
- ❌ Status badges

## Icon Mapping

### User Management Page

| Action | Icon | Component | Size |
|--------|------|-----------|------|
| Verify user | `<Check />` | Button | 16px |
| Reject user | `<X />` | Button | 16px |
| Delete user | `<Trash2 />` | Button | 16px |
| Populate mock | `<Dice5 />` | Button | 16px |
| Delete all mock | `<Trash />` | Button | 16px |

**Implementation**:
```javascript
import { Check, X, Trash2, Dice5, Trash } from 'lucide-preact';

<button class="btn btn-icon btn-success">
  <Check size={16} />
</button>
```

### Majelis Management Page

| Element | Icon | Component | Size |
|---------|------|-----------|------|
| Create majelis | `<Plus />` | Button | 16px |
| Schedule indicator | `<Calendar />` | Display | 14px |
| Location indicator | `<MapPin />` | Display | 14px |
| Member count | `<Users />` | Display | 14px |
| Add member | `<UserPlus />` | Button | 14px |
| Edit majelis | `<Edit2 />` | Button | 14px |
| Delete majelis | `<Trash2 />` | Button | 14px |
| Remove member | `<X />` | Button | 14px |

**Implementation**:
```javascript
import { Plus, Edit2, Trash2, X, UserPlus, Calendar, MapPin, Users } from 'lucide-preact';

<div class="info-row">
  <span><Calendar size={14} /> {schedule_day} {schedule_time}</span>
  <span><MapPin size={14} /> {location}</span>
</div>
```

### Business Types (Emoji Icons)

| Business Type | Emoji | Keywords |
|---------------|-------|----------|
| Warung Sembako/Kelontong | 🏪 | warung sembako, kelontong |
| Warung Makan | 🍽️ | warung makan |
| Coffee Shop | ☕ | coffee |
| Jajanan/Camilan | 🍪 | jajanan, camilan |
| Minuman | 🧋 | minuman |
| Fashion/Hijab | 👗 | fashion, hijab |
| Elektronik/Gadget | 📱 | elektronik, gadget |
| Pet Shop | 🐾 | pet shop |
| Bahan Bangunan | 🧱 | bahan bangunan |
| Mainan/Hobi | 🎮 | mainan, hobi |
| Laundry | 👕 | laundry |
| Bengkel Motor | 🏍️ | bengkel motor |
| Kecantikan/Salon | 💇 | kecantikan, salon |
| Penjahit/Permak | ✂️ | penjahit, permak |
| Kos-kosan/Penginapan | 🏠 | kos-kosan, penginapan |
| Logistik/Ekspedisi | 📦 | logistik, ekspedisi |
| Sewa Kendaraan | 🚗 | sewa kendaraan |
| Cuci Steam/Detailing | 🚿 | cuci steam, detailing |
| Apotek/Obat | 💊 | apotek, obat |
| Event/Wedding | 🎉 | event, wedding |
| Bengkel Las/Bubut | 🔧 | bengkel las, bubut |
| Kontraktor/Renovasi | 🏗️ | kontraktor, renovasi |
| Kriya/Kerajinan | 🎨 | kriya, kerajinan |
| Petani/Holtikultura | 🌱 | petani, holtikultura |
| Nelayan/Ikan | 🐟 | nelayan, ikan |
| Default | 🏢 | (fallback) |

**Implementation**:
```javascript
const BUSINESS_ICONS = {
  'warung sembako': '🏪',
  'kelontong': '🏪',
  'warung makan': '🍽️',
  // ... etc
};

function getBusinessIcon(businessType) {
  const type = businessType.toLowerCase();
  for (const [key, icon] of Object.entries(BUSINESS_ICONS)) {
    if (type.includes(key)) return icon;
  }
  return '🏢'; // Default
}
```

## Styling Guidelines

### Button Icons
```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px; /* Space between icon and text */
}

.btn-icon {
  padding: 6px 10px;
  min-width: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

### Inline Icons
```css
.info-row span {
  display: inline-flex;
  align-items: center;
  gap: 4px; /* Space between icon and text */
}
```

### Remove Button
```css
.btn-remove-member {
  display: inline-flex;
  align-items: center;
  padding: 0 8px;
}
```

## Size Standards

| Context | Size | Usage |
|---------|------|-------|
| Primary buttons | 16px | Main actions (verify, delete, create) |
| Secondary buttons | 14px | Inline actions (edit, add member) |
| Display icons | 14px | Status indicators (calendar, location) |
| Small icons | 12px | Compact contexts (badges, chips) |

## Accessibility

### Tooltips
Always add `title` attribute for icon-only buttons:
```javascript
<button class="btn btn-icon" title="Delete user">
  <Trash2 size={16} />
</button>
```

### ARIA Labels
For screen readers:
```javascript
<button class="btn btn-icon" aria-label="Verify user">
  <Check size={16} />
</button>
```

## Migration Guide

### From Emojis to Lucide

**Before**:
```javascript
<button class="btn">✓ Verify</button>
<button class="btn">✗ Reject</button>
<button class="btn">🗑️ Delete</button>
```

**After**:
```javascript
import { Check, X, Trash2 } from 'lucide-preact';

<button class="btn"><Check size={16} /> Verify</button>
<button class="btn"><X size={16} /> Reject</button>
<button class="btn"><Trash2 size={16} /> Delete</button>
```

## Future Considerations

- [ ] Add icon color variants for different states
- [ ] Create icon component wrapper for consistent sizing
- [ ] Add animation support for loading states
- [ ] Consider custom icon set for Amartha branding
- [ ] Add dark mode icon variants
