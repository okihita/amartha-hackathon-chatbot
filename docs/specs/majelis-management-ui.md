# Majelis Management UI

## Design Principles

**High-density interface**: Card-based layout, compact member lists, minimal whitespace

**User Feedback**:
- Toast notifications (success/error, auto-dismiss 3s)
- Confirm dialogs for destructive actions
- NO browser native alert/confirm

**Icons**: Lucide for UI, emoji for business types only

## Features

### 1. Majelis Cards

Display:
- Name, schedule (with Calendar icon), location (with MapPin icon)
- Description, member count (with Users icon)
- Member list with business types
- Action buttons: Add Member, Edit, Delete

### 2. Member Autocomplete

Click "+ Add Member" → Modal with search input

**Search**:
- Filter verified users only
- Search by name or phone
- Show max 5 results
- Click to add instantly

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

### 3. Member Management

**Add**: `POST /api/majelis/:id/members`
- Validates user exists, verified, not in another majelis
- Updates majelis members array
- Updates user's majelis_id, majelis_name, majelis_day

**Remove**: `DELETE /api/majelis/:id/members/:phone`
- Shows confirmation dialog
- Removes from members array
- Clears user's majelis fields

### 4. Create/Edit Majelis

Form fields:
- Name * (required)
- Description
- Schedule Day * (Senin, Selasa, Rabu, Kamis, Jumat, Sabtu)
- Schedule Time (default: 10:00)
- Location

## API Endpoints

### POST `/api/majelis/:id/members`
```json
Request: { "phone": "6281234567801" }
Success: { "success": true, "majelis": {...} }
Error: { "error": "User already belongs to another Majelis" }
```

### DELETE `/api/majelis/:id/members/:phone`
```json
Success: { "success": true, "majelis": {...} }
```

## Testing Checklist

- [ ] Autocomplete filters by name/phone
- [ ] Only verified users shown
- [ ] Max 5 results
- [ ] Empty state shown
- [ ] Click adds member
- [ ] Error if already in majelis
- [ ] Remove shows confirmation
- [ ] Member count updates
- [ ] Modal closes on success
