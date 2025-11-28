# User Data Model

## Main Document Schema

```javascript
{
  // Identity
  phone: string,              // Primary key (document ID)
  name: string,
  
  // Status
  status: string,             // 'pending' | 'active' | 'suspended' | 'inactive'
  
  // Majelis
  majelis_id: string | null,
  
  // Metadata
  created_at: string,         // ISO 8601
  updated_at: string,         // ISO 8601
  is_mock: boolean
}
```

## Subcollections

### Profile Collection (`users/{phone}/profile/data`)

```javascript
{
  dob: string | null,         // Date of birth (ISO 8601)
  gender: string | null,      // 'male' | 'female'
  address: string | null,     // Full address
  created_at: string,
  updated_at: string
}
```

### Business Collection (`users/{phone}/business/data`)

```javascript
{
  name: string | null,        // Business name
  location: string | null,    // Business location
  category: string | null,    // Business category/type
  maturity_level: number,     // 1-5 (applies to all business categories)
  created_at: string,
  updated_at: string
}
```

**Maturity Levels (applies to all business categories):**
- 1: SUBSISTEN (The Survivalist) - Survival mode
- 2: PERINTIS (The Starter) - Starting phase
- 3: BERKEMBANG (The Growing) - Growth phase
- 4: MAPAN (The Professional) - Established & professional
- 5: INDUSTRI (The Market Leader) - Industry leader

### Loan Collection (`users/{phone}/loan/data`)

```javascript
{
  limit: number,              // Total loan limit
  used: number,               // Amount currently borrowed
  remaining: number,          // Available credit (limit - used)
  next_payment_date: string | null,  // ISO 8601
  next_payment_amount: number,
  history: [                  // Transaction history
    {
      id: string,
      type: 'disbursement' | 'payment',
      amount: number,
      date: string,           // ISO 8601
      description: string,
      balance_after: number   // Running balance after transaction
    }
  ],
  created_at: string,
  updated_at: string
}
```

**Computed field:**
- `remaining_debt`: Get from latest transaction's `balance_after`

**Transaction Types:**
- `disbursement`: Loan given to member (increases balance)
- `payment`: Member payment (decreases balance)

### Literacy Collection (`users/{phone}/literacy/data`)

```javascript
{
  week_01: {
    score: number,            // 0-100
    last_updated: string      // ISO 8601
  },
  week_02: { score, last_updated },
  // ... up to week_52
  created_at: string,
  updated_at: string
}
```

## Literacy Rules

- Week naming: `week_01`, `week_02`, ..., `week_52` (zero-padded)
- Passing score: 70% or higher
- Initial value: 0

## Factory Methods

### User.create(data)
Creates new user main document with defaults

### User.createProfile(data)
Creates profile subcollection document

### User.createBusiness(data)
Creates business subcollection document

### User.createLoan()
Creates loan subcollection document with defaults

### User.createLiteracy()
Creates literacy subcollection with week_01 initialized

### User.createMock(userData)
Creates mock user with `is_mock: true`

## Usage

```javascript
// Create user with all subcollections
const user = await UserRepository.create(phone, {
  name: "Ibu Siti",
  business_name: "Warung Kelontong",
  business_location: "Jakarta"
});

// Access subcollection data
console.log(user.business.name);      // "Warung Kelontong"
console.log(user.business.location);  // "Jakarta"

// Update literacy score
await UserService.updateLiteracyScore(phone, 1, 85);

// Calculate remaining debt
const loan = user.loan;
const remainingDebt = loan.history.length > 0 
  ? loan.history.sort((a, b) => new Date(b.date) - new Date(a.date))[0].balance_after
  : 0;
```

## API Endpoints

```
POST /api/users/:phone/literacy/:week
Body: { score: number }

GET /api/users/:phone
Response: { ...mainDoc, profile, business, loan, literacy }
```

## Status Values

- `pending`: Newly registered, awaiting verification
- `active`: Verified and can access all features
- `suspended`: Temporarily disabled
- `inactive`: Permanently disabled
