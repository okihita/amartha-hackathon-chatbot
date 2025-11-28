/**
 * Import Service - Reimport financial literacy from Google Drive
 * Preserves week_XX document IDs to protect user progress
 */

const { google } = require('googleapis');
const db = require('../config/database');

const FOLDER_ID = process.env.FINANCIAL_LITERACY_FOLDER_ID || '1_qBhLNCfdxkLVTro_jJACF6sm_rG9ZBt';
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

async function clearCollection() {
  const snapshot = await db.collection('financial_literacy').get();
  const batch = db.batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  return snapshot.size;
}

async function getGoogleDriveClient() {
  const fs = require('fs');
  if (fs.existsSync('./service-account-key.json')) {
    const auth = new google.auth.GoogleAuth({
      keyFile: './service-account-key.json',
      scopes: ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/documents.readonly'],
    });
    return await auth.getClient();
  }
  if (GOOGLE_API_KEY) return GOOGLE_API_KEY;
  throw new Error('No authentication method available');
}

function extractSections(doc) {
  const sections = [];
  for (const element of doc.body.content || []) {
    if (element.paragraph) {
      let text = '';
      let style = element.paragraph.paragraphStyle?.namedStyleType || 'NORMAL_TEXT';
      for (const textElement of element.paragraph.elements || []) {
        if (textElement.textRun) text += textElement.textRun.content;
      }
      if (text.trim()) sections.push({ text: text.trim(), style, isHeading: style.includes('HEADING') });
    }
  }
  return sections;
}

function parseBankSoal(sections, startIdx) {
  const quizzes = [];
  let currentQuiz = null;
  
  for (let i = startIdx; i < sections.length; i++) {
    const text = sections[i].text;
    const lower = text.toLowerCase();
    if (lower.includes('indikator kelulusan') || lower.includes('logika feedback')) break;
    
    const questionMatch = text.match(/^(\d+)\.\s*(.+)/);
    if (questionMatch) {
      if (currentQuiz) quizzes.push(currentQuiz);
      currentQuiz = { question: questionMatch[2].trim(), options: [], correct: null, explanation: '' };
      continue;
    }
    
    if (currentQuiz) {
      const optionMatch = text.match(/^([a-d])\)\s*(.+)/i);
      if (optionMatch) {
        const optText = optionMatch[2].trim();
        const isCorrect = optText.includes('(BENAR)') || optText.includes('(benar)') || optText.includes('✓');
        const cleanText = optText.replace(/\s*\(BENAR\)\s*/gi, '').replace(/\s*✓\s*/g, '').trim();
        if (isCorrect) currentQuiz.correct = currentQuiz.options.length;
        currentQuiz.options.push(cleanText);
      }
      
      const explainMatch = text.match(/penjelasan[:\s]*(.+)/i);
      if (explainMatch) currentQuiz.explanation = explainMatch[1].trim();
    }
  }
  if (currentQuiz && currentQuiz.options.length > 0) quizzes.push(currentQuiz);
  return quizzes;
}

function parseIndikatorKelulusan(sections, startIdx) {
  const indikator = [];
  let inSection = false;
  
  for (let i = startIdx; i < sections.length; i++) {
    const text = sections[i].text;
    const lower = text.toLowerCase();
    if (lower.match(/indikator kelulusan/i)) { inSection = true; continue; }
    if (inSection && (lower.includes('bank soal') || lower.includes('logika feedback'))) break;
    if (!inSection) continue;
    
    const cleaned = text.replace(/^[\d]+\.\s*/, '').replace(/^[-•]\s*/, '').trim();
    if (cleaned && cleaned.length > 10) indikator.push(cleaned);
  }
  return indikator;
}

function parseCourseModule(sections, fileName) {
  const parsed = { week_number: null, module_number: null, module_name: '', bank_soal: [], indikator_kelulusan: [] };
  
  const weekMatch = fileName.match(/minggu[_\s]*(\d+)/i) || fileName.match(/week[_\s]*(\d+)/i);
  if (weekMatch) parsed.week_number = parseInt(weekMatch[1]);
  
  const moduleMatch = fileName.match(/modul[_\s]*(\d+)/i);
  if (moduleMatch) parsed.module_number = parseInt(moduleMatch[1]);
  
  for (const section of sections) {
    if (section.isHeading && section.text.match(/minggu\s*\d+/i)) {
      parsed.module_name = section.text.trim();
      const wm = section.text.match(/minggu\s*(\d+)/i);
      if (wm && !parsed.week_number) parsed.week_number = parseInt(wm[1]);
      break;
    }
  }
  
  let bankSoalIdx = -1, indikatorIdx = -1;
  sections.forEach((s, i) => {
    const lower = s.text.toLowerCase();
    if (lower.includes('bank soal') && bankSoalIdx < 0) bankSoalIdx = i;
    if (lower.includes('indikator kelulusan') && indikatorIdx < 0) indikatorIdx = i;
  });
  
  if (bankSoalIdx >= 0) parsed.bank_soal = parseBankSoal(sections, bankSoalIdx);
  if (indikatorIdx >= 0) parsed.indikator_kelulusan = parseIndikatorKelulusan(sections, indikatorIdx);
  
  return parsed;
}

async function reimportFinancialLiteracy() {
  const deleted = await clearCollection();
  const authClient = await getGoogleDriveClient();
  const drive = google.drive({ version: 'v3', auth: authClient });
  const docs = google.docs({ version: 'v1', auth: authClient });
  
  const response = await drive.files.list({
    q: `'${FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.document'`,
    fields: 'files(id, name)',
  });
  const files = response.data.files;
  
  let imported = 0;
  for (const file of files) {
    const doc = await docs.documents.get({ documentId: file.id });
    const sections = extractSections(doc.data);
    const parsed = parseCourseModule(sections, file.name);
    
    if (!parsed.week_number) continue;
    
    // CRITICAL: Use consistent week_XX ID to preserve user progress references
    const docId = `week_${String(parsed.week_number).padStart(2, '0')}`;
    await db.collection('financial_literacy').doc(docId).set({
      ...parsed,
      source_doc_id: file.id,
      imported_at: new Date().toISOString()
    });
    imported++;
  }
  
  return { success: true, deleted, imported, total: files.length };
}

module.exports = { reimportFinancialLiteracy };
