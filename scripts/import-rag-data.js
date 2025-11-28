#!/usr/bin/env node

/**
 * Import RAG Data to Firestore
 * 
 * This script imports business classifications and financial literacy modules
 * from markdown files into Firestore collections.
 * 
 * Usage:
 *   node scripts/import-rag-data.js
 */

const { Firestore } = require('@google-cloud/firestore');
const fs = require('fs');
const path = require('path');

const db = new Firestore({
  projectId: process.env.GCP_PROJECT_ID || 'stellar-zoo-478021-v8',
});

// ===== BUSINESS CLASSIFICATIONS =====

async function importBusinessClassifications() {
  console.log('📊 Importing Business Classifications...');
  
  // Example data structure - replace with your actual data
  const classifications = [
    {
      id: 'warung_sembako',
      business_type: 'Warung Sembako',
      legal_category: 'Mikro',
      description: 'Toko yang menjual kebutuhan pokok sehari-hari seperti beras, minyak, gula, dan sembako lainnya',
      levels: [
        {
          level: 1,
          name: 'Pemula - Baru Memulai',
          criteria: [
            'Omzet < Rp 5 juta/bulan',
            'Belum ada pembukuan',
            'Modal dari tabungan pribadi',
            'Usaha berjalan <6 bulan'
          ],
          characteristics: [
            'Belum memiliki pelanggan tetap',
            'Stok barang terbatas',
            'Belum ada sistem pencatatan'
          ],
          next_steps: [
            'Mulai catat pemasukan dan pengeluaran harian',
            'Buat daftar pelanggan tetap',
            'Pelajari cara menghitung laba rugi sederhana',
            'Ikuti pelatihan pembukuan dasar'
          ],
          swot: {
            strengths: [
              'Lokasi strategis di dekat rumah',
              'Kenal dengan warga sekitar',
              'Fleksibel dalam jam buka'
            ],
            weaknesses: [
              'Modal terbatas',
              'Belum ada sistem pembukuan',
              'Stok barang sering habis',
              'Belum punya supplier tetap'
            ],
            opportunities: [
              'Banyak warga yang membutuhkan warung dekat',
              'Bisa jual produk tambahan (pulsa, token listrik)',
              'Potensi jadi agen sembako'
            ],
            threats: [
              'Ada warung lain yang lebih besar',
              'Harga sembako naik turun',
              'Persaingan dengan minimarket'
            ]
          },
          recommended_actions: [
            'Bergabung dengan Majelis untuk belajar dari ibu-ibu lain',
            'Mulai gunakan buku kas sederhana',
            'Cari supplier dengan harga terbaik',
            'Fokus pada pelayanan yang ramah'
          ],
          estimated_duration: '3-6 bulan'
        },
        {
          level: 2,
          name: 'Berkembang - Mulai Stabil',
          criteria: [
            'Omzet Rp 5-15 juta/bulan',
            'Sudah ada pembukuan sederhana',
            'Punya pelanggan tetap',
            'Usaha berjalan 6-12 bulan'
          ],
          characteristics: [
            'Sudah punya supplier tetap',
            'Stok barang lebih lengkap',
            'Mulai ada sistem pencatatan'
          ],
          next_steps: [
            'Tingkatkan variasi produk',
            'Perbaiki sistem pembukuan',
            'Mulai analisis produk laris',
            'Pertimbangkan tambah modal'
          ],
          swot: {
            strengths: [
              'Sudah punya pelanggan tetap',
              'Sistem pembukuan mulai teratur',
              'Supplier sudah stabil'
            ],
            weaknesses: [
              'Modal masih terbatas untuk ekspansi',
              'Belum optimal dalam manajemen stok',
              'Promosi masih terbatas'
            ],
            opportunities: [
              'Bisa tambah produk baru',
              'Potensi jadi agen resmi',
              'Bisa mulai jualan online'
            ],
            threats: [
              'Kompetitor mulai banyak',
              'Fluktuasi harga',
              'Perubahan pola belanja konsumen'
            ]
          },
          recommended_actions: [
            'Ikuti pelatihan manajemen stok',
            'Mulai promosi di media sosial',
            'Pertimbangkan pinjaman modal usaha',
            'Tingkatkan kualitas pelayanan'
          ],
          estimated_duration: '6-12 bulan'
        },
        // Add levels 3-5 similarly
      ],
      keywords: [
        'warung', 'sembako', 'toko kelontong', 'kebutuhan pokok',
        'beras', 'minyak', 'gula', 'toko', 'retail'
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    // Add more business types...
  ];
  
  for (const classification of classifications) {
    await db.collection('business_classifications')
      .doc(classification.id)
      .set(classification);
    console.log(`✅ Imported: ${classification.business_type}`);
  }
  
  console.log(`\n✅ Imported ${classifications.length} business classifications`);
}

// ===== FINANCIAL LITERACY MODULES =====

async function importFinancialModules() {
  console.log('\n📚 Importing Financial Literacy Modules...');
  
  // Example data structure - replace with your actual data
  const modules = [
    {
      id: 'week_1',
      week: 1,
      title: 'Pengenalan Literasi Keuangan',
      subtitle: 'Memahami Pentingnya Mengelola Uang',
      description: 'Modul ini memperkenalkan konsep dasar literasi keuangan dan pentingnya mengelola keuangan untuk UMKM',
      learning_objectives: [
        'Memahami apa itu literasi keuangan',
        'Mengetahui manfaat literasi keuangan untuk usaha',
        'Mampu membedakan kebutuhan dan keinginan',
        'Memahami pentingnya pencatatan keuangan'
      ],
      content: {
        introduction: 'Literasi keuangan adalah kemampuan untuk memahami dan mengelola keuangan dengan baik. Untuk UMKM, literasi keuangan sangat penting agar usaha bisa berkembang dan menguntungkan.',
        main_topics: [
          {
            topic: 'Apa itu Literasi Keuangan?',
            content: 'Literasi keuangan mencakup kemampuan untuk merencanakan, mengelola, dan mengambil keputusan keuangan yang tepat.',
            examples: [
              'Membuat anggaran bulanan',
              'Mencatat pemasukan dan pengeluaran',
              'Merencanakan tabungan'
            ]
          },
          {
            topic: 'Mengapa Penting untuk UMKM?',
            content: 'Dengan literasi keuangan yang baik, UMKM bisa menghindari kerugian, merencanakan pertumbuhan, dan membuat keputusan bisnis yang lebih baik.',
            examples: [
              'Mengetahui kapan harus tambah stok',
              'Memahami laba rugi usaha',
              'Merencanakan ekspansi usaha'
            ]
          },
          {
            topic: 'Kebutuhan vs Keinginan',
            content: 'Membedakan kebutuhan (harus dipenuhi) dan keinginan (boleh ditunda) sangat penting untuk mengelola keuangan usaha.',
            examples: [
              'Kebutuhan: Stok barang, sewa tempat',
              'Keinginan: Renovasi mewah, peralatan mahal'
            ]
          }
        ],
        summary: 'Literasi keuangan adalah fondasi penting untuk kesuksesan UMKM. Dengan memahami dasar-dasar pengelolaan keuangan, Ibu bisa membuat keputusan yang lebih baik untuk usaha.',
        key_takeaways: [
          'Literasi keuangan = kemampuan mengelola uang dengan baik',
          'Penting untuk kesuksesan UMKM',
          'Bedakan kebutuhan dan keinginan',
          'Mulai dengan pencatatan sederhana'
        ]
      },
      quiz: [
        {
          id: 'q1',
          question: 'Apa yang dimaksud dengan literasi keuangan?',
          options: [
            'A. Kemampuan membaca dan menulis tentang uang',
            'B. Kemampuan mengelola keuangan dengan baik',
            'C. Kemampuan menghitung uang dengan cepat',
            'D. Kemampuan menghasilkan uang banyak'
          ],
          correct_answer: 'B',
          explanation: 'Literasi keuangan adalah kemampuan untuk memahami dan mengelola keuangan dengan baik, termasuk perencanaan, penganggaran, dan investasi.'
        },
        {
          id: 'q2',
          question: 'Manakah yang termasuk kebutuhan untuk usaha warung?',
          options: [
            'A. Membeli HP baru untuk jualan online',
            'B. Membeli stok beras dan minyak',
            'C. Renovasi warung dengan cat warna-warni',
            'D. Membeli etalase kaca yang mahal'
          ],
          correct_answer: 'B',
          explanation: 'Kebutuhan adalah hal yang harus dipenuhi untuk menjalankan usaha. Stok barang adalah kebutuhan utama warung.'
        },
        {
          id: 'q3',
          question: 'Mengapa pencatatan keuangan penting untuk UMKM?',
          options: [
            'A. Agar terlihat profesional',
            'B. Untuk mengetahui laba rugi usaha',
            'C. Karena diwajibkan pemerintah',
            'D. Supaya bisa pinjam uang bank'
          ],
          correct_answer: 'B',
          explanation: 'Pencatatan keuangan membantu kita mengetahui apakah usaha untung atau rugi, sehingga bisa membuat keputusan yang lebih baik.'
        },
        {
          id: 'q4',
          question: 'Apa manfaat literasi keuangan untuk UMKM?',
          options: [
            'A. Usaha langsung untung besar',
            'B. Bisa menghindari kerugian dan merencanakan pertumbuhan',
            'C. Tidak perlu modal lagi',
            'D. Otomatis dapat pinjaman'
          ],
          correct_answer: 'B',
          explanation: 'Literasi keuangan membantu kita membuat keputusan yang lebih baik, menghindari kerugian, dan merencanakan pertumbuhan usaha.'
        },
        {
          id: 'q5',
          question: 'Contoh keinginan (bukan kebutuhan) untuk usaha adalah:',
          options: [
            'A. Membeli stok barang',
            'B. Bayar sewa tempat',
            'C. Renovasi warung mewah',
            'D. Bayar listrik dan air'
          ],
          correct_answer: 'C',
          explanation: 'Renovasi mewah adalah keinginan yang bisa ditunda. Kebutuhan adalah hal yang harus dipenuhi untuk menjalankan usaha.'
        }
      ],
      passing_score: 70,
      keywords: [
        'literasi keuangan', 'mengelola uang', 'kebutuhan', 'keinginan',
        'dasar keuangan', 'pencatatan', 'pembukuan'
      ],
      difficulty: 'Pemula',
      estimated_time: '30 menit',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    // Add weeks 2-15...
  ];
  
  for (const module of modules) {
    await db.collection('financial_literacy_modules')
      .doc(module.id)
      .set(module);
    console.log(`✅ Imported: Week ${module.week} - ${module.title}`);
  }
  
  console.log(`\n✅ Imported ${modules.length} financial literacy modules`);
}

// ===== MAIN EXECUTION =====

async function main() {
  try {
    console.log('🚀 Starting RAG Data Import...\n');
    
    await importBusinessClassifications();
    await importFinancialModules();
    
    console.log('\n✅ All data imported successfully!');
    console.log('\n📊 Summary:');
    
    // Get counts
    const businessCount = (await db.collection('business_classifications').get()).size;
    const moduleCount = (await db.collection('financial_literacy_modules').get()).size;
    
    console.log(`   - Business Classifications: ${businessCount}`);
    console.log(`   - Financial Modules: ${moduleCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing data:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { importBusinessClassifications, importFinancialModules };
