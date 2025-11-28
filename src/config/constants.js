const COLLECTIONS = {
  USERS: 'users',
  MAJELIS: 'majelis',
  FINANCIAL_LITERACY: 'financial_literacy',
  BUSINESS_CLASSIFICATIONS: 'business_classifications'
};

const USER_COLLECTIONS = {
  PROFILE: 'profile',
  BUSINESS: 'business',
  LOAN: 'loan',
  LITERACY: 'literacy',
  BUSINESS_INTELLIGENCE: 'business_intelligence'
};

const MAJELIS_COLLECTIONS = {
  ATTENDANCE: 'attendance'
};

// Fixed 25 business categories with IDs
const BUSINESS_CATEGORIES = [
  { id: '01_warung_sembako', name: 'Warung Sembako', num: 1 },
  { id: '02_toko_fashion', name: 'Toko Fashion/Pakaian', num: 2 },
  { id: '03_toko_elektronik', name: 'Toko Elektronik', num: 3 },
  { id: '04_pet_shop', name: 'Pet Shop', num: 4 },
  { id: '05_toko_bangunan', name: 'Toko Bangunan', num: 5 },
  { id: '06_toko_mainan', name: 'Toko Mainan', num: 6 },
  { id: '07_warung_makan', name: 'Warung Makan', num: 7 },
  { id: '08_coffee_shop', name: 'Coffee Shop', num: 8 },
  { id: '09_jajanan_camilan', name: 'Jajanan/Camilan', num: 9 },
  { id: '10_minuman_kekinian', name: 'Minuman Kekinian', num: 10 },
  { id: '11_laundry', name: 'Laundry', num: 11 },
  { id: '12_bengkel_motor', name: 'Bengkel Motor', num: 12 },
  { id: '13_jasa_kecantikan', name: 'Jasa Kecantikan/Salon', num: 13 },
  { id: '14_penjahit', name: 'Penjahit/Permak', num: 14 },
  { id: '15_kos_kosan', name: 'Kos-kosan', num: 15 },
  { id: '16_logistik', name: 'Logistik/Ekspedisi', num: 16 },
  { id: '17_kriya_kerajinan', name: 'Kriya/Kerajinan', num: 17 },
  { id: '18_sewa_kendaraan', name: 'Sewa Kendaraan', num: 18 },
  { id: '19_petani', name: 'Petani', num: 19 },
  { id: '20_nelayan', name: 'Nelayan/Budidaya Ikan', num: 20 },
  { id: '21_cuci_steam', name: 'Cuci Steam', num: 21 },
  { id: '22_apotek', name: 'Apotek/Toko Obat', num: 22 },
  { id: '23_event_organizer', name: 'Event Organizer', num: 23 },
  { id: '24_bengkel_las', name: 'Bengkel Las', num: 24 },
  { id: '25_kontraktor', name: 'Kontraktor/Renovasi', num: 25 },
];

module.exports = { COLLECTIONS, USER_COLLECTIONS, MAJELIS_COLLECTIONS, BUSINESS_CATEGORIES };
