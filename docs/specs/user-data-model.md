# User Data Model

## Schema

```javascript
{
  // Identity
  phone: string,              // Primary key
  name: string,
  business_type: string,
  location: string,
  
  // Status
  is_verified: boolean,
  pending_verification: any,
  status: string,
  
  // Majelis
  majelis_id: string | null,
  
  // Literacy Tracking
  literacy: {
    week_01: {
      score: number,          // 0-100
      last_updated: string    // ISO 8601
    },
    week_02: { score, last_updated },
    // ... up to week_52
  },
  
  // Loan
  loan_limit: number,
  loan_used: number,
  loan_remaining: number,
  remaining_debt: number,
  next_payment_date: string | null,
  next_payment_amount: number,
  loan_history: [...],
  
  // Business Intelligence
  business_profile: object,
  credit_score: string,
  credit_score_value: number,
  credit_metrics: {...},
  
  // Metadata
  current_module: string,
  verified_transactions: [],
  created_at: string,
  profile_updated_at: string,
  credit_updated_at: string,
  loan_updated_at: string,
  is_mock: boolean
}
```

## Literacy Object

### Format
```javascript
{
  week_XX: {
    score: number,        // 0-100
    last_updated: string  // ISO 8601
  }
}
```

### Rules
- Week naming: `week_01`, `week_02`, ..., `week_52` (zero-padded)
- Passing score: 70% or higher
- Initial value: 0

### Progress Calculation
```javascript
{
  completed: number,    // Count of weeks >= 70
  average: number,      // Average score (rounded)
  total: number         // Total weeks attempted
}
```

## Factory Methods

### User.create(data)
Creates new user with defaults

### User.createMock(userData)
Creates mock user with `is_mock: true`

### User.createWeekScore(weekNumber)
```javascript
{
  week_XX: {
    score: 0,
    last_updated: "2025-11-23T12:00:00.000Z"
  }
}
```

### User.updateWeekScore(literacy, weekNumber, score)
Updates week score, clamps to 0-100, sets timestamp

### User.getLiteracyProgress(literacy)
Returns `{ completed, average, total }`

## Usage

```javascript
// Create user
const user = User.create({
  name: "Ibu Siti",
  business_type: "Warung Kelontong",
  location: "Jakarta"
});

// Update score
const updatedLiteracy = User.updateWeekScore(user.literacy, 1, 85);
await UserRepository.update(phone, { literacy: updatedLiteracy });

// Check progress
const progress = User.getLiteracyProgress(user.literacy);
console.log(`${progress.completed}/${progress.total} - ${progress.average}%`);
```

## API Endpoints

```
POST /api/users/:phone/literacy/:week
Body: { score: number }

GET /api/users/:phone/literacy/progress
Response: { completed, average, total, weeks: {...} }
```
