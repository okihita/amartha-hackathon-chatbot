# User Management UI

## Design Principles

**High-density interface**: Compact spacing, table layout, icon-only buttons

**User Feedback**:
- Toast notifications (success/error, 3s auto-dismiss)
- Confirm dialogs for destructive actions
- NO browser native alert/confirm

**Icons**: Lucide at 16px for consistency

## Features

### 1. Sortable Table

Click column headers to sort:
- Name, Phone, Business Type, Location, Majelis, Status
- Indicators: `⇅` (unsorted), `↑` (asc), `↓` (desc)

```javascript
const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

const handleSort = (key) => {
  let direction = 'asc';
  if (sortConfig.key === key && sortConfig.direction === 'asc') {
    direction = 'desc';
  }
  setSortConfig({ key, direction });
};
```

### 2. User Actions

- `<Check />` - Verify (sets `is_verified: true`)
- `<X />` - Reject (sets `is_verified: false`)
- `<Trash2 />` - Delete (with confirmation)
- Click name → Navigate to `/user-profile/:phone`

### 3. Superadmin Controls

**Populate Mock Data**:
- Button: `<Dice5 /> Populate Mock Data`
- Endpoint: `POST /api/superadmin/populate-mock`
- Creates 8 mock users with `is_mock: true`

Mock users:
- Siti Nurhaliza - Warung Kelontong (Jakarta Selatan)
- Dewi Lestari - Toko Pakaian (Bandung)
- Rina Susanti - Warung Makan (Surabaya)
- Maya Sari - Salon Kecantikan (Yogyakarta)
- Ani Wijaya - Toko Kue (Semarang)
- Fitri Handayani - Laundry (Malang)
- Ratna Dewi - Toko Bunga (Solo)
- Sri Wahyuni - Warung Kopi (Medan)

**Delete All Mock**:
- Button: `<Trash /> Delete All Mock`
- Endpoint: `DELETE /api/superadmin/delete-all-mock`
- Confirmation: Type "delete" to confirm

### 4. User Count

Display: `User Management (9)`

## API Endpoints

### POST `/api/superadmin/populate-mock`
```json
Response: { "success": true, "count": 8 }
```

### DELETE `/api/superadmin/delete-all-mock`
```json
Response: { "success": true, "count": 8 }
```

## Security

⚠️ **Production Requirements**:
- [ ] Add authentication middleware
- [ ] Restrict to admin users
- [ ] Add rate limiting
- [ ] Log all actions
- [ ] Consider IP whitelist
- [ ] Add CSRF protection

## Testing Checklist

- [ ] Column sorting works
- [ ] Sort indicators update
- [ ] Populate creates 8 users
- [ ] Mock users have correct format
- [ ] Verify button works
- [ ] Delete shows confirmation
- [ ] Delete all mock removes only mock users
- [ ] User count updates
- [ ] Action buttons show loading states
