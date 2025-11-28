# User Profile UI Specification

## Overview
Detailed view of individual user showing personal information, credit score, business metrics, and financial literacy progress.

## Route
- Path: `/user-profile/:phone`
- Access: Field agents via dashboard

## Features

### 1. Personal Information Card
- Name, phone, business type, location
- Majelis assignment
- Verification status

### 2. Credit Score Card
- Overall credit score (0-100)
- Risk level indicator
- Data points count
- Recalculate button (if business intelligence data exists)

### 3. Business Metrics Card
- Business health score
- Asset score, cashflow score, management score
- Growth potential
- Total assets, inventory value, monthly cashflow
- Recommended loan amount

### 4. Financial Literacy Progress Section
**NEW FEATURE**

#### Data Source
- Fetches all weeks from `/api/knowledge/financial-literacy` collection
- Displays all 15 weeks regardless of user completion status

#### Display Logic
- Shows grid of week cards (150px min width, compact spacing)
- Each card shows:
  - Week number (Week 1, Week 2, etc.)
  - Score percentage (0% if no user data)
  - Completion date (N/A if no user data)
  - Color coding: Green (≥70%), Gray (<70%)

#### User Data Structure
```javascript
user.literacy = {
  "week_01": {
    score: 85,
    last_updated: "2025-11-23T14:30:00.000Z"
  },
  "week_02": {
    score: 0,
    last_updated: "2025-11-23T14:30:00.000Z"
  }
  // ... etc
}
```

#### Default Behavior
- If user has no `literacy` object or empty object: Shows all weeks with 0% and N/A
- Literacy object is NOT auto-populated on user creation
- Progress is only recorded when user completes quizzes via chatbot

### 5. Business Intelligence Analysis
- List of analyzed business images
- Category, insights, analysis date
- Chronological display

## API Endpoints
- `GET /api/users` - Get all users
- `GET /api/users/:phone/images` - Get user's uploaded images
- `GET /api/users/:phone/business-intelligence` - Get BI analysis data
- `GET /api/knowledge/financial-literacy` - Get all literacy weeks
- `POST /api/users/:phone/recalculate-credit` - Recalculate credit score

## Styling
- Compact literacy cards: 8px padding, 8px gap
- Responsive grid layout
- Color-coded progress indicators
- Mobile-friendly design

## Navigation
- Back button to return to user list
- Accessible from user list via profile icon
