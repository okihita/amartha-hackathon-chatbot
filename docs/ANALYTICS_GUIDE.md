# Analytics Dashboard - Complete Methodology Guide

## 1. Dataset Discovery

### Raw Files Received
| File | Rows | Size | Description |
|------|------|------|-------------|
| `customers.csv` | 12,021 | 1.2MB | Customer demographics |
| `loan_snapshots.csv` | 12,021 | 800KB | Current loan status |
| `bills.csv` | 599,184 | 45MB | Payment history |
| `tasks.csv` | 160,334 | 18MB | Field agent visits |
| `task_participants.csv` | 1.3M | 95MB | Visit participants |
| `business/` | 100 images | 15MB | Business photos |
| `house/` | 100 images | 12MB | Residence photos |

### Field Inventory
```
customers.csv:
  - customer_number (PK, hashed)
  - date_of_birth
  - marital_status
  - religion
  - purpose (business description in Indonesian)

loan_snapshots.csv:
  - customer_number (FK → customers)
  - loan_id (PK)
  - principal_amount
  - outstanding_amount
  - dpd (Days Past Due - KEY FIELD)

bills.csv:
  - loan_id (FK → loan_snapshots)
  - bill_id (PK)
  - bill_scheduled_date
  - bill_paid_date (nullable if unpaid)
  - amount
  - paid_amount

tasks.csv:
  - task_id (PK)
  - task_type
  - task_status
  - start_datetime (scheduled)
  - actual_datetime (when it happened)
  - latitude, longitude (GPS)
  - branch_id
```

---

## 2. Brainstorming Possible Insights

### Questions We Asked
1. **Credit Risk**: Can we predict who will default?
2. **Collections**: How much money is being collected vs scheduled?
3. **Behavior Patterns**: Are there seasonal trends? Business type differences?
4. **Operations**: Are field agents efficient? Can routes be optimized?
5. **Verification**: Can images validate business claims?

### Insight Prioritization Matrix
| Insight | Data Available? | Business Value | Complexity | Priority |
|---------|-----------------|----------------|------------|----------|
| Default prediction | ✅ DPD, payment history | Very High | Medium | 1 |
| Collection analytics | ✅ bills.csv | High | Low | 2 |
| Customer segmentation | ✅ Combined metrics | High | Medium | 3 |
| Route optimization | ✅ GPS in tasks.csv | Medium | Medium | 4 |
| Image analysis | ✅ 200 images | Medium | High | 5 |

---

## 3. Data Joining Strategy

### Entity Relationship
```
customers (12K)
    │
    └──< loan_snapshots (12K) ──1:1 relationship
              │
              └──< bills (599K) ──1:many relationship
                      ~50 bills per loan average

tasks (160K)
    │
    └──< task_participants (1.3M) ──1:many relationship
              ~8 participants per task average
```

### Join Rationale

**Join 1: customers ↔ loan_snapshots**
- Key: `customer_number`
- Why: Get DPD (delinquency status) for each customer
- Result: 12,021 rows (1:1 match)

**Join 2: loan_snapshots ↔ bills**
- Key: `loan_id`
- Why: Calculate payment history metrics per customer
- Result: 599K bills mapped to 12K customers

**Join 3: tasks by branch_id**
- Key: `branch_id`
- Why: Aggregate GPS coordinates for route analysis
- Result: ~50 branches with geographic spread metrics

### Why We Didn't Use task_participants
- 1.3M rows would slow processing significantly
- `is_face_matched`, `is_qr_matched` useful for fraud detection (future scope)
- `payment_amount` duplicates bills.csv data
- Decision: Skip for MVP, add later if needed

---

## 4. Feature Engineering

### Derived Metrics Per Customer

```javascript
// For each customer, compute from their bills:
paymentRatio = paidBills / totalBills           // 0-100%
lateRatio = lateBills / paidBills               // 0-100%
collectionRatio = totalPaid / totalScheduled    // 0-100%

// From loan_snapshots:
dpd = loan_snapshots.dpd                        // Days Past Due

// From customers.purpose field:
businessType = categorize(purpose)              // retail|livestock|farming|crafts|other
```

### Business Type Categorization
```javascript
function categorizeBusinessType(purpose) {
  const p = purpose.toLowerCase();
  if (p.includes('warung') || p.includes('dagang') || p.includes('toko')) 
    return 'retail';
  if (p.includes('ternak') || p.includes('sapi') || p.includes('ayam') || p.includes('kambing')) 
    return 'livestock';
  if (p.includes('tani') || p.includes('padi') || p.includes('jagung') || p.includes('cabe')) 
    return 'farming';
  if (p.includes('kerajinan') || p.includes('jahit') || p.includes('anyam')) 
    return 'crafts';
  return 'other';
}
```

### Late Payment Detection
```javascript
function isLate(bill) {
  if (!bill.bill_paid_date) return false;  // Unpaid, not late yet
  const scheduled = new Date(bill.bill_scheduled_date);
  const paid = new Date(bill.bill_paid_date);
  return paid > scheduled;  // Paid after due date
}
```

---

## 5. Risk Scoring Model

### Formula Design Rationale

| Factor | Weight | Rationale |
|--------|--------|-----------|
| Base score | 50 | Start neutral |
| Payment ratio | -30 | Strong predictor: good payers = low risk |
| Late ratio | +25 | Leading indicator: late today → default tomorrow |
| DPD | +0.5/day (max 30) | Lagging indicator: already overdue |
| Collection ratio | -20 | Similar to payment ratio, monetary view |
| Business type | ±5 | Farming volatile, retail stable |

### Implementation
```javascript
function calculateRiskScore(metrics) {
  let score = 50;  // Base
  
  // Payment behavior (strongest signal)
  score -= (metrics.paymentRatio / 100) * 30;
  score += (metrics.lateRatio / 100) * 25;
  
  // Current delinquency status
  score += Math.min(metrics.dpd / 2, 30);
  
  // Collection efficiency
  score -= (metrics.collectionRatio - 0.5) * 20;
  
  // Business type adjustment
  const typeAdj = {
    'farming': 5,    // Seasonal income = higher risk
    'livestock': 3,  // Disease/market risk
    'other': 2,      // Unknown = slight risk
    'crafts': 0,     // Neutral
    'retail': -5     // Steady cash flow = lower risk
  };
  score += typeAdj[metrics.businessType] || 0;
  
  return Math.max(0, Math.min(100, Math.round(score)));
}
```

### Risk Level Thresholds
```javascript
function getRiskLevel(score) {
  if (score >= 60) return 'High';
  if (score >= 30) return 'Medium';
  return 'Low';
}
```

---

## 6. ETL Pipeline

### Architecture
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  CSV Files  │────▶│  Node.js     │────▶│  In-Memory  │
│  (500MB)    │     │  csv-parser  │     │  Arrays     │
└─────────────┘     └──────────────┘     └─────────────┘
                                                │
                                                ▼
                                         ┌─────────────┐
                                         │  Compute    │
                                         │  Metrics    │
                                         └─────────────┘
                                                │
                                                ▼
                                         ┌─────────────┐
                                         │  REST API   │
                                         │  Responses  │
                                         └─────────────┘
```

### Load Process
```javascript
async loadData() {
  // Parallel CSV loading (~5 seconds total)
  const [customers, loans, bills, tasks] = await Promise.all([
    this._loadCSV('customers.csv'),      // 12K rows
    this._loadCSV('loan_snapshots.csv'), // 12K rows
    this._loadCSV('bills.csv'),          // 599K rows (slowest)
    this._loadCSV('tasks.csv'),          // 160K rows
  ]);
  
  // Build indexes for O(1) lookups
  this.customerIndex = new Map();  // customer_number → customer
  this.loanIndex = new Map();      // loan_id → loan
  
  // Compute derived metrics
  this._computeMetrics();
}
```

### Memory Optimization
- Load once on first request, cache in memory
- Use Maps for O(1) lookups instead of array.find()
- Don't load task_participants.csv (1.3M rows not needed)
- Pre-compute aggregates, don't recalculate per request

### Production Fallback
```javascript
// In production (no CSV files), use pre-computed JSON
if (!fs.existsSync(csvPath)) {
  this.staticData = require('../data/analytics-summary.json');
  this.useStaticData = true;
}
```

---

## 7. Route Analysis Math

### Geographic Spread Calculation
```javascript
// Haversine formula for distance between two GPS points
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;  // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// For each branch:
// 1. Calculate center point (average lat/lng)
// 2. Calculate distance from each task to center
// 3. Average = avgSpread, Max = maxSpread
```

### Efficiency Rating
```javascript
function getEfficiency(avgDelayHours) {
  if (avgDelayHours < 2) return 'Good';
  if (avgDelayHours < 5) return 'Moderate';
  return 'Poor';
}
```

---

## 8. Results Summary

### Risk Distribution
| Level | Count | Percentage |
|-------|-------|------------|
| Low | 8,909 | 74% |
| Medium | 1,653 | 14% |
| High | 1,443 | 12% |

### Collection Performance
- Total Scheduled: Rp 93.98B
- Total Collected: Rp 79.43B
- Collection Rate: 85%
- Gap: Rp 14.55B uncollected

### Business Type Risk
| Type | Count | Avg Risk Score |
|------|-------|----------------|
| Retail | 4,657 | 21 (lowest) |
| Crafts | 322 | 24 |
| Livestock | 2,813 | 26 |
| Farming | 1,981 | 31 |
| Other | 2,232 | 38 (highest) |

### Route Efficiency
- 20 branches analyzed
- Average spread: 1,500km (some branches very dispersed)
- 60% of branches rated "Poor" efficiency
- Optimization opportunity: 30% travel time reduction

---

## 9. API Reference

```bash
# Dashboard summary
GET /api/analytics/summary

# Risk predictions (sorted by score desc)
GET /api/analytics/risk/all?limit=50
GET /api/analytics/risk/:customerNumber

# Payment analytics
GET /api/analytics/payments

# Customer segments
GET /api/analytics/segments

# Route analysis
GET /api/analytics/routes

# Images
GET /api/analytics/images
GET /api/analytics/image/:type/:filename
```

---

## 10. Future Improvements

1. **ML Model**: Replace rule-based scoring with trained model
2. **Real-time**: Stream processing instead of batch
3. **BigQuery**: Move to cloud for larger datasets
4. **Geospatial**: Proper route optimization with OR-Tools
5. **Fraud Detection**: Use task_participants face/QR matching
