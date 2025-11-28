#!/usr/bin/env node

/**
 * Financial Literacy Import Script
 * - Nuclear cleanup: Deletes entire collection before import
 * - Improved parsing for materi_penyampaian subsections
 * - Stores quizzes in bank_soal field
 * - Parses indikator_kelulusan and logika_feedback
 * - Uses zero-padded document IDs (week_01, week_02, etc.)
 */

require('dotenv').config();
const { google } = require('googleapis');
const { Firestore } = require('@google-cloud/firestore');

const db = new Firestore({
  projectId: process.env.GCP_PROJECT_ID || 'stellar-zoo-478021-v8',
});

const FOLDER_ID = process.env.FINANCIAL_LITERACY_FOLDER_ID || '1_qBhLNCfdxkLVTro_jJACF6sm_rG9ZBt';
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

async function clearCollection() {
  console.log('🗑️  Nuclear cleanup: Clearing financial_literacy collection...');
  const snapshot = await db.collection('financial_literacy').get();
  const batch = db.batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  console.log(`✅ Deleted ${snapshot.size} documents\n`);
}

async function getGoogleDriveClient() {
  const fs = require('fs');
  if (fs.existsSync('./service-account-key.json')) {
    console.log('🔐 Using service account authentication\n');
    const auth = new google.auth.GoogleAuth({
      keyFile: './service-account-key.json',
      scopes: [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/documents.readonly'
      ],
    });
    return await auth.getClient();
  }
  
  if (GOOGLE_API_KEY) {
    console.log('🔓 Using API key for public folder access\n');
    return GOOGLE_API_KEY;
  }
  
  throw new Error('No authentication method available');
}

async function listDocsInFolder(drive, folderId) {
  const response = await drive.files.list({
    q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.document'`,
    fields: 'files(id, name)',
  });
  return response.data.files;
}

async function getDocumentContent(docs, docId) {
  const response = await docs.documents.get({ documentId: docId });
  return response.data;
}

function extractSections(doc) {
  const sections = [];
  for (const element of doc.body.content || []) {
    if (element.paragraph) {
      let text = '';
      let style = element.paragraph.paragraphStyle?.namedStyleType || 'NORMAL_TEXT';
      
      for (const textElement of element.paragraph.elements || []) {
        if (textElement.textRun) {
          text += textElement.textRun.content;
        }
      }

      if (text.trim()) {
        sections.push({
          text: text.trim(),
          style,
          isHeading: style.includes('HEADING')
        });
      }
    }
  }
  return sections;
}

function parseMateriPenyampaian(sections, startIdx) {
  const materi = {
    pancingan_awal: [],
    materi_inti: [],
    instruksi_aksi: []
  };
  
  let currentSubsection = null;
  
  for (let i = startIdx; i < sections.length; i++) {
    const text = sections[i].text;
    const lower = text.toLowerCase();
    
    // Stop at next major section
    if (lower.includes('bank soal') || lower.includes('indikator kelulusan') || 
        lower.includes('logika feedback')) {
      break;
    }
    
    // Detect subsections
    if (lower.includes('pancingan awal') || lower.includes('hook')) {
      currentSubsection = 'pancingan_awal';
      continue;
    }
    if (lower.includes('materi inti')) {
      currentSubsection = 'materi_inti';
      continue;
    }
    if (lower.includes('instruksi aksi') || lower.includes('actionable')) {
      currentSubsection = 'instruksi_aksi';
      continue;
    }
    
    // Add content to current subsection
    if (currentSubsection && text.trim()) {
      materi[currentSubsection].push(text.trim());
    }
  }
  
  return materi;
}

function parseIndikatorKelulusan(sections, startIdx) {
  const indikator = [];
  let inSection = false;
  let skipIntro = 0;  // Skip first 1-2 lines (intro text)
  
  for (let i = startIdx; i < sections.length; i++) {
    const text = sections[i].text;
    const lower = text.toLowerCase();
    
    // Start collecting after section header
    if (lower.match(/indikator kelulusan/i)) {
      inSection = true;
      skipIntro = 0;
      continue;
    }
    
    // Stop at next major section
    if (inSection && (lower.match(/^(v|5)\.?\s/i) || lower.includes('bank soal') || lower.includes('logika feedback'))) {
      break;
    }
    
    if (!inSection) continue;
    
    // Skip first line or two (intro paragraph)
    if (skipIntro < 2 && !text.match(/^[\d\-•]/)) {
      skipIntro++;
      continue;
    }
    
    // Collect any line with content (numbered, bulleted, or plain)
    if (text.trim()) {
      const cleaned = text
        .replace(/^[\d]+\.\s*/, '')  // Remove numbers
        .replace(/^[-•]\s*/, '')      // Remove bullets
        .trim();
      
      if (cleaned && cleaned.length > 10) {  // Meaningful content
        indikator.push(cleaned);
      }
    }
  }
  
  return indikator;
}

function parseLogikaFeedback(sections, startIdx) {
  const logika = {
    jawaban_benar: [],
    jawaban_salah: []
  };
  
  let currentSubsection = null;
  let inSection = false;
  
  for (let i = startIdx; i < sections.length; i++) {
    const text = sections[i].text;
    const lower = text.toLowerCase();
    
    // Start section
    if (lower.includes('logika feedback') || lower.includes('feedback logic')) {
      inSection = true;
      continue;
    }
    
    // Stop at "IV. Indikator Kelulusan" or similar
    if (inSection && (lower.match(/^(iv|4)\.?\s*indikator/i) || lower.includes('indikator kelulusan minggu'))) {
      break;
    }
    
    if (!inSection) continue;
    
    // Detect subsection headers (with or without bullet)
    if (lower.match(/(jawaban benar|jika benar|bila benar)/i) && !currentSubsection) {
      currentSubsection = 'jawaban_benar';
      continue;
    }
    if (lower.match(/(jawaban salah|jika salah|bila salah)/i) && currentSubsection === 'jawaban_benar') {
      currentSubsection = 'jawaban_salah';
      continue;
    }
    
    // Collect all non-empty lines after subsection is set
    if (currentSubsection && text.trim()) {
      // Clean up the text
      const cleaned = text
        .replace(/^[\s•\-]+/, '')  // Remove leading spaces and bullets
        .replace(/^\d+\.\s*/, '')   // Remove leading numbers
        .trim();
      
      // Add if meaningful content
      if (cleaned && cleaned.length > 2 && !cleaned.match(/^(jawaban|jika|bila)/i)) {
        logika[currentSubsection].push(cleaned);
      }
    }
  }
  
  return logika;
}

function parseBankSoal(sections, startIdx) {
  const quizzes = [];
  let currentQuestion = null;
  let options = [];
  let correctIdx = -1;
  let explanation = '';
  let inSection = false;
  
  for (let i = startIdx; i < sections.length; i++) {
    const text = sections[i].text;
    const lower = text.toLowerCase();
    
    // Start collecting after Bank Soal header
    if (lower.includes('bank soal')) {
      inSection = true;
      continue;
    }
    
    // Skip "Bagian A:", "Bagian B:", etc. (visual separators only)
    if (lower.match(/^bagian\s+[a-z]:/i)) {
      continue;
    }
    
    if (!inSection) continue;
    
    // Detect question (starts with number)
    if (text.match(/^\d+\./)) {
      // Save previous quiz
      if (currentQuestion && options.length >= 2) {
        quizzes.push({
          question: currentQuestion,
          options: options,
          correct: correctIdx >= 0 ? correctIdx : 0,
          explanation: explanation
        });
      }
      
      // Start new quiz
      currentQuestion = text.replace(/^\d+\.\s*/, '').trim();
      options = [];
      correctIdx = -1;
      explanation = '';
      continue;
    }
    
    // Detect options (A., B., etc.)
    const optionMatch = text.match(/^([A-D])\.\s*(.+)/i);
    if (optionMatch && currentQuestion) {
      const optionText = optionMatch[2].trim();
      const hasCheckmark = optionText.includes('✅') || optionText.includes('✓');
      
      options.push(optionText.replace(/[✅✓]/g, '').trim());
      
      if (hasCheckmark) {
        correctIdx = options.length - 1;
      }
      continue;
    }
    
    // Detect explanation (Pembahasan:)
    if (lower.includes('pembahasan:') && currentQuestion) {
      explanation = text.replace(/pembahasan:\s*/i, '').trim();
    }
  }
  
  // Save last quiz
  if (currentQuestion && options.length >= 2) {
    quizzes.push({
      question: currentQuestion,
      options: options,
      correct: correctIdx >= 0 ? correctIdx : 0,
      explanation: explanation
    });
  }
  
  return quizzes;
}

function parseCourseModule(sections, fileName) {
  const parsed = {
    module_name: fileName.trim(),
    week_number: null,
    module_number: null,
    description: '',
    materi_penyampaian: {},
    bank_soal: [],
    logika_feedback: {},
    indikator_kelulusan: []
  };

  // Extract week and module numbers
  const weekMatch = fileName.match(/(?:minggu|week)\s*(\d+)/i);
  if (weekMatch) parsed.week_number = parseInt(weekMatch[1]);
  
  const moduleMatch = fileName.match(/(?:modul|module)\s*(\d+)/i);
  if (moduleMatch) parsed.module_number = parseInt(moduleMatch[1]);

  // Find section indices
  let materiIdx = -1;
  let bankSoalIdx = -1;
  let indikatorIdx = -1;
  let logikaIdx = -1;
  
  for (let i = 0; i < sections.length; i++) {
    const lower = sections[i].text.toLowerCase();
    if (lower.includes('materi penyampaian') && materiIdx === -1) materiIdx = i;
    if (lower.includes('bank soal') && bankSoalIdx === -1) bankSoalIdx = i;
    if (lower.includes('indikator kelulusan') && indikatorIdx === -1) indikatorIdx = i;
    if (lower.includes('logika feedback') && logikaIdx === -1) logikaIdx = i;
  }

  // Parse description (first few non-heading paragraphs)
  const descLines = [];
  for (let i = 0; i < Math.min(5, sections.length); i++) {
    if (!sections[i].isHeading && sections[i].text.trim()) {
      descLines.push(sections[i].text.trim());
      if (descLines.length >= 2) break;
    }
  }
  parsed.description = descLines.join(' ');

  // Parse sections
  if (materiIdx >= 0) {
    parsed.materi_penyampaian = parseMateriPenyampaian(sections, materiIdx);
  }
  
  if (indikatorIdx >= 0) {
    parsed.indikator_kelulusan = parseIndikatorKelulusan(sections, indikatorIdx);
  } else {
    console.log(`  ⚠️  No "Indikator Kelulusan" section found`);
  }
  
  if (logikaIdx >= 0) {
    parsed.logika_feedback = parseLogikaFeedback(sections, logikaIdx);
  }
  
  if (bankSoalIdx >= 0) {
    parsed.bank_soal = parseBankSoal(sections, bankSoalIdx);
  }

  return parsed;
}

async function importFinancialLiteracy() {
  try {
    console.log('📚 Financial Literacy Import v2 - Starting...\n');
    
    // Step 1: Nuclear cleanup
    await clearCollection();
    
    // Step 2: Get Google clients
    const authClient = await getGoogleDriveClient();
    const drive = google.drive({ version: 'v3', auth: authClient });
    const docs = google.docs({ version: 'v1', auth: authClient });

    // Step 3: List documents
    console.log('📂 Fetching documents from folder...');
    const files = await listDocsInFolder(drive, FOLDER_ID);
    console.log(`Found ${files.length} documents\n`);

    // Step 4: Process each document
    let imported = 0;
    for (const file of files) {
      console.log(`📄 Processing: ${file.name}`);
      
      const doc = await getDocumentContent(docs, file.id);
      const sections = extractSections(doc);
      const parsed = parseCourseModule(sections, file.name);
      
      if (!parsed.week_number) {
        console.log(`⚠️  Skipping (no week number found)\n`);
        continue;
      }

      // Save to Firestore with zero-padded document ID
      const docId = `week_${String(parsed.week_number).padStart(2, '0')}`;
      const docRef = db.collection('financial_literacy').doc(docId);
      await docRef.set({
        ...parsed,
        source_doc_id: file.id,
        imported_at: new Date().toISOString(),
        modified_at: new Date().toISOString()
      });

      console.log(`✅ Imported ${docId} (${parsed.bank_soal.length} quizzes, ${parsed.indikator_kelulusan.length} indikator, ${parsed.logika_feedback.jawaban_benar.length + parsed.logika_feedback.jawaban_salah.length} logika)\n`);
      imported++;
    }

    console.log(`\n🎉 Import complete! ${imported}/${files.length} documents imported`);
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

// Run import
importFinancialLiteracy();
