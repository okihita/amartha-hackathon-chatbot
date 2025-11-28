#!/usr/bin/env node

/**
 * Import financial literacy course from Google Drive folder
 * Parses course modules, lessons, and content structure
 * 
 * Uses public Google Drive API (no authentication required for public folders)
 * 
 * Expected folder structure:
 * - Multiple docs: Course modules with lessons and content
 * - Each doc represents a module or topic
 */

require('dotenv').config();

const { google } = require('googleapis');
const { Firestore } = require('@google-cloud/firestore');

const db = new Firestore({
  projectId: process.env.GCP_PROJECT_ID || 'stellar-zoo-478021-v8',
});

// Google Drive folder ID from environment
const FOLDER_ID = process.env.FINANCIAL_LITERACY_FOLDER_ID || '1_qBhLNCfdxkLVTro_jJACF6sm_rG9ZBt';

// Google API Key for public access (optional - will try service account if not available)
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

async function getGoogleDriveClient() {
  // Try service account first (if available)
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
  
  // Fallback to API key for public folders
  if (GOOGLE_API_KEY) {
    console.log('🔓 Using API key for public folder access\n');
    return GOOGLE_API_KEY;
  }
  
  console.error('❌ Error: No authentication method available');
  console.log('\nPlease either:');
  console.log('  1. Add service-account-key.json to project root, OR');
  console.log('  2. Set GOOGLE_API_KEY environment variable');
  process.exit(1);
}

async function listDocsInFolder(drive, folderId) {
  console.log(`📂 Listing documents in folder: ${folderId}\n`);
  
  const response = await drive.files.list({
    q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.document' and trashed=false`,
    fields: 'files(id, name, createdTime, modifiedTime)',
    orderBy: 'name',
  });

  return response.data.files || [];
}

async function getDocumentContent(docs, docId) {
  const response = await docs.documents.get({
    documentId: docId,
  });

  const doc = response.data;
  const sections = [];

  // Extract structured content with formatting
  if (doc.body && doc.body.content) {
    for (const element of doc.body.content) {
      if (element.paragraph) {
        let paragraphText = '';
        let paragraphStyle = element.paragraph.paragraphStyle?.namedStyleType || 'NORMAL_TEXT';
        
        for (const textElement of element.paragraph.elements || []) {
          if (textElement.textRun) {
            paragraphText += textElement.textRun.content;
          }
        }

        if (paragraphText.trim()) {
          sections.push({
            text: paragraphText.trim(),
            style: paragraphStyle,
            isBold: element.paragraph.elements?.[0]?.textRun?.textStyle?.bold || false,
            isHeading: paragraphStyle.includes('HEADING')
          });
        }
      } else if (element.table) {
        // Extract table data
        const tableData = [];
        for (const row of element.table.tableRows || []) {
          const rowData = [];
          for (const cell of row.tableCells || []) {
            let cellText = '';
            for (const cellElement of cell.content || []) {
              if (cellElement.paragraph) {
                for (const textElement of cellElement.paragraph.elements || []) {
                  if (textElement.textRun) {
                    cellText += textElement.textRun.content;
                  }
                }
              }
            }
            rowData.push(cellText.trim());
          }
          if (rowData.some(cell => cell)) {
            tableData.push(rowData);
          }
        }
        if (tableData.length > 0) {
          sections.push({
            type: 'table',
            data: tableData
          });
        }
      }
    }
  }

  return sections;
}

function parseCourseModule(sections, fileName) {
  // Parse financial literacy course module
  const parsed = {
    module_name: fileName.trim(),
    week_number: null,
    module_number: null,
    description: '',
    materi_penyampaian: [],
    bank_soal: [],
    logika_feedback: [],
    indikator_kelulusan: [],
    quizzes: []
  };

  // Extract week number (primary key) - e.g., "Minggu 1", "Week 1"
  const weekMatch = fileName.match(/(?:minggu|week)\s*(\d+)/i);
  if (weekMatch) {
    parsed.week_number = parseInt(weekMatch[1]);
  }

  // Extract module number (metadata only) - e.g., "Modul 1:", "Module 1:"
  const moduleMatch = fileName.match(/(?:modul|module)\s*(\d+)/i);
  if (moduleMatch) {
    parsed.module_number = parseInt(moduleMatch[1]);
  }

  let currentSection = null;
  let descriptionLines = [];
  let currentQuiz = null;
  let quizOptions = [];

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    
    if (section.type === 'table') {
      continue; // Skip tables for now
    }

    const text = section.text;
    const lower = text.toLowerCase();
    const trimmed = text.trim();

    // Skip empty lines
    if (!trimmed) continue;

    // Detect module description (first few paragraphs before sections)
    if (!parsed.description && !section.isHeading && i < 5 && !currentSection) {
      descriptionLines.push(trimmed);
      continue;
    }

    // Detect main sections
    if (lower.includes('materi penyampaian') || lower.includes('materi inti')) {
      currentSection = 'materi_penyampaian';
      continue;
    }
    if (lower.includes('bank soal')) {
      currentSection = 'bank_soal';
      // Save current quiz if exists
      if (currentQuiz && quizOptions.length >= 2) {
        parsed.quizzes.push({
          question: currentQuiz,
          options: quizOptions.slice(0, 2),
          correct: quizOptions.findIndex(opt => opt.isCorrect),
          explanation: quizOptions[2] || ''
        });
      }
      currentQuiz = null;
      quizOptions = [];
      continue;
    }
    if (lower.includes('logika feedback')) {
      currentSection = 'logika_feedback';
      // Save current quiz if exists
      if (currentQuiz && quizOptions.length >= 2) {
        parsed.quizzes.push({
          question: currentQuiz,
          options: quizOptions.slice(0, 2),
          correct: quizOptions.findIndex(opt => opt.isCorrect),
          explanation: quizOptions[2] || ''
        });
      }
      currentQuiz = null;
      quizOptions = [];
      continue;
    }
    if (lower.includes('indikator kelulusan')) {
      currentSection = 'indikator_kelulusan';
      continue;
    }

    // Parse content based on current section
    if (currentSection === 'materi_penyampaian') {
      parsed.materi_penyampaian.push(trimmed);
    } else if (currentSection === 'bank_soal') {
      // Detect quiz questions (numbered items like "1.", "2.", etc.)
      const questionMatch = trimmed.match(/^(\d+)\.\s*(.+)/);
      if (questionMatch) {
        // Save previous quiz
        if (currentQuiz && quizOptions.length >= 2) {
          parsed.quizzes.push({
            question: currentQuiz,
            options: quizOptions.slice(0, 2).map(opt => opt.text),
            correct: quizOptions.findIndex(opt => opt.isCorrect),
            explanation: quizOptions[2] || ''
          });
        }
        // Start new quiz
        currentQuiz = questionMatch[2].trim();
        quizOptions = [];
      } else if (currentQuiz) {
        // Parse options (A., B., etc.) and check for ✅
        const optionMatch = trimmed.match(/^([A-D])\.\s*(.+)/);
        if (optionMatch) {
          const optionText = optionMatch[2].trim();
          const isCorrect = optionText.includes('✅') || optionText.includes('✓');
          quizOptions.push({
            text: optionText.replace(/✅|✓/g, '').trim(),
            isCorrect: isCorrect
          });
        } else if (lower.includes('pembahasan:') || lower.includes('explanation:')) {
          // This is the explanation (3rd bullet)
          quizOptions.push(trimmed.replace(/pembahasan:/i, '').replace(/explanation:/i, '').trim());
        }
      }
      parsed.bank_soal.push(trimmed);
    } else if (currentSection === 'logika_feedback') {
      parsed.logika_feedback.push(trimmed);
    } else if (currentSection === 'indikator_kelulusan') {
      parsed.indikator_kelulusan.push(trimmed);
    }
  }

  // Save last quiz
  if (currentQuiz && quizOptions.length >= 2) {
    parsed.quizzes.push({
      question: currentQuiz,
      options: quizOptions.slice(0, 2).map(opt => typeof opt === 'string' ? opt : opt.text),
      correct: quizOptions.findIndex(opt => typeof opt === 'object' && opt.isCorrect),
      explanation: quizOptions[2] || ''
    });
  }

  // Finalize description if not set
  if (!parsed.description && descriptionLines.length > 0) {
    parsed.description = descriptionLines.join(' ');
  }

  return parsed;
}

async function importFinancialLiteracy() {
  console.log('🚀 Starting financial literacy course import from Google Drive\n');
  console.log(`📂 Folder ID: ${FOLDER_ID}\n`);
  
  try {
    const authClient = await getGoogleDriveClient();
    const drive = google.drive({ version: 'v3', auth: authClient });
    const docs = google.docs({ version: 'v1', auth: authClient });

    // List all documents in folder
    const files = await listDocsInFolder(drive, FOLDER_ID);

    if (files.length === 0) {
      console.log('⚠️  No documents found in folder');
      return;
    }

    console.log(`📊 Found ${files.length} document(s)\n`);

    let imported = 0;
    const batch = db.batch();

    for (const file of files) {
      console.log(`📄 Processing: ${file.name}`);
      
      try {
        const sections = await getDocumentContent(docs, file.id);
        
        if (!sections || sections.length === 0) {
          console.log(`   ⚠️  Skipped (empty document)\n`);
          continue;
        }

        // Parse course module
        const parsed = parseCourseModule(sections, file.name);
        
        console.log(`   📚 Week ${parsed.week_number || '?'}`);
        console.log(`   📝 Quizzes: ${parsed.quizzes.length}`);
        
        // Store in Firestore
        const docRef = db.collection('financial_literacy').doc();
        batch.set(docRef, {
          ...parsed,
          source_doc_id: file.id,
          created_at: file.createdTime,
          modified_at: file.modifiedTime,
          imported_at: new Date().toISOString(),
        });

        console.log(`   ✅ Queued for import\n`);
        imported++;
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
      }
    }

    if (imported > 0) {
      await batch.commit();
      console.log(`\n✅ Successfully imported ${imported} module(s)`);
    } else {
      console.log('\n⚠️  No modules were imported');
    }

    console.log('🎉 Import complete!\n');
    
  } catch (error) {
    console.error('❌ Error during import:', error.message);
    
    if (error.message.includes('permission') || error.message.includes('403')) {
      console.log('\n💡 Make sure:');
      console.log('   1. The Google Drive folder is set to "Anyone with the link can view"');
      console.log('   2. The GEMINI_API_KEY environment variable is set');
      console.log('   3. The API key has Google Drive API enabled');
    }
    
    process.exit(1);
  }
}

// Run the import
importFinancialLiteracy()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
