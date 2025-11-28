# Icon System

## Libraries

### Lucide Icons (Primary)
**Usage**: All UI controls, actions, navigation
**Size**: 14-16px

```bash
npm install lucide-preact
```

```javascript
import { Check, X, Trash2, Plus, Edit2 } from 'lucide-preact';

<button><Check size={16} /> Verify</button>
```

### Emoji Icons (Secondary)
**Usage**: Business type categorization ONLY

NOT for UI controls, navigation, or actions.

## Icon Mapping

### User Management
- Verify: `<Check />`
- Reject: `<X />`
- Delete: `<Trash2 />`
- Populate mock: `<Dice5 />`
- Delete all: `<Trash />`

### Majelis Management
- Create: `<Plus />`
- Schedule: `<Calendar />`
- Location: `<MapPin />`
- Members: `<Users />`
- Add member: `<UserPlus />`
- Edit: `<Edit2 />`
- Delete: `<Trash2 />`
- Remove: `<X />`

### Business Types (Emoji)
- 🏪 Warung Sembako/Kelontong
- 🍽️ Warung Makan
- ☕ Coffee Shop
- 🍪 Jajanan/Camilan
- 👗 Fashion/Hijab
- 📱 Elektronik/Gadget
- 🐾 Pet Shop
- 🧱 Bahan Bangunan
- 🎮 Mainan/Hobi
- 👕 Laundry
- 🏍️ Bengkel Motor
- 💇 Kecantikan/Salon
- ✂️ Penjahit/Permak
- 🏠 Kos-kosan/Penginapan
- 📦 Logistik/Ekspedisi
- 🚗 Sewa Kendaraan
- 🚿 Cuci Steam/Detailing
- 💊 Apotek/Obat
- 🎉 Event/Wedding
- 🔧 Bengkel Las/Bubut
- 🏗️ Kontraktor/Renovasi
- 🎨 Kriya/Kerajinan
- 🌱 Petani/Holtikultura
- 🐟 Nelayan/Ikan
- 🏢 Default

## Size Standards

| Context | Size |
|---------|------|
| Primary buttons | 16px |
| Secondary buttons | 14px |
| Display icons | 14px |
| Small icons | 12px |

## Accessibility

```javascript
// Tooltip
<button title="Delete user">
  <Trash2 size={16} />
</button>

// ARIA label
<button aria-label="Verify user">
  <Check size={16} />
</button>
```

## Migration

**Before**:
```javascript
<button>✓ Verify</button>
```

**After**:
```javascript
import { Check } from 'lucide-preact';
<button><Check size={16} /> Verify</button>
```
