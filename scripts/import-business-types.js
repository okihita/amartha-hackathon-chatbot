#!/usr/bin/env node

/**
 * Import business types from Google Drive folder
 * Parses complex Google Docs with maturity levels, SWOT, and leveling guides
 * 
 * Uses public Google Drive API (no authentication required for public folders)
 * 
 * Expected folder structure:
 * - 1 doc: UMKM definition
 * - 1 doc: Summary of 25 business types
 * - 25 docs: Individual business type specifications
 */

require('dotenv').config();

const { google } = require('googleapis');
const { Firestore } = require('@google-cloud/firestore');

const db = new Firestore({
  projectId: process.env.GCP_PROJECT_ID,
});

// Google Drive folder ID from environment
const FOLDER_ID = process.env.BUSINESS_TYPES_FOLDER_ID || '14D6sdUsJevp30p1xNGQVKh_1im_QAKVH';

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
  console.log('  2. Set GOOGLE_API_KEY environment variable with Drive API enabled');
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
  let currentSection = { text: '', style: 'normal' };

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

function parseBusinessTypeDoc(sections, fileName) {
  // Parse structured business type document
  const parsed = {
    business_type: fileName.replace(/^KATEGORI \d+ - /, '').trim(),
    category_number: null,
    business_character: '', // Distinctive Factor + Karakter Utama
    maturity_levels: []
  };

  // Extract category number
  const categoryMatch = fileName.match(/KATEGORI (\d+)/);
  if (categoryMatch) {
    parsed.category_number = parseInt(categoryMatch[1]);
  }

  let currentLevel = null;
  let currentSection = null;
  let currentSubSection = null;
  let inBusinessCharacter = false;
  let businessCharParts = [];

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    
    if (section.type === 'table') {
      // Process SWOT table if we're in a level
      if (currentLevel && section.data.length >= 5) {
        // SWOT table structure: Header row + 4 rows (S, W, O, T)
        // Columns: [SWOT Component, Description, How to Handle]
        const rows = section.data;
        
        // Skip header row, process data rows
        for (let rowIdx = 1; rowIdx < rows.length && rowIdx <= 4; rowIdx++) {
          const row = rows[rowIdx];
          if (row.length >= 3) {
            const component = row[0].toLowerCase().trim();
            const description = row[1].trim();
            const action = row[2].trim();
            
            // Map to SWOT component
            if (component.startsWith('s') || component.includes('strength') || component.includes('kekuatan')) {
              if (description) currentLevel.swot.strengths.push(description);
              if (action) currentLevel.swot_actions.strength_actions.push(action);
            } else if (component.startsWith('w') || component.includes('weakness') || component.includes('kelemahan')) {
              if (description) currentLevel.swot.weaknesses.push(description);
              if (action) currentLevel.swot_actions.weakness_actions.push(action);
            } else if (component.startsWith('o') || component.includes('opportunit') || component.includes('peluang')) {
              if (description) currentLevel.swot.opportunities.push(description);
              if (action) currentLevel.swot_actions.opportunity_actions.push(action);
            } else if (component.startsWith('t') || component.includes('threat') || component.includes('ancaman')) {
              if (description) currentLevel.swot.threats.push(description);
              if (action) currentLevel.swot_actions.threat_actions.push(action);
            }
          }
        }
      }
      continue;
    }

    const text = section.text;
    const lower = text.toLowerCase();
    const trimmed = text.trim();

    // Extract Distinctive Factor and Karakter Utama (business character)
    // Track which section we're in to add proper separator
    if (lower.includes('distinctive factor:')) {
      inBusinessCharacter = true;
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex > -1 && colonIndex < trimmed.length - 1) {
        const content = trimmed.substring(colonIndex + 1).trim();
        if (content) {
          businessCharParts.push({ type: 'distinctive', text: content });
        }
      }
      continue;
    }
    
    if (lower.includes('karakter utama:')) {
      inBusinessCharacter = true;
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex > -1 && colonIndex < trimmed.length - 1) {
        const content = trimmed.substring(colonIndex + 1).trim();
        if (content) {
          businessCharParts.push({ type: 'karakter', text: content });
        }
      }
      continue;
    }
    
    if (inBusinessCharacter && !lower.match(/^level [1-5]/i)) {
      // Skip if it's just the header text itself
      if (!lower.match(/^(distinctive factor|karakter utama)\s*$/)) {
        // Add to the last part if exists
        if (businessCharParts.length > 0) {
          businessCharParts[businessCharParts.length - 1].text += ' ' + trimmed;
        }
      }
    }

    // Detect maturity levels (LEVEL 1, LEVEL 2, etc.)
    const levelMatch = trimmed.match(/^LEVEL ([1-5]):/i);
    if (levelMatch) {
      // Save previous level
      if (currentLevel) {
        parsed.maturity_levels.push(currentLevel);
      }
      
      inBusinessCharacter = false;
      if (businessCharParts.length > 0 && !parsed.business_character) {
        // Find distinctive factor and karakter utama
        const distinctive = businessCharParts.find(p => p.type === 'distinctive');
        const karakter = businessCharParts.find(p => p.type === 'karakter');
        
        if (distinctive && karakter) {
          // Format: Distinctive Factor. Karakter Utama
          let distinctiveText = distinctive.text.trim();
          if (!distinctiveText.endsWith('.')) {
            distinctiveText += '.';
          }
          parsed.business_character = distinctiveText + ' ' + karakter.text.trim();
        } else if (distinctive) {
          parsed.business_character = distinctive.text.trim();
        } else if (karakter) {
          parsed.business_character = karakter.text.trim();
        }
      }
      
      currentLevel = {
        level: parseInt(levelMatch[1]),
        name: trimmed,
        goal: '', // Tujuan - goal to reach next level
        character: [], // Character of this level (array of bullet points)
        swot: {
          strengths: [],
          weaknesses: [],
          opportunities: [],
          threats: []
        },
        swot_actions: {
          strength_actions: [],
          weakness_actions: [],
          opportunity_actions: [],
          threat_actions: []
        },
        roadmap: {
          description: '',
          kpis: [] // KPIs that start with [ ]
        }
      };
      currentSection = null;
      currentSubSection = null;
      continue;
    }

    if (!currentLevel) continue;

    // Detect "Tujuan" section for goal
    if (lower.includes('tujuan:')) {
      currentSection = 'goal';
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex > -1 && colonIndex < trimmed.length - 1) {
        const goalText = trimmed.substring(colonIndex + 1).trim();
        if (goalText && currentLevel) {
          currentLevel.goal = goalText;
        }
      }
      continue;
    }
    
    // Stop capturing goal when we hit section markers (A., B., C., etc.)
    if (currentSection === 'goal' && trimmed.match(/^[A-Z]\./)) {
      currentSection = null;
      continue;
    }
    
    // Detect "Potret Diagnostik" section for character
    if (lower.includes('potret diagnostik')) {
      currentSection = 'character';
      currentSubSection = null;
      continue;
    }

    // Detect SWOT section start - this ends the character section
    if (lower.includes('swot analysis') || lower.includes('analisis swot')) {
      currentSection = null;
      continue;
    }

    // Detect SWOT sections - be more flexible with patterns
    if (lower.includes('💪') || lower.match(/^s[\s:=]/i) || lower.match(/strength/i) || 
        (lower.match(/kekuatan/i) && !lower.includes('cara') && !lower.includes('mengatasi'))) {
      currentSection = 'swot';
      currentSubSection = 'strengths';
      continue;
    }
    if (lower.includes('⚠️') || lower.match(/^w[\s:=]/i) || lower.match(/weakness/i) || 
        (lower.match(/kelemahan/i) && !lower.includes('cara') && !lower.includes('mengatasi'))) {
      currentSection = 'swot';
      currentSubSection = 'weaknesses';
      continue;
    }
    if (lower.includes('🎯') || lower.match(/^o[\s:=]/i) || lower.match(/opportunit/i) || 
        (lower.match(/peluang/i) && !lower.includes('cara') && !lower.includes('mengatasi') && !lower.includes('memanfaatkan'))) {
      currentSection = 'swot';
      currentSubSection = 'opportunities';
      continue;
    }
    if (lower.includes('⚡') || lower.match(/^t[\s:=]/i) || lower.match(/threat/i) || 
        (lower.match(/ancaman/i) && !lower.includes('cara') && !lower.includes('mengatasi') && !lower.includes('menghadapi'))) {
      currentSection = 'swot';
      currentSubSection = 'threats';
      continue;
    }

    // Detect "Cara Mengatasi" (How to handle SWOT)
    if (lower.includes('cara mengatasi') || lower.includes('cara memanfaatkan') || lower.includes('cara menghadapi')) {
      if (lower.includes('kekuatan')) {
        currentSection = 'swot_actions';
        currentSubSection = 'strength_actions';
      } else if (lower.includes('kelemahan')) {
        currentSection = 'swot_actions';
        currentSubSection = 'weakness_actions';
      } else if (lower.includes('peluang')) {
        currentSection = 'swot_actions';
        currentSubSection = 'opportunity_actions';
      } else if (lower.includes('ancaman')) {
        currentSection = 'swot_actions';
        currentSubSection = 'threat_actions';
      }
      continue;
    }

    // Detect Roadmap section
    if (lower.includes('roadmap') || lower.includes('cara naik') || lower.includes('langkah') || lower.includes('path to')) {
      currentSection = 'roadmap';
      currentSubSection = null;
      continue;
    }

    // Add content to appropriate section
    if (currentSection === 'goal') {
      // Continue capturing goal text if it spans multiple lines
      // Stop at section markers (A., B., C.) or bullet points
      if (trimmed && 
          !lower.includes('potret diagnostik') && 
          !lower.includes('swot') &&
          !trimmed.match(/^[A-Z]\./) &&
          !trimmed.startsWith('[ ]') &&
          !lower.includes('kpi:')) {
        if (currentLevel.goal) {
          currentLevel.goal += ' ' + trimmed;
        } else {
          currentLevel.goal = trimmed;
        }
      }
    } else if (currentSection === 'character') {
      // Flatten bullet points - capture all bullets regardless of nesting level
      // Skip section headers like "Fisik:", "Keuangan & Metrik Kuantitatif:", "Stok:", "Pasar:"
      if (trimmed && 
          !lower.includes('potret diagnostik') &&
          !trimmed.match(/^(fisik|keuangan|metrik|stok|pasar)[\s:&]/i) &&
          !trimmed.match(/^(fisik|keuangan|metrik|stok|pasar)\s*$/i)) {
        // Remove bullet markers and clean up text
        let cleanedText = trimmed.replace(/^[•\-\*]\s*/, '').trim();
        
        // Replace commas that should be spaces (when followed by capital letter or number)
        cleanedText = cleanedText.replace(/,(\s*)([A-Z0-9])/g, '. $2');
        
        if (cleanedText) {
          currentLevel.character.push(cleanedText);
        }
      }
    } else if (currentSection === 'swot' && currentSubSection) {
      // Skip header lines and empty lines
      if (trimmed && 
          !trimmed.match(/^[SWOT][\s:=]/i) && 
          !trimmed.match(/^(strength|weakness|opportunit|threat)/i) &&
          !trimmed.match(/^(kekuatan|kelemahan|peluang|ancaman)[\s:]/i) &&
          !trimmed.match(/^💪|^⚠️|^🎯|^⚡/)) {
        currentLevel.swot[currentSubSection].push(trimmed);
      }
    } else if (currentSection === 'swot_actions' && currentSubSection) {
      if (trimmed && 
          !lower.includes('cara mengatasi') && 
          !lower.includes('cara memanfaatkan') &&
          !lower.includes('cara menghadapi')) {
        currentLevel.swot_actions[currentSubSection].push(trimmed);
      }
    } else if (currentSection === 'roadmap') {
      // Check if it's a KPI (starts with [ ] or contains "KPI:")
      if (trimmed.startsWith('[ ]') || trimmed.startsWith('[]') || lower.includes('kpi:')) {
        const kpiText = trimmed.replace(/^\[\s*\]\s*/, '').replace(/^KPI:\s*/i, '').trim();
        if (kpiText) {
          currentLevel.roadmap.kpis.push(kpiText);
        }
      } else if (trimmed && 
                 !lower.includes('roadmap') && 
                 !lower.includes('cara naik') &&
                 !lower.match(/^[a-z]\./i)) { // Skip section markers like "A.", "B."
        if (!currentLevel.roadmap.description) {
          currentLevel.roadmap.description = trimmed;
        } else {
          currentLevel.roadmap.description += ' ' + trimmed;
        }
      }
    }
  }

  // Add last level
  if (currentLevel) {
    parsed.maturity_levels.push(currentLevel);
  }

  // Finalize business character if not set
  if (!parsed.business_character && businessCharParts.length > 0) {
    // Find distinctive factor and karakter utama
    const distinctive = businessCharParts.find(p => p.type === 'distinctive');
    const karakter = businessCharParts.find(p => p.type === 'karakter');
    
    if (distinctive && karakter) {
      // Format: Distinctive Factor. Karakter Utama
      let distinctiveText = distinctive.text.trim();
      if (!distinctiveText.endsWith('.')) {
        distinctiveText += '.';
      }
      parsed.business_character = distinctiveText + ' ' + karakter.text.trim();
    } else if (distinctive) {
      parsed.business_character = distinctive.text.trim();
    } else if (karakter) {
      parsed.business_character = karakter.text.trim();
    }
    
    // Ensure it ends with a period
    if (parsed.business_character && !parsed.business_character.endsWith('.')) {
      parsed.business_character += '.';
    }
  }

  return parsed;
}

function isMetaDocument(fileName) {
  const lower = fileName.toLowerCase();
  return lower.includes('definisi umkm') || 
         lower.includes('rangkuman') || 
         lower.includes('summary') ||
         lower.includes('matriks');
}

async function importBusinessTypes() {
  console.log('🚀 Starting business types import from Google Drive\n');
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
    let metaDocs = 0;
    const batch = db.batch();

    for (const file of files) {
      console.log(`📄 Processing: ${file.name}`);
      
      try {
        const sections = await getDocumentContent(docs, file.id);
        
        if (!sections || sections.length === 0) {
          console.log(`   ⚠️  Skipped (empty document)\n`);
          continue;
        }

        // Check if this is a meta document (definition or summary)
        if (isMetaDocument(file.name)) {
          console.log(`   📋 Meta document - storing as reference\n`);
          
          // Convert sections to plain text to avoid nested entity issues
          const plainText = sections
            .filter(s => s.text)
            .map(s => s.text)
            .join('\n\n');
          
          const docRef = db.collection('business_meta').doc();
          batch.set(docRef, {
            title: file.name,
            content: plainText,
            section_count: sections.length,
            source_doc_id: file.id,
            created_at: file.createdTime,
            modified_at: file.modifiedTime,
            imported_at: new Date().toISOString(),
          });
          metaDocs++;
          continue;
        }

        // Parse business type document
        const parsed = parseBusinessTypeDoc(sections, file.name);
        
        console.log(`   📊 Parsed: ${parsed.maturity_levels.length} maturity levels`);
        
        // Store in Firestore
        const docRef = db.collection('business_classifications').doc();
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

    if (imported > 0 || metaDocs > 0) {
      await batch.commit();
      console.log(`\n✅ Successfully imported:`);
      console.log(`   📚 ${imported} business type(s)`);
      console.log(`   📋 ${metaDocs} meta document(s)`);
    } else {
      console.log('\n⚠️  No documents were imported');
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
importBusinessTypes()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
