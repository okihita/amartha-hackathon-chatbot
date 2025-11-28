# Majelis Data Model

## Main Document Schema

```javascript
{
  // Identity
  name: string,                 // Majelis name
  description: string,          // Description/purpose
  
  // Schedule
  schedule_day: string,         // 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu'
  schedule_time: string,        // HH:MM format (e.g., "10:00")
  location: string,             // Meeting location
  
  // Members
  members: [string],            // Array of phone numbers
  
  // Metadata
  created_at: string,           // ISO 8601
  updated_at: string,           // ISO 8601
  is_mock: boolean              // For testing data
}
```

## Subcollections

### Attendance Collection (`majelis/{majelisId}/attendance/{attendanceId}`)

```javascript
{
  date: string,                 // ISO 8601 - Meeting date
  attendees: [string],          // Array of phone numbers who attended
  notes: string,                // Meeting notes/summary
  created_at: string,
  updated_at: string
}
```

## Factory Methods

### Majelis.create(data)
Creates new majelis with empty members array

### Majelis.createMock(data)
Creates mock majelis with `is_mock: true`

### Majelis.createAttendance(data)
Creates attendance record with date, attendees, and notes

## Usage

```javascript
// Create majelis
const majelis = await MajelisRepository.create({
  name: "Majelis Sejahtera",
  description: "Kelompok UMKM Jakarta Selatan",
  schedule_day: "Senin",
  schedule_time: "10:00",
  location: "Balai Desa Kebayoran"
});

// Add member
await MajelisService.addMember(majelis.id, "6281234567801");

// Record attendance
await MajelisService.recordAttendance(majelis.id, {
  date: "2025-11-23T10:00:00.000Z",
  attendees: ["6281234567801", "6281234567802", "6281234567803"],
  notes: "Pembahasan literasi minggu ke-3. Semua hadir tepat waktu."
});

// Get all attendance records
const attendance = await MajelisService.getAllAttendance(majelis.id);

// Calculate attendance rate
const totalMeetings = attendance.length;
const memberPhone = "6281234567801";
const attended = attendance.filter(a => a.attendees.includes(memberPhone)).length;
const rate = (attended / totalMeetings * 100).toFixed(1);
console.log(`Attendance rate: ${rate}%`);
```

## API Endpoints

### Majelis Management
```
GET    /api/majelis
GET    /api/majelis/:id
POST   /api/majelis
PUT    /api/majelis/:id
DELETE /api/majelis/:id
```

### Member Management
```
POST   /api/majelis/:id/members
Body: { phone: string }

DELETE /api/majelis/:id/members/:phone
```

### Attendance Management
```
POST   /api/majelis/:id/attendance
Body: { date: string, attendees: [string], notes: string }

GET    /api/majelis/:id/attendance
Returns: Array of attendance records (ordered by date desc)

GET    /api/majelis/:id/attendance/:attendanceId
Returns: Single attendance record

PUT    /api/majelis/:id/attendance/:attendanceId
Body: { date?, attendees?, notes? }

DELETE /api/majelis/:id/attendance/:attendanceId
```

## Business Rules

### Member Management
- User must be verified (`status === 'active'`) to join majelis
- User can only belong to one majelis at a time
- When user joins majelis, their `majelis_id` is updated
- When user is removed, their `majelis_id` is set to `null`
- When majelis is deleted, all members' `majelis_id` is cleared

### Attendance Tracking
- Attendees array contains phone numbers of members who attended
- Date should match the scheduled meeting day
- Notes are optional but recommended for record-keeping
- Attendance records are ordered by date (newest first)

## Example Attendance Record

```json
{
  "id": "att_abc123",
  "date": "2025-11-23T10:00:00.000Z",
  "attendees": [
    "6281234567801",
    "6281234567802",
    "6281234567803"
  ],
  "notes": "Pembahasan literasi minggu ke-3. Semua hadir tepat waktu. Ibu Siti berbagi pengalaman mengelola cashflow.",
  "created_at": "2025-11-23T10:30:00.000Z",
  "updated_at": "2025-11-23T10:30:00.000Z"
}
```

## Attendance Analytics

Calculate member attendance rate:
```javascript
const getMemberAttendanceRate = (attendance, memberPhone) => {
  if (attendance.length === 0) return 0;
  const attended = attendance.filter(a => a.attendees.includes(memberPhone)).length;
  return (attended / attendance.length * 100).toFixed(1);
};
```

Get attendance summary:
```javascript
const getAttendanceSummary = (attendance, members) => {
  return members.map(phone => ({
    phone,
    attended: attendance.filter(a => a.attendees.includes(phone)).length,
    total: attendance.length,
    rate: getMemberAttendanceRate(attendance, phone)
  }));
};
```
