# Credit Scoring Model - Amartha

Source: [Google Doc](https://docs.google.com/document/d/1hsUJscUKymolTBISxbwJjC5SE0tTmAQoxVgI1nSNDVE)

## Auto Reject Rules
1. **SLIK OJK**: COL 3, 4, or 5 in last 12 months → REJECT
2. **Golden Rule**: Installment > 30% of Net Profit → REJECT

---

## Scoring Formula (Max 40 Points)

### A. Financial Capacity & History (60% weight, max 20 pts)

| Factor | Max | Criteria |
|--------|-----|----------|
| **A1. SLIK OJK Status** | 8 pts | COL 1 always=8, COL 2 >12mo=6.4, COL 2 6-12mo=4, COL 2 <6mo=2, COL 3-5=0 |
| **A2. Repayment Capacity (RPC)** | 7 pts | Installment/NetProfit: 0-15%=7, 15-20%=5, 20-25%=3, 25-30%=1, >30%=0 |
| **A3. Cashflow Volatility** | 3 pts | CV (StdDev/Mean): 0-0.3=3, 0.31-0.5=2, 0.51-0.7=1, >0.7=0 |
| **A4. Debt Burden Ratio (DBR)** | 2 pts | AllDebt/NetProfit: ≤35%=2, 35-40%=1.5, 40-45%=1, 45-50%=0.5, >50%=0 |

### B. Business Validation (20% weight, max 10 pts)

| Factor | Max | Criteria |
|--------|-----|----------|
| **B1. Capacity Match** | 5 pts | AssetValuation/ClaimedRevenue: 0.8-1.2=5, 0.6-0.79/1.21-1.4=3, 0.4-0.59/1.41-1.6=1, else=0 |
| **B2. Inventory Level** | 5 pts | Stock density (AI Vision): ≥75%=5, 50-74%=3, 25-49%=1, <25%=0 |

### C. Financial Literacy & Quality (20% weight, max 10 pts)

| Factor | Max | Criteria |
|--------|-----|----------|
| **C1. Financial Literacy** | 5 pts | Module (2.5): 100%=2.5, 80-99%=1.5, <80%=0. Quiz (2.5): ≥90=2.5, 75-89=1.5, <75=0 |
| **C2. Majelis Cohesion** | 5 pts | Attendance ≥95% & no arrears=5, 85-94% or 1 late=3, 75-84% or 2 late=1, else=0 |

---

## Score Interpretation

| Score Range | Risk Level | Recommendation |
|-------------|------------|----------------|
| 32-40 | Low | Standard approval |
| 24-31 | Medium | Enhanced monitoring |
| 16-23 | High | Additional verification |
| 0-15 | Very High | Likely reject |

---

## Data Requirements

```javascript
{
  // A1 - SLIK (external/mock)
  slik_status: 'COL1' | 'COL2' | 'COL3' | 'COL4' | 'COL5',
  slik_last_col2_months: number, // months since last COL2
  
  // A2 - RPC
  monthly_installment: number,
  net_profit: number,
  
  // A3 - Cashflow Volatility
  monthly_income_history: number[], // array of monthly incomes
  
  // A4 - DBR
  total_monthly_debt: number,
  
  // B1 - Capacity Match
  asset_valuation: number, // from BI building analysis
  claimed_monthly_revenue: number,
  
  // B2 - Inventory
  inventory_stock_level: number, // 0-100% from AI vision
  
  // C1 - Literacy
  literacy_modules_completed: number, // out of 15
  literacy_quiz_avg_score: number, // 0-100
  
  // C2 - Majelis
  majelis_attendance_rate: number, // 0-100%
  majelis_members_late_payment: number // count
}
```
