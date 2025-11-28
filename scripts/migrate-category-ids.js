#!/usr/bin/env node
/**
 * Migration script to add category_id to existing users
 * Maps old category names to new category_id format
 */

require('dotenv').config();
const { Firestore } = require('@google-cloud/firestore');

const db = new Firestore({ projectId: process.env.GCP_PROJECT_ID });

// Mapping from old category names to new category_id
const CATEGORY_MAPPING = {
  // Exact matches
  'warung sembako': '01_warung_sembako',
  'toko kelontong': '01_warung_sembako',
  'toko fashion/pakaian': '02_toko_fashion',
  'toko pakaian': '02_toko_fashion',
  'fashion': '02_toko_fashion',
  'toko elektronik': '03_toko_elektronik',
  'toko pulsa/elektronik': '03_toko_elektronik',
  'pet shop': '04_pet_shop',
  'toko bangunan': '05_toko_bangunan',
  'toko mainan': '06_toko_mainan',
  'warung makan': '07_warung_makan',
  'usaha makanan': '07_warung_makan',
  'usaha catering': '07_warung_makan',
  'coffee shop': '08_coffee_shop',
  'warung kopi': '08_coffee_shop',
  'jajanan/camilan': '09_jajanan_camilan',
  'usaha kue/roti': '09_jajanan_camilan',
  'toko kue': '09_jajanan_camilan',
  'minuman kekinian': '10_minuman_kekinian',
  'usaha minuman': '10_minuman_kekinian',
  'laundry': '11_laundry',
  'jasa laundry': '11_laundry',
  'bengkel motor': '12_bengkel_motor',
  'bengkel': '12_bengkel_motor',
  'jasa kecantikan/salon': '13_jasa_kecantikan',
  'salon & kecantikan': '13_jasa_kecantikan',
  'salon kecantikan': '13_jasa_kecantikan',
  'penjahit/permak': '14_penjahit',
  'jasa jahit': '14_penjahit',
  'kos-kosan': '15_kos_kosan',
  'logistik/ekspedisi': '16_logistik',
  'kriya/kerajinan': '17_kriya_kerajinan',
  'kerajinan tangan': '17_kriya_kerajinan',
  'toko bunga': '17_kriya_kerajinan',
  'sewa kendaraan': '18_sewa_kendaraan',
  'jasa ojek/transportasi': '18_sewa_kendaraan',
  'petani': '19_petani',
  'pertanian': '19_petani',
  'nelayan/budidaya ikan': '20_nelayan',
  'budidaya ikan': '20_nelayan',
  'cuci steam': '21_cuci_steam',
  'jasa cuci motor/mobil': '21_cuci_steam',
  'apotek/toko obat': '22_apotek',
  'toko kosmetik': '22_apotek',
  'event organizer': '23_event_organizer',
  'bengkel las': '24_bengkel_las',
  'kontraktor/renovasi': '25_kontraktor',
  'jasa fotocopy/printing': '03_toko_elektronik',
  'jasa pijat/refleksi': '13_jasa_kecantikan',
  'peternakan': '19_petani',
  'lainnya': null
};

async function migrate() {
  console.log('🔄 Starting category_id migration...\n');
  
  const usersSnap = await db.collection('users').get();
  let updated = 0;
  let skipped = 0;
  
  for (const userDoc of usersSnap.docs) {
    const phone = userDoc.id;
    const businessDoc = await db.collection('users').doc(phone).collection('business').doc('data').get();
    
    if (!businessDoc.exists) {
      skipped++;
      continue;
    }
    
    const business = businessDoc.data();
    
    // Skip if already has category_id
    if (business.category_id) {
      console.log(`✓ ${phone}: Already has category_id (${business.category_id})`);
      skipped++;
      continue;
    }
    
    // Find matching category_id
    const oldCategory = (business.category || '').toLowerCase().trim();
    const categoryId = CATEGORY_MAPPING[oldCategory];
    
    if (!categoryId && oldCategory && oldCategory !== 'lainnya') {
      console.log(`⚠️ ${phone}: Unknown category "${business.category}"`);
      skipped++;
      continue;
    }
    
    if (categoryId) {
      await db.collection('users').doc(phone).collection('business').doc('data').update({
        category_id: categoryId,
        updated_at: new Date().toISOString()
      });
      console.log(`✅ ${phone}: ${business.category} → ${categoryId}`);
      updated++;
    } else {
      skipped++;
    }
  }
  
  console.log(`\n✅ Migration complete: ${updated} updated, ${skipped} skipped`);
}

migrate().catch(console.error);
