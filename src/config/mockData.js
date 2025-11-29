// Base coordinates for Jakarta area (Kebayoran)
const JAKARTA_BASE = { lat: -6.2350, lng: 106.8000 };

const MOCK_USERS = [
  { 
    name: 'Siti Nurhaliza', 
    phone: '6281335607447',
    business_name: 'Warung Kelontong', 
    business_location: 'Jakarta Selatan',
    category: 'Warung Kelontong',
    maturity_level: 3,
    dob: '1985-05-15',
    gender: 'female',
    address: 'Jl. Merdeka No. 123, Jakarta Selatan',
    loan_limit: 5000000,
    loan_used: 3000000,
    home_lat: JAKARTA_BASE.lat + 0.008,
    home_lng: JAKARTA_BASE.lng + 0.005,
    business_lat: JAKARTA_BASE.lat + 0.012,
    business_lng: JAKARTA_BASE.lng + 0.008
  },
  { 
    name: 'Dewi Lestari', 
    phone: '6281234567802', 
    business_name: 'Toko Pakaian', 
    business_location: 'Jakarta Selatan',
    category: 'Toko Pakaian',
    maturity_level: 4,
    dob: '1988-08-20',
    gender: 'female',
    address: 'Jl. Braga No. 45, Jakarta Selatan',
    loan_limit: 7000000,
    loan_used: 4000000,
    home_lat: JAKARTA_BASE.lat - 0.005,
    home_lng: JAKARTA_BASE.lng + 0.012,
    business_lat: JAKARTA_BASE.lat - 0.002,
    business_lng: JAKARTA_BASE.lng + 0.018
  },
  { 
    name: 'Rina Susanti', 
    phone: '6281234567803', 
    business_name: 'Warung Makan', 
    business_location: 'Jakarta Selatan',
    category: 'Warung Makan',
    maturity_level: 2,
    dob: '1990-03-10',
    gender: 'female',
    address: 'Jl. Pemuda No. 78, Jakarta Selatan',
    loan_limit: 3000000,
    loan_used: 1500000,
    home_lat: JAKARTA_BASE.lat + 0.015,
    home_lng: JAKARTA_BASE.lng - 0.008,
    business_lat: JAKARTA_BASE.lat + 0.018,
    business_lng: JAKARTA_BASE.lng - 0.003
  },
  { 
    name: 'Maya Sari', 
    phone: '6281234567804', 
    business_name: 'Salon Kecantikan', 
    business_location: 'Jakarta Selatan',
    category: 'Salon Kecantikan',
    maturity_level: 3,
    dob: '1987-11-25',
    gender: 'female',
    address: 'Jl. Malioboro No. 56, Jakarta Selatan',
    loan_limit: 4000000,
    loan_used: 2000000,
    home_lat: JAKARTA_BASE.lat - 0.012,
    home_lng: JAKARTA_BASE.lng - 0.006,
    business_lat: JAKARTA_BASE.lat - 0.008,
    business_lng: JAKARTA_BASE.lng + 0.002
  },
  { 
    name: 'Ani Wijaya', 
    phone: '6281234567805', 
    business_name: 'Toko Kue', 
    business_location: 'Jakarta Selatan',
    category: 'Toko Kue',
    maturity_level: 5,
    dob: '1983-07-12',
    gender: 'female',
    address: 'Jl. Pandanaran No. 89, Jakarta Selatan',
    loan_limit: 10000000,
    loan_used: 6000000,
    home_lat: JAKARTA_BASE.lat + 0.003,
    home_lng: JAKARTA_BASE.lng - 0.015,
    business_lat: JAKARTA_BASE.lat + 0.008,
    business_lng: JAKARTA_BASE.lng - 0.010
  },
  { 
    name: 'Fitri Handayani', 
    phone: '6281234567806', 
    business_name: 'Laundry', 
    business_location: 'Jakarta Selatan',
    category: 'Laundry',
    maturity_level: 2,
    dob: '1992-02-18',
    gender: 'female',
    address: 'Jl. Ijen No. 34, Jakarta Selatan',
    loan_limit: 2500000,
    loan_used: 1000000,
    home_lat: JAKARTA_BASE.lat - 0.018,
    home_lng: JAKARTA_BASE.lng + 0.008,
    business_lat: JAKARTA_BASE.lat - 0.015,
    business_lng: JAKARTA_BASE.lng + 0.015
  },
  { 
    name: 'Ratna Dewi', 
    phone: '6281234567807', 
    business_name: 'Toko Bunga', 
    business_location: 'Jakarta Selatan',
    category: 'Toko Bunga',
    maturity_level: 3,
    dob: '1989-09-05',
    gender: 'female',
    address: 'Jl. Slamet Riyadi No. 67, Jakarta Selatan',
    loan_limit: 3500000,
    loan_used: 2000000,
    home_lat: JAKARTA_BASE.lat + 0.020,
    home_lng: JAKARTA_BASE.lng + 0.015,
    business_lat: JAKARTA_BASE.lat + 0.015,
    business_lng: JAKARTA_BASE.lng + 0.020
  },
  { 
    name: 'Sri Wahyuni', 
    phone: '6281234567808', 
    business_name: 'Warung Kopi', 
    business_location: 'Jakarta Selatan',
    category: 'Warung Kopi',
    maturity_level: 4,
    dob: '1986-12-30',
    gender: 'female',
    address: 'Jl. Gatot Subroto No. 12, Jakarta Selatan',
    loan_limit: 6000000,
    loan_used: 3500000,
    home_lat: JAKARTA_BASE.lat - 0.008,
    home_lng: JAKARTA_BASE.lng - 0.018,
    business_lat: JAKARTA_BASE.lat - 0.003,
    business_lng: JAKARTA_BASE.lng - 0.012
  }
];

const MOCK_MAJELIS = [
  { 
    name: 'Majelis Sejahtera', 
    description: 'Kelompok UMKM Jakarta Selatan', 
    schedule_day: 'Senin', 
    schedule_time: '10:00', 
    location: 'Balai Desa Kebayoran',
    meeting_lat: JAKARTA_BASE.lat,
    meeting_lng: JAKARTA_BASE.lng,
    members: ['6281335607447', '6281234567802', '6281234567803', '6281234567804']
  },
  { 
    name: 'Majelis Berkah', 
    description: 'Kelompok UMKM Jakarta Selatan', 
    schedule_day: 'Selasa', 
    schedule_time: '14:00', 
    location: 'Gedung Serbaguna Kebayoran',
    meeting_lat: JAKARTA_BASE.lat + 0.005,
    meeting_lng: JAKARTA_BASE.lng - 0.010,
    members: ['6281234567805', '6281234567806', '6281234567807', '6281234567808']
  },
  { 
    name: 'Majelis Maju Bersama', 
    description: 'Kelompok UMKM Jakarta Selatan', 
    schedule_day: 'Rabu', 
    schedule_time: '09:00', 
    location: 'Balai RW 05 Kebayoran',
    meeting_lat: JAKARTA_BASE.lat - 0.008,
    meeting_lng: JAKARTA_BASE.lng + 0.005,
    members: ['6281335607447', '6281234567805', '6281234567807']
  },
  { 
    name: 'Majelis Mandiri', 
    description: 'Kelompok UMKM Jakarta Selatan', 
    schedule_day: 'Kamis', 
    schedule_time: '13:00', 
    location: 'Pendopo Kelurahan Kebayoran',
    meeting_lat: JAKARTA_BASE.lat + 0.010,
    meeting_lng: JAKARTA_BASE.lng + 0.012,
    members: ['6281234567802', '6281234567804', '6281234567806', '6281234567808']
  }
];

const MOCK_BI_DATA = [
  {
    type: 'ledger',
    analysis_category: 'financial_record',
    extracted: {
      record_type: 'buku_kas',
      transactions: [
        { date: '2025-11-20', description: 'Penjualan harian', amount: 250000, type: 'income' },
        { date: '2025-11-20', description: 'Beli stok', amount: -150000, type: 'expense' }
      ],
      daily_income_estimate: 250000,
      daily_expense_estimate: 150000,
      daily_profit_estimate: 100000,
      monthly_cashflow_estimate: 3000000,
      record_quality: 'rapi',
      literacy_indicator: 8
    }
  },
  {
    type: 'inventory',
    analysis_category: 'asset',
    extracted: {
      items: [
        { name: 'Beras 5kg', quantity_estimate: 20, unit: 'karung', estimated_price: 80000 },
        { name: 'Minyak goreng', quantity_estimate: 15, unit: 'botol', estimated_price: 25000 },
        { name: 'Gula pasir', quantity_estimate: 10, unit: 'kg', estimated_price: 15000 }
      ],
      total_items_count: 45,
      inventory_value_estimate: 5000000,
      stock_level: 'cukup',
      variety_score: 7,
      turnover_indicator: 'cepat'
    }
  },
  {
    type: 'building',
    analysis_category: 'asset',
    extracted: {
      building_type: 'warung',
      condition: 'baik',
      size_estimate: '4x6 meter',
      location_type: 'pinggir_jalan',
      visibility: 'sangat_terlihat',
      estimated_value: 50000000,
      strategic_score: 8
    }
  },
  {
    type: 'ledger',
    analysis_category: 'financial_record',
    extracted: {
      record_type: 'nota_penjualan',
      transactions: [
        { date: '2025-11-21', description: 'Penjualan sore', amount: 180000, type: 'income' }
      ],
      daily_income_estimate: 180000,
      daily_expense_estimate: 100000,
      daily_profit_estimate: 80000,
      monthly_cashflow_estimate: 2400000,
      record_quality: 'cukup_rapi',
      literacy_indicator: 7
    }
  },
  {
    type: 'transaction',
    analysis_category: 'financial_record',
    extracted: {
      transactions: [
        { date: '2025-11-22', items: ['Sabun', 'Shampo', 'Pasta gigi'], total: 45000, type: 'sale' },
        { date: '2025-11-22', items: ['Mie instan', 'Kopi', 'Teh'], total: 35000, type: 'sale' }
      ],
      total_amount: 80000,
      transaction_count: 2
    }
  }
];

module.exports = { MOCK_USERS, MOCK_MAJELIS, MOCK_BI_DATA };
