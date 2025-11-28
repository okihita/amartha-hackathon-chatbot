/**
 * Firestore Database Schema
 * Single source of truth for all document structures
 */

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  MAJELIS: 'majelis',
  FINANCIAL_LITERACY: 'financial_literacy',
  BUSINESS_TYPES: 'business_types'
};

// User document schema
const createUserDocument = (data) => ({
  name: data.name,
  business_type: data.business_type,
  location: data.location,
  majelis_id: null,
  majelis_day: "BELUM VERIFIKASI (Hubungi Petugas)",
  current_module: "Welcome Phase",
  literacy_score: "Low",
  is_verified: false,
  pending_verification: null,
  verified_transactions: [],
  // Loan fields
  loan_limit: 0,
  loan_used: 0,
  loan_remaining: 0,
  next_payment_date: null,
  next_payment_amount: 0,
  loan_history: [],
  created_at: new Date().toISOString()
});

// Majelis document schema
const createMajelisDocument = (data) => ({
  name: data.name,
  description: data.description || '',
  schedule_day: data.schedule_day,
  schedule_time: data.schedule_time || '10:00',
  location: data.location || '',
  members: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});

// Mock user schema
const createMockUser = (userData) => ({
  ...userData,
  status: 'pending',
  is_mock: true,
  registered_at: new Date().toISOString(),
  majelis_id: null
});

// Mock majelis schema
const createMockMajelisDocument = (majelisData) => ({
  ...majelisData,
  members: [],
  is_mock: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});

// Mock data templates
const MOCK_USERS = [
  { name: 'Siti Nurhaliza', phone: '6281234567801', business_type: 'Warung Kelontong', location: 'Jakarta Selatan' },
  { name: 'Dewi Lestari', phone: '6281234567802', business_type: 'Toko Pakaian', location: 'Bandung' },
  { name: 'Rina Susanti', phone: '6281234567803', business_type: 'Warung Makan', location: 'Surabaya' },
  { name: 'Maya Sari', phone: '6281234567804', business_type: 'Salon Kecantikan', location: 'Yogyakarta' },
  { name: 'Ani Wijaya', phone: '6281234567805', business_type: 'Toko Kue', location: 'Semarang' },
  { name: 'Fitri Handayani', phone: '6281234567806', business_type: 'Laundry', location: 'Malang' },
  { name: 'Ratna Dewi', phone: '6281234567807', business_type: 'Toko Bunga', location: 'Solo' },
  { name: 'Sri Wahyuni', phone: '6281234567808', business_type: 'Warung Kopi', location: 'Medan' }
];

const MOCK_MAJELIS = [
  { name: 'Majelis Sejahtera', description: 'Kelompok UMKM Jakarta Selatan', schedule_day: 'Senin', schedule_time: '10:00', location: 'Balai Desa Kebayoran' },
  { name: 'Majelis Berkah', description: 'Kelompok UMKM Bandung', schedule_day: 'Selasa', schedule_time: '14:00', location: 'Gedung Serbaguna Dago' },
  { name: 'Majelis Mandiri', description: 'Kelompok UMKM Surabaya', schedule_day: 'Rabu', schedule_time: '09:00', location: 'Balai RW 05' }
];

module.exports = {
  COLLECTIONS,
  createUserDocument,
  createMajelisDocument,
  createMockUser,
  createMockMajelisDocument,
  MOCK_USERS,
  MOCK_MAJELIS
};
