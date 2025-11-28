# User Management UI Specification

## Overview
Admin dashboard for managing UMKM members, including verification, majelis assignment, and superadmin controls.

## Design Principles

### Information Density
**High-density, enterprise-grade interface** - maximize information per screen while maintaining readability.

**Guidelines**:
- Compact spacing (8px-12px between elements)
- Dense typography (14px body, 16px headings)
- Minimal whitespace, purposeful padding
- Table-based layout for user list
- Icon-only action buttons
- Consistent alignment and spacing

### Icon System
**Lucide Icons**: Professional SVG icon library for UI elements.

**Usage**:
- Action buttons (verify, reject, delete)
- Navigation elements
- Status indicators
- Consistent 16px size for buttons

**Library**: `lucide-preact` - Lightweight, tree-shakeable icon components.

## Features

### 1. Sortable User Table
**Requirement**: Click column headers to sort users by any field.

**Sortable Columns**:
- Name (alphabetical)
- Phone (numerical)
- Business Type (alphabetical)
- Location (alphabetical)
- Majelis (alphabetical, nulls last)
- Status (verified first)

**Visual Indicators**:
- `⇅` - Unsorted (default)
- `↑` - Ascending order
- `↓` - Descending order

**Implementation**:
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
**Requirement**: Compact icon-based action buttons for each user.

**Actions**:
- `<Check />` - Verify user (sets `is_verified: true`)
- `<X />` - Reject user (sets `is_verified: false`)
- `<Trash2 />` - Delete user (with confirmation)

**Navigation**:
- Click on user name to view profile (navigates to `/user-profile/:phone`)
- User name is styled as a clickable link

**Button States**:
- Disabled during processing (shows loading state)
- Verify/Reject disabled when already verified
- All buttons disabled when processing that user

**Icons**: Lucide icons at 16px size for consistency.

### 3. Superadmin Controls
**Requirement**: Quick data population and cleanup for testing.

#### Populate Mock Data
- **Button**: `<Dice5 /> Populate Mock Data`
- **Action**: Creates 8 mock users with `is_mock: true` flag
- **Endpoint**: `POST /api/superadmin/populate-mock`
- **Users Created**:
  - Siti Nurhaliza - Warung Kelontong (Jakarta Selatan)
  - Dewi Lestari - Toko Pakaian (Bandung)
  - Rina Susanti - Warung Makan (Surabaya)
  - Maya Sari - Salon Kecantikan (Yogyakarta)
  - Ani Wijaya - Toko Kue (Semarang)
  - Fitri Handayani - Laundry (Malang)
  - Ratna Dewi - Toko Bunga (Solo)
  - Sri Wahyuni - Warung Kopi (Medan)

**Mock User Structure**:
```javascript
{
  name: 'Siti Nurhaliza',
  phone: '6281234567801', // No + prefix
  business_type: 'Warung Kelontong',
  location: 'Jakarta Selatan',
  status: 'pending',
  is_mock: true,
  registered_at: '2025-11-23T10:00:00.000Z',
  majelis_id: null,
  majelis_name: null
}
```

#### Delete All Mock
- **Button**: `<Trash /> Delete All Mock`
- **Action**: Deletes all users where `is_mock: true`
- **Endpoint**: `DELETE /api/superadmin/delete-all-mock`
- **Confirmation**: Modal requiring user to type "delete"

**Confirmation Modal**:
```
⚠️ Delete All Mock Users
This will permanently delete all mock users from the database.
Type "delete" to confirm:
[input field]
[Cancel] [Delete]
```

### 4. User Count Display
**Requirement**: Show total user count in page header.

**Format**: `User Management (9)`

**Implementation**:
```javascript
<h2>User Management ({users.length})</h2>
```

## API Endpoints

### POST `/api/superadmin/populate-mock`
Creates mock users for testing.

**Response**:
```json
{
  "success": true,
  "count": 8
}
```

**Database Function**:
```javascript
async function createMockUsers() {
  const mockUsers = [...];
  let count = 0;
  for (const user of mockUsers) {
    const userRef = db.collection('users').doc(user.phone);
    const doc = await userRef.get();
    if (!doc.exists) {
      await userRef.set({
        ...user,
        status: 'pending',
        is_mock: true,
        registered_at: new Date().toISOString(),
        majelis_id: null,
        majelis_name: null
      });
      count++;
    }
  }
  return count;
}
```

### DELETE `/api/superadmin/delete-all-mock`
Deletes all mock users using Firestore batch operations.

**Response**:
```json
{
  "success": true,
  "count": 8
}
```

**Database Function**:
```javascript
async function deleteAllMockUsers() {
  const snapshot = await db.collection('users').where('is_mock', '==', true).get();
  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  return snapshot.size;
}
```

## User Interface

### Table Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ User Management (9)                    [🎲 Populate] [🗑️ Delete]   │
├──────────┬────────────┬──────────┬──────────┬─────────┬────────────┤
│ Name ⇅   │ Phone ⇅    │ Business │ Location │ Majelis │ Status ⇅   │
├──────────┼────────────┼──────────┼──────────┼─────────┼────────────┤
│ Siti     │ 6281234... │ Warung   │ Jakarta  │ —       │ Pending    │
│ (link)   │            │          │          │         │ [✓ ✗ 🗑️]   │
├──────────┼────────────┼──────────┼──────────┼─────────┼────────────┤
│ Dewi     │ 6281234... │ Toko     │ Bandung  │ Majelis │ Verified   │
│ (link)   │            │          │          │ A       │ [✓ ✗ 🗑️]   │
└──────────┴────────────┴──────────┴──────────┴─────────┴────────────┘
```

**Note**: User name is clickable and navigates to user profile page.

### Modal Overlay
```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
}
```

## Security Considerations

⚠️ **Important**: Superadmin endpoints currently have no authentication.

**Production Requirements**:
- [ ] Add authentication middleware
- [ ] Restrict to admin users only
- [ ] Add rate limiting
- [ ] Log all superadmin actions
- [ ] Consider IP whitelist
- [ ] Add CSRF protection

**Recommended Implementation**:
```javascript
// Middleware example
const requireAdmin = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token || !verifyAdminToken(token)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

app.post('/api/superadmin/populate-mock', requireAdmin, async (req, res) => {
  // ... implementation
});
```

## Testing

### Manual API Testing
```bash
# Populate mock data
curl -X POST http://localhost:8080/api/superadmin/populate-mock

# Delete mock data
curl -X DELETE http://localhost:8080/api/superadmin/delete-all-mock

# View users
curl http://localhost:8080/api/users
```

### UI Testing Checklist
- [ ] Click column headers to sort
- [ ] Sort indicators update correctly
- [ ] Populate mock data creates 8 users
- [ ] Mock users have correct phone format (no + prefix)
- [ ] Mock users have `status: 'pending'`
- [ ] Verify button is clickable for pending users
- [ ] Verify button is disabled for verified users
- [ ] Delete confirmation modal appears
- [ ] Typing "delete" enables delete button
- [ ] Delete all mock removes only mock users
- [ ] User count updates after operations
- [ ] Action buttons show loading states

## Future Enhancements

- [ ] Add authentication to superadmin endpoints
- [ ] Add bulk user import from CSV
- [ ] Add user export functionality
- [ ] Add advanced filtering (by status, majelis, business type)
- [ ] Add pagination for large user lists
- [ ] Add search functionality
- [ ] Add user activity logs
- [ ] Add bulk verification
