#!/usr/bin/env node

/**
 * Fetch Documents from Google Drive and Import to Firestore
 * 
 * This script:
 * 1. Fetches all documents from specified Google Drive folders
 * 2. Converts Google Docs to structured JSON
 * 3. Imports to Firestore collections
 * 
 * Prerequisites:
 * - Google Cloud Service Account with Drive API enabled
 * - Service account has access to the Drive folders
 * 
 * Usage:
 *   node scripts/fetch-from-google-drive.js
 */

const { google } = require('googleapis');
const { Firestore } = require('@google-cloud/firestore');
const fs = require('fs');
const path = require('path');

// Initialize services
const db = new Firestore({
  projectId: process.env.GCP_PROJECT_ID || 'stellar-zoo-478021-v8',
});

// Google Drive folder IDs
const BUSINESS_TYPES_FOLDER_ID = '14D6sdUsJevp30p1xNGQVKh_1im_QAKVH';
const FINANCIAL_LITERACY_FOLDER_ID = '1_qBhLNCfdxkLVTro_jJACF6sm_rG9ZBt';

// Initialize Google APIs
let drive, docs;

async function initializeGoogleAPIs() {
  // Use service account credentials
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || './service-account-key.json',
    scopes: [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/documents.readonly',
    ],
  });

  const authClient = await auth.getClient();
  
  drive = google.drive({ version: 'v3', auth: authClient });
  docs = google.docs({ version: 'v1', auth: authClient });
  
  console.log('✅ Google APIs initialized');
}

// ===== FETCH FROM GOOGLE DRIVE =====

async function listFilesInFolder(folderId) {
  console.log(`📂 Fetching files from folder: ${folderId}`);
  
  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.document' and trashed=false`,
      fields: 'files(id, name, mimeType, createdTime, modifiedTime)',
      orderBy: 'name',
    });
    
    const files = response.data.files || [];
    console.log(`   Found ${files.length} documents`);
    return files;
  } catch (error) {
    console.error('❌ Error listing files:', error.message);
    throw error;
  }
}

async function fetchDocumentContent(fileId) {
  try {
    const doc = await docs.documents.get({ documentId: fileId });
    return doc.data;
  } catch (error) {
    console.error(`❌ Error fetching document ${fileId}:`, error.message);
    throw error;
  }
}

// ===== PARSE GOOGLE DOCS CONTENT =====

function extractTextFromDocument(doc) {
  let text = '';
  
  if (!doc.body || !doc.body.content) return text;
  
  for (const element of doc.body.content) {
    if (element.paragraph) {
      for (const textElement of element.paragraph.elements || []) {
        if (textElement.textRun) {
          text += textElement.textRun.content;
        }
      }
    }
  }
  
  return text;
}

function parseBusinessClassification(docName, content) {
  // Extract business type from document name
  // Expected format: "Warung Sembako - Maturity Levels.gdoc"
  const businessType = docName.replace(/\s*-\s*Maturity Levels.*$/i, '').trim();
  // Sanitize ID: remove special characters that Firestore doesn't allow
  const id = businessType
    .toLowerCase()
    .replace(/[()\/\\]/g, '') // Remove parentheses and slashes
    .replace(/\s+/g, '_')      // Replace spaces with underscores
    .replace(/[^a-z0-9_-]/g, '_'); // Replace any other special chars with underscore
  
  // Parse content into structured format
  // This is a simplified parser - adjust based on your actual document structure
  const lines = content.split('\n').filter(line => line.trim());
  
  const classification = {
    id,
    business_type: businessType,
    legal_category: 'Mikro', // Default, can be extracted from content
    description: '',
    levels: [],
    keywords: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  let currentLevel = null;
  let currentSection = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detect level headers (e.g., "Level 1:", "Level 2:")
    const levelMatch = line.match(/^Level\s+(\d+)[:\s]/i);
    if (levelMatch) {
      if (currentLevel) {
        classification.levels.push(currentLevel);
      }
      currentLevel = {
        level: parseInt(levelMatch[1]),
        name: '',
        criteria: [],
        characteristics: [],
        next_steps: [],
        swot: {
          strengths: [],
          weaknesses: [],
          opportunities: [],
          threats: []
        },
        recommended_actions: [],
        estimated_duration: ''
      };
      continue;
    }
    
    // Detect sections
    if (line.match(/^(Kriteria|Criteria)[:\s]/i)) {
      currentSection = 'criteria';
      continue;
    }
    if (line.match(/^(Karakteristik|Characteristics)[:\s]/i)) {
      currentSection = 'characteristics';
      continue;
    }
    if (line.match(/^(Langkah Selanjutnya|Next Steps)[:\s]/i)) {
      currentSection = 'next_steps';
      continue;
    }
    if (line.match(/^(Kekuatan|Strengths)[:\s]/i)) {
      currentSection = 'strengths';
      continue;
    }
    if (line.match(/^(Kelemahan|Weaknesses)[:\s]/i)) {
      currentSection = 'weaknesses';
      continue;
    }
    if (line.match(/^(Peluang|Opportunities)[:\s]/i)) {
      currentSection = 'opportunities';
      continue;
    }
    if (line.match(/^(Ancaman|Threats)[:\s]/i)) {
      currentSection = 'threats';
      continue;
    }
    if (line.match(/^(Rekomendasi|Recommended Actions)[:\s]/i)) {
      currentSection = 'recommended_actions';
      continue;
    }
    
    // Add content to current section
    if (currentLevel && currentSection && line.startsWith('-')) {
      const content = line.replace(/^-\s*/, '').trim();
      if (content) {
        if (currentSection === 'strengths' || currentSection === 'weaknesses' || 
            currentSection === 'opportunities' || currentSection === 'threats') {
          currentLevel.swot[currentSection].push(content);
        } else {
          currentLevel[currentSection].push(content);
        }
      }
    }
  }
  
  // Add last level
  if (currentLevel) {
    classification.levels.push(currentLevel);
  }
  
  // Generate keywords
  classification.keywords = businessType.toLowerCase().split(/\s+/);
  
  return classification;
}

function parseFinancialModule(docName, content) {
  // Extract week number from document name
  // Expected format: "Week 1 - Pengenalan Literasi Keuangan.gdoc"
  const weekMatch = docName.match(/Week\s+(\d+)/i);
  const week = weekMatch ? parseInt(weekMatch[1]) : 1;
  
  const lines = content.split('\n').filter(line => line.trim());
  
  const module = {
    id: `week_${week}`,
    week,
    title: '',
    subtitle: '',
    description: '',
    learning_objectives: [],
    content: {
      introduction: '',
      main_topics: [],
      summary: '',
      key_takeaways: []
    },
    quiz: [],
    passing_score: 70,
    keywords: [],
    difficulty: 'Pemula',
    estimated_time: '30 menit',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  let currentSection = null;
  let currentQuestion = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Extract title (usually first non-empty line)
    if (!module.title && line && !line.match(/^Week\s+\d+/i)) {
      module.title = line;
      continue;
    }
    
    // Detect sections
    if (line.match(/^(Tujuan Pembelajaran|Learning Objectives)[:\s]/i)) {
      currentSection = 'objectives';
      continue;
    }
    if (line.match(/^(Pengantar|Introduction)[:\s]/i)) {
      currentSection = 'introduction';
      continue;
    }
    if (line.match(/^(Ringkasan|Summary)[:\s]/i)) {
      currentSection = 'summary';
      continue;
    }
    if (line.match(/^(Poin Penting|Key Takeaways)[:\s]/i)) {
      currentSection = 'takeaways';
      continue;
    }
    if (line.match(/^(Kuis|Quiz)[:\s]/i)) {
      currentSection = 'quiz';
      continue;
    }
    
    // Detect quiz questions
    const questionMatch = line.match(/^(\d+)\.\s*(.+)/);
    if (currentSection === 'quiz' && questionMatch) {
      if (currentQuestion) {
        module.quiz.push(currentQuestion);
      }
      currentQuestion = {
        id: `q${questionMatch[1]}`,
        question: questionMatch[2],
        options: [],
        correct_answer: '',
        explanation: ''
      };
      continue;
    }
    
    // Parse quiz options
    const optionMatch = line.match(/^([A-D])\.\s*(.+)/);
    if (currentQuestion && optionMatch) {
      currentQuestion.options.push(`${optionMatch[1]}. ${optionMatch[2]}`);
      continue;
    }
    
    // Parse correct answer
    const answerMatch = line.match(/^(Jawaban|Answer)[:\s]*([A-D])/i);
    if (currentQuestion && answerMatch) {
      currentQuestion.correct_answer = answerMatch[2];
      continue;
    }
    
    // Parse explanation
    if (currentQuestion && line.match(/^(Penjelasan|Explanation)[:\s]/i)) {
      const explanation = lines[i + 1]?.trim();
      if (explanation) {
        currentQuestion.explanation = explanation;
      }
      continue;
    }
    
    // Add content to sections
    if (line.startsWith('-')) {
      const content = line.replace(/^-\s*/, '').trim();
      if (content) {
        if (currentSection === 'objectives') {
          module.learning_objectives.push(content);
        } else if (currentSection === 'takeaways') {
          module.content.key_takeaways.push(content);
        }
      }
    } else if (currentSection === 'introduction' && line) {
      module.content.introduction += line + ' ';
    } else if (currentSection === 'summary' && line) {
      module.content.summary += line + ' ';
    }
  }
  
  // Add last question
  if (currentQuestion) {
    module.quiz.push(currentQuestion);
  }
  
  // Generate keywords
  module.keywords = module.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  
  return module;
}

// ===== IMPORT TO FIRESTORE =====

async function importBusinessClassifications() {
  console.log('\n📊 Processing Business Classifications...');
  
  const files = await listFilesInFolder(BUSINESS_TYPES_FOLDER_ID);
  let imported = 0;
  
  for (const file of files) {
    try {
      console.log(`\n   Processing: ${file.name}`);
      
      const docContent = await fetchDocumentContent(file.id);
      const text = extractTextFromDocument(docContent);
      
      const classification = parseBusinessClassification(file.name, text);
      
      await db.collection('business_classifications')
        .doc(classification.id)
        .set(classification);
      
      console.log(`   ✅ Imported: ${classification.business_type} (${classification.levels.length} levels)`);
      imported++;
    } catch (error) {
      console.error(`   ❌ Failed to import ${file.name}:`, error.message);
    }
  }
  
  console.log(`\n✅ Imported ${imported}/${files.length} business classifications`);
  return imported;
}

async function importFinancialModules() {
  console.log('\n📚 Processing Financial Literacy Modules...');
  
  const files = await listFilesInFolder(FINANCIAL_LITERACY_FOLDER_ID);
  let imported = 0;
  
  for (const file of files) {
    try {
      console.log(`\n   Processing: ${file.name}`);
      
      const docContent = await fetchDocumentContent(file.id);
      const text = extractTextFromDocument(docContent);
      
      const module = parseFinancialModule(file.name, text);
      
      await db.collection('financial_literacy_modules')
        .doc(module.id)
        .set(module);
      
      console.log(`   ✅ Imported: Week ${module.week} - ${module.title} (${module.quiz.length} questions)`);
      imported++;
    } catch (error) {
      console.error(`   ❌ Failed to import ${file.name}:`, error.message);
    }
  }
  
  console.log(`\n✅ Imported ${imported}/${files.length} financial modules`);
  return imported;
}

// ===== MAIN EXECUTION =====

async function main() {
  try {
    console.log('🚀 Starting Google Drive to Firestore Import...\n');
    
    // Initialize Google APIs
    await initializeGoogleAPIs();
    
    // Import data
    const businessCount = await importBusinessClassifications();
    const moduleCount = await importFinancialModules();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Import Complete!');
    console.log('='.repeat(60));
    console.log(`📊 Business Classifications: ${businessCount}`);
    console.log(`📚 Financial Modules: ${moduleCount}`);
    console.log('='.repeat(60));
    
    // Verify in Firestore
    console.log('\n🔍 Verifying Firestore data...');
    const businessSnapshot = await db.collection('business_classifications').get();
    const moduleSnapshot = await db.collection('financial_literacy_modules').get();
    
    console.log(`   - business_classifications: ${businessSnapshot.size} documents`);
    console.log(`   - financial_literacy_modules: ${moduleSnapshot.size} documents`);
    
    console.log('\n✅ All done!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  initializeGoogleAPIs,
  listFilesInFolder,
  fetchDocumentContent,
  parseBusinessClassification,
  parseFinancialModule,
  importBusinessClassifications,
  importFinancialModules
};
