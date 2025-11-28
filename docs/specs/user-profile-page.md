# User Profile Page Specification

## Overview
Comprehensive user profile page displaying all user data including personal info, business details, loan status, literacy progress, majelis membership, and business intelligence records.

## Route
`/user-profile/:phone`

## Data Sources
- User main document
- Profile subcollection
- Business subcollection
- Loan subcollection
- Literacy subcollection
- Business Intelligence subcollection
- Majelis document (if user is member)

## API Endpoint
```
GET /api/users/:phone/complete
```

**Response:**
```json
{
  "user": {
    "phone": "6281234567890",
    "name": "Ibu Siti",
    "status": "active",
    "majelis_id": "maj_123",
    "created_at": "2025-11-20T10:00:00.000Z",
    "updated_at": "2025-11-23T15:30:00.000Z",
    "is_mock": false
  },
  "profile": {
    "dob": "1985-05-15",
    "gender": "female",
    "address": "Jl. Merdeka No. 123, Jakarta Selatan"
  },
  "business": {
    "name": "Warung Sembako Siti",
    "location": "Bogor",
    "category": "Warung Kelontong",
    "maturity_level": 3
  },
  "loan": {
    "limit": 5000000,
    "used": 3000000,
    "remaining": 2000000,
    "next_payment_date": "2025-12-01T00:00:00.000Z",
    "next_payment_amount": 500000,
    "history": [
      {
        "id": "txn_001",
        "type": "disbursement",
        "amount": 3000000,
        "date": "2025-11-01T10:00:00.000Z",
        "description": "Pencairan modal kerja",
        "balance_after": 3000000
      },
      {
        "id": "txn_002",
        "type": "payment",
        "amount": 500000,
        "date": "2025-11-15T10:00:00.000Z",
        "description": "Cicilan minggu ke-2",
        "balance_after": 2500000
      }
    ]
  },
  "literacy": {
    "week_01": { "score": 85, "last_updated": "2025-11-10T10:00:00.000Z" },
    "week_02": { "score": 90, "last_updated": "2025-11-17T10:00:00.000Z" },
    "week_03": { "score": 0, "last_updated": null }
  },
  "majelis": {
    "id": "maj_123",
    "name": "Majelis Sejahtera",
    "schedule_day": "Senin",
    "schedule_time": "10:00",
    "location": "Balai Desa Kebayoran",
    "member_count": 15
  },
  "business_intelligence": [
    {
      "id": "bi_001",
      "type": "ledger",
      "analysis_category": "financial_record",
      "data": {
        "record_type": "buku_kas",
        "daily_income_estimate": 150000,
        "monthly_cashflow_estimate": 4500000
      },
      "source": {
        "type": "text",
        "text": "Jual nasi goreng 150rb...",
        "caption": "Catatan minggu ini"
      },
      "analyzed_at": "2025-11-20T10:00:00.000Z"
    }
  ]
}
```

## UI Layout

### Header Section
- User name (large)
- Phone number
- Status badge (pending/active/suspended/inactive)
- Created date

### Personal Info Card
- Date of Birth
- Gender
- Address
- Edit button (future)

### Business Info Card
- Business name
- Location
- Category
- Maturity level (1-5 with visual indicator)
- Edit button (future)

### Loan Status Card
- Total limit (large number)
- Used amount
- Remaining limit
- Next payment date
- Next payment amount
- Current debt (from latest balance_after)
- Transaction history table:
  - Date
  - Type (disbursement/payment)
  - Amount
  - Description
  - Balance After

### Literacy Progress Card
- Progress bar (completed weeks / 15 total)
- Week grid (15 boxes):
  - Green: score >= 70
  - Yellow: score < 70
  - Gray: score = 0 (not started)
- Click week to see score details

### Majelis Membership Card
- Majelis name
- Schedule (day + time)
- Location
- Member count
- Link to majelis detail page

### Business Intelligence Section
- Tabs: All / Ledger / Inventory / Building / Transaction
- Card list showing:
  - Type icon
  - Analysis category
  - Key data points
  - Source (image thumbnail or text preview)
  - Analyzed date
- Click to expand full details

## Features

### Data Display
- All data fetched on page load
- Loading states for each section
- Empty states with helpful messages
- Error handling with retry button

### Visual Indicators
- Status badges with colors
- Maturity level stars (1-5)
- Literacy progress percentage
- Loan health indicator (green/yellow/red based on remaining)

### Navigation
- Back to user list
- Link to majelis page
- Link to business intelligence detail (future)

### Responsive Design
- Mobile-first
- Cards stack vertically on mobile
- Grid layout on desktop

## Implementation Notes

### Backend
- Create new endpoint: `GET /api/users/:phone/complete`
- Aggregate all subcollections in single query
- Include majelis data if user has majelis_id
- Return 404 if user not found

### Frontend
- Use Preact components
- Fetch data on mount
- Display loading skeleton
- Handle missing data gracefully (show "Not set" or "-")

### Performance
- Cache response for 30 seconds
- Lazy load BI images
- Paginate transaction history if > 20 items

## Future Enhancements
- Edit profile inline
- Add new loan transaction
- Update literacy score
- Upload BI data
- Export data as PDF
