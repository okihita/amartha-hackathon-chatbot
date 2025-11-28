# Business Intelligence Data Model

## Overview

Business Intelligence (BI) data captures unstructured business information from images and text, including handwritten ledgers, inventory photos, building conditions, and transaction records.

**Storage:** BI data is stored as a **subcollection under each user document** for data co-location and automatic cleanup.

## Collection Structure

**Path:** `users/{phone}/business_intelligence/{biId}` (subcollection)

```javascript
{
  user_phone: string,           // Owner phone number
  type: string,                 // 'ledger' | 'inventory' | 'building' | 'transaction' | 'general'
  
  // Extracted structured data
  data: {
    // Flexible object based on type
    // See type-specific schemas below
  },
  
  // Original source
  source: {
    type: 'image' | 'text',
    image_url: string | null,   // Cloud Storage URL if image
    text: string | null,        // Extracted text if applicable
    caption: string | null      // User's caption/description
  },
  
  // AI analysis metadata
  category: string,             // AI-detected category
  credit_metrics: object,       // Credit scoring metrics
  insights: [string],           // AI insights in Indonesian
  recommendations: [string],    // AI recommendations
  confidence: number,           // 0-1 confidence score
  
  // Timestamps
  analyzed_at: string,          // When AI analyzed
  created_at: string            // When created
}
```

## Type-Specific Data Schemas

### Type: `ledger` (Handwritten Ledger / Buku Kas)

```javascript
data: {
  record_type: 'buku_kas' | 'nota_pembelian' | 'nota_penjualan' | 'struk',
  date: string,
  transactions: [
    {
      date: string,
      description: string,
      amount: number,
      type: 'income' | 'expense'
    }
  ],
  daily_income_estimate: number,
  daily_expense_estimate: number,
  daily_profit_estimate: number,
  monthly_cashflow_estimate: number,
  record_quality: 'rapi' | 'cukup_rapi' | 'kurang_rapi',
  literacy_indicator: number  // 1-10
}
```

### Type: `inventory` (Stock/Inventory Photo)

```javascript
data: {
  items: [
    {
      name: string,
      quantity_estimate: number,
      unit: string,
      condition: string,
      estimated_price: number
    }
  ],
  total_items_count: number,
  inventory_value_estimate: number,
  stock_level: 'penuh' | 'cukup' | 'menipis' | 'kosong',
  variety_score: number,      // 1-10
  turnover_indicator: 'cepat' | 'sedang' | 'lambat'
}
```

### Type: `building` (Building/Store Condition)

```javascript
data: {
  building_type: 'warung' | 'toko' | 'kios' | 'rumah_produksi' | 'lainnya',
  condition: 'sangat_baik' | 'baik' | 'cukup' | 'perlu_perbaikan',
  size_estimate: string,
  location_type: 'pinggir_jalan' | 'dalam_gang' | 'pasar' | 'perumahan',
  visibility: 'sangat_terlihat' | 'cukup_terlihat' | 'kurang_terlihat',
  estimated_value: number,
  strategic_score: number     // 1-10
}
```

### Type: `transaction` (Transaction Records)

```javascript
data: {
  transactions: [
    {
      date: string,
      items: [string],
      total: number,
      type: 'sale' | 'purchase'
    }
  ],
  total_amount: number,
  transaction_count: number
}
```

## Credit Metrics

All BI records include credit scoring metrics:

```javascript
credit_metrics: {
  business_health_score: number,    // 1-100
  asset_score: number,              // 1-100
  cashflow_score: number,           // 1-100
  management_score: number,         // 1-100
  growth_potential: number,         // 1-100
  risk_level: 'rendah' | 'sedang' | 'tinggi',
  recommended_loan_amount: number
}
```

## Usage Examples

### Save Ledger Data (Text)

```javascript
const biData = {
  type: 'ledger',
  category: 'financial_record',
  extracted: {
    record_type: 'buku_kas',
    transactions: [
      { date: '2025-11-20', description: 'Jual nasi goreng', amount: 150000, type: 'income' },
      { date: '2025-11-21', description: 'Beli beras', amount: -80000, type: 'expense' }
    ],
    daily_income_estimate: 150000,
    daily_expense_estimate: 80000,
    monthly_cashflow_estimate: 2100000
  },
  credit_metrics: { /* ... */ },
  insights: ['Cashflow positif', 'Pembukuan teratur'],
  recommendations: ['Tingkatkan pencatatan harian'],
  confidence: 0.85
};

await UserService.saveBusinessIntelligence(
  phone, 
  biData, 
  null,  // No image URL
  'Catatan minggu ini'
);
```

### Save Building Photo (Image)

```javascript
const biData = {
  type: 'building',
  category: 'building',
  extracted: {
    building_type: 'warung',
    condition: 'baik',
    location_type: 'pinggir_jalan',
    estimated_value: 50000000,
    strategic_score: 8
  },
  credit_metrics: { /* ... */ },
  insights: ['Lokasi strategis', 'Kondisi bangunan baik'],
  recommendations: ['Pertahankan kebersihan'],
  confidence: 0.92
};

await UserService.saveBusinessIntelligence(
  phone,
  biData,
  'gs://bucket/images/abc123.jpg',  // Image URL
  'Foto warung saya'
);
```

### Query BI Data

```javascript
// Get all BI data for user
const allBI = await BusinessIntelligenceRepository.findByUser(phone);

// Get specific type
const ledgers = await BusinessIntelligenceRepository.findByType(phone, 'ledger');
const buildings = await BusinessIntelligenceRepository.findByType(phone, 'building');

// Calculate total asset value
const totalAssets = allBI
  .filter(bi => bi.type === 'building' || bi.type === 'inventory')
  .reduce((sum, bi) => sum + (bi.data.estimated_value || bi.data.inventory_value_estimate || 0), 0);
```

## API Endpoints

```
GET /api/users/:phone/business-intelligence
Returns: Array of all BI records

GET /api/users/:phone/business-intelligence?type=ledger
Returns: Filtered by type

POST /api/webhook (with image)
Automatically extracts and saves BI data
```

## Storage Strategy

**Images (building, inventory):**
- Upload to Cloud Storage
- Store public URL in `source.image_url`
- Keep extracted data in `data` object

**Text (ledger, transactions):**
- Store extracted text in `source.text`
- Store structured data in `data` object
- No image storage needed

## Benefits

1. **Flexible Schema** - `data` object adapts to different types
2. **Source Tracking** - Keep original image or text
3. **AI Insights** - Actionable recommendations in Indonesian
4. **Credit Scoring** - Automated loan assessment
5. **Queryable** - Easy filtering by type and user
6. **Scalable** - Add new types without schema changes
