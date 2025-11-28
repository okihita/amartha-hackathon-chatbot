# Majelis Management UI Specification

## Overview
Admin interface for creating and managing majelis groups, including member assignment with autocomplete search.

## Design Principles

### Information Density
**High-density, enterprise-grade interface** - maximize information per screen while maintaining readability.

**Guidelines**:
- Card-based layout for majelis groups
- Compact member lists with inline actions
- Minimal whitespace, purposeful padding
- Grid layout for efficient space usage

### User Feedback
**Toast Notifications**: Non-intrusive feedback for successful operations.

**Usage**:
- Success messages (green): Mock majelis created/deleted, members added/removed
- Error messages (red): Operation failures
- Auto-dismiss after 3 seconds
- Positioned top-right corner
- Slide-in animation

**Confirm Dialogs**: Professional modal dialogs for destructive actions.

**Design**:
- Centered modal with overlay
- Warning icon (AlertTriangle) in yellow circle
- Clear title and descriptive message
- Two-button layout: Cancel (secondary) + Confirm (danger/primary)
- Click outside to cancel

**Usage**:
- Delete majelis
- Remove member
- Populate mock majelis
- Delete all mock majelis

**Avoid**:
- ❌ Browser native `alert()` - ugly and unprofessional
- ❌ Browser native `confirm()` - inconsistent styling
- ✅ Use custom ConfirmDialog component for all confirmations
- ✅ Use Toast for success/error feedback

### Icon System
**Lucide Icons**: Professional SVG icon library for UI elements.

**Usage**:
- Action buttons (add, edit, delete members)
- Schedule and location indicators
- Member count display
- Consistent 14-16px size

**Emoji Icons**: Reserved for business type categorization only (e.g., 🏪 Warung, 🍽️ Restaurant).

**Library**: `lucide-preact` - Lightweight, tree-shakeable icon components.

## Features

### 1. Majelis Card Display
**Requirement**: Show majelis groups with schedule, location, and member information.

**Card Structure**:
```
┌─────────────────────────────────────┐
│ Majelis Sejahtera                   │
│ [Calendar] Senin 10:00              │
│ [MapPin] Balai Desa                 │
│ Pertemuan mingguan untuk UMKM       │
│ [Users] 5 members                   │
│                                     │
│ • Siti Nurhaliza • Warung Kelontong│
│ • Dewi Lestari • Toko Pakaian      │
│ • Rina Susanti • Warung Makan      │
│                                     │
│ [[UserPlus] Add] [[Edit2] Edit]    │
│ [[Trash2] Delete]                   │
└─────────────────────────────────────┘
```

**Icons Used**:
- `<Calendar />` - Schedule indicator
- `<MapPin />` - Location indicator
- `<Users />` - Member count
- `<UserPlus />` - Add member button
- `<Edit2 />` - Edit majelis button
- `<Trash2 />` - Delete majelis button
- `<X />` - Remove member button

**Fields Displayed**:
- Name (heading)
- Schedule (day + time with icons)
- Location (with icon)
- Description (optional)
- Member count
- Member list with business types

### 2. Member Autocomplete
**Requirement**: Easy mechanism to add users to majelis with autocomplete search by name or phone.

**Implementation**:
- Click "+ Add Member" button on majelis card
- Modal opens with search input
- Type to filter verified users
- Shows up to 5 matching results
- Click user to add instantly

**Autocomplete Logic**:
```javascript
useEffect(() => {
  if (!searchQuery.trim()) {
    setFilteredUsers([]);
    return;
  }
  const query = searchQuery.toLowerCase();
  const verified = users.filter(u => u.is_verified === true);
  const matches = verified.filter(u => 
    u.name?.toLowerCase().includes(query) || 
    u.phone?.includes(query)
  ).slice(0, 5);
  setFilteredUsers(matches);
}, [searchQuery, users]);
```

**Search Criteria**:
- ✅ Only verified users (`is_verified === true`)
- ✅ Search by name (case-insensitive)
- ✅ Search by phone number
- ✅ Limit to 5 results
- ❌ Exclude users already in other majelis (handled by API)

**Autocomplete Dropdown**:
```
┌─────────────────────────────────────┐
│ Add Member                          │
│                                     │
│ Search by name or phone             │
│ [Type to search...            ]     │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Siti Nurhaliza                  │ │
│ │ 6281234567801 • Warung Kelontong│ │
│ ├─────────────────────────────────┤ │
│ │ Dewi Lestari                    │ │
│ │ 6281234567802 • Toko Pakaian    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Cancel]                            │
└─────────────────────────────────────┘
```

### 3. Member Management
**Requirement**: Add and remove members with validation.

#### Add Member
- **Endpoint**: `POST /api/majelis/:id/members`
- **Body**: `{ phone: "6281234567801" }`
- **Validation**:
  - User must exist
  - User must be verified
  - User cannot be in another majelis
- **Updates**:
  - Adds phone to majelis `members` array
  - Updates user's `majelis_id`, `majelis_name`, `majelis_day`

**Error Handling**:
```javascript
const handleAddMember = async (majelisId, phone) => {
  try {
    const res = await fetch(`/api/majelis/${majelisId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || 'Failed to add member');
      return;
    }
    setAddMemberModal(null);
    setSearchQuery('');
    fetchData();
  } catch (error) {
    alert('Failed to add member');
  }
};
```

#### Remove Member
- **Button**: `×` next to each member name
- **Endpoint**: `DELETE /api/majelis/:id/members/:phone`
- **Confirmation**: "Remove this member?"
- **Updates**:
  - Removes phone from majelis `members` array
  - Clears user's `majelis_id`, `majelis_name`, `majelis_day`

**UI Implementation**:
```javascript
<div class="member-item-inline">
  <span class="member-name">{user?.name || phone}</span>
  {user && <span class="member-details"> • {user.business_type}</span>}
  <button 
    class="btn-remove-member" 
    onClick={() => handleRemoveMember(m.id, phone)}
    title="Remove member"
  >×</button>
</div>
```

### 4. Create/Edit Majelis
**Requirement**: Modal form for creating and editing majelis groups.

**Form Fields**:
- Name * (required)
- Description (optional)
- Schedule Day * (required, dropdown)
- Schedule Time (default: 10:00)
- Location (optional)

**Day Options**:
- Senin
- Selasa
- Rabu
- Kamis
- Jumat
- Sabtu

**Modal Form**:
```
┌─────────────────────────────────────┐
│ Create Majelis                      │
│                                     │
│ Name *                              │
│ [                              ]    │
│                                     │
│ Description                         │
│ [                              ]    │
│                                     │
│ Schedule Day *                      │
│ [Select day ▼                  ]    │
│                                     │
│ Schedule Time                       │
│ [10:00                         ]    │
│                                     │
│ Location                            │
│ [                              ]    │
│                                     │
│ [Cancel] [Save]                     │
└─────────────────────────────────────┘
```

## API Endpoints

### POST `/api/majelis/:id/members`
Add member to majelis.

**Request**:
```json
{
  "phone": "6281234567801"
}
```

**Success Response**:
```json
{
  "success": true,
  "majelis": {
    "id": "majelis123",
    "name": "Majelis Sejahtera",
    "members": ["6281234567801", "6281234567802"]
  }
}
```

**Error Response**:
```json
{
  "error": "User already belongs to another Majelis",
  "currentMajelisId": "majelis456"
}
```

### DELETE `/api/majelis/:id/members/:phone`
Remove member from majelis.

**Success Response**:
```json
{
  "success": true,
  "majelis": {
    "id": "majelis123",
    "name": "Majelis Sejahtera",
    "members": ["6281234567802"]
  }
}
```

## Database Operations

### Add Member Logic
```javascript
async function addMemberToMajelis(majelisId, phoneNumber) {
  const majelisRef = db.collection('majelis').doc(majelisId);
  const doc = await majelisRef.get();
  
  if (!doc.exists) return null;
  
  // Check if user is already in another Majelis
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const userRef = db.collection('users').doc(cleanPhone);
  const userDoc = await userRef.get();
  
  if (userDoc.exists && userDoc.data().majelis_id) {
    const currentMajelisId = userDoc.data().majelis_id;
    if (currentMajelisId !== majelisId) {
      return { error: 'User already belongs to another Majelis', currentMajelisId };
    }
  }
  
  const members = doc.data().members || [];
  if (!members.includes(phoneNumber)) {
    members.push(phoneNumber);
    await majelisRef.update({ 
      members,
      updated_at: new Date().toISOString()
    });
    
    // Update user's majelis info
    const majelisData = doc.data();
    await updateUserMajelis(phoneNumber, {
      majelis_id: majelisId,
      majelis_name: majelisData.name,
      majelis_day: majelisData.schedule_day
    });
  }
  
  const updatedDoc = await majelisRef.get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
}
```

## CSS Styles

### Autocomplete Components
```css
.autocomplete-results {
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 8px;
  max-height: 300px;
  overflow-y: auto;
  background: white;
}

.autocomplete-item {
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
}

.autocomplete-item:hover {
  background-color: #f8f9fa;
}

.autocomplete-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.autocomplete-details {
  font-size: 12px;
  color: #666;
}

.autocomplete-empty {
  padding: 12px;
  text-align: center;
  color: #999;
  font-size: 13px;
}
```

### Member List
```css
.member-item-inline {
  font-size: 13px;
  color: #555;
  padding: 8px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-remove-member {
  background: none;
  border: none;
  color: #999;
  font-size: 20px;
  cursor: pointer;
  padding: 0 8px;
  line-height: 1;
  transition: color 0.2s;
}

.btn-remove-member:hover {
  color: #e74c3c;
}
```

## User Interaction Flow

### Adding a Member
1. User clicks "+ Add Member" on majelis card
2. Modal opens with search input (autofocused)
3. User types name or phone number
4. Autocomplete shows matching verified users (max 5)
5. User clicks on a result
6. API validates and adds member
7. Modal closes, member list refreshes
8. Success feedback shown

### Removing a Member
1. User clicks `×` button next to member name
2. Confirmation dialog: "Remove this member?"
3. User confirms
4. API removes member and updates user record
5. Member list refreshes
6. Success feedback shown

## Testing Checklist

- [ ] Autocomplete filters by name (case-insensitive)
- [ ] Autocomplete filters by phone number
- [ ] Only verified users appear in autocomplete
- [ ] Maximum 5 results shown
- [ ] Empty state shown when no matches
- [ ] Click user in dropdown adds to majelis
- [ ] Error shown if user already in another majelis
- [ ] Remove button appears next to each member
- [ ] Remove button shows confirmation dialog
- [ ] Member removal updates user record
- [ ] Modal closes on successful add
- [ ] Search input clears after add
- [ ] Member count updates correctly
- [ ] Click outside modal closes it

## Future Enhancements

- [ ] Bulk member import from CSV
- [ ] Member transfer between majelis
- [ ] Attendance tracking
- [ ] Meeting notes and minutes
- [ ] Member activity history
- [ ] Export member list
- [ ] WhatsApp group integration
