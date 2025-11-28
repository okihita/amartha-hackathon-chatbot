# Business Types Import Guide

## Overview

This system imports business type classifications from Google Drive, parsing complex documents with maturity levels, SWOT analysis, and leveling guides.

## Folder Structure

Expected Google Drive folder structure:
- **1 doc**: UMKM definition (stored in `business_meta` collection)
- **1 doc**: Summary/matrix of 25 business types (stored in `business_meta` collection)
- **25 docs**: Individual business type specifications (stored in `business_classifications` collection)

## Document Format

Each business type document should contain:

### 1. Header
- Category number (e.g., "KATEGORI 1")
- Business type name (e.g., "WARUNG SEMBAKO & KELONTONG")

### 2. Description
- Overview of the business type
- Key characteristics

### 3. Maturity Levels (Level 1-5)
Each level contains:
- **Level name/title**
- **Description**: Overview of this maturity stage
- **Characteristics**: Key traits of businesses at this level
- **Criteria**: Requirements to be at this level
- **SWOT Analysis**:
  - Strengths (Kekuatan)
  - Weaknesses (Kelemahan)
  - Opportunities (Peluang)
  - Threats (Ancaman)
- **Next Steps**: How to level up to the next stage

## Import Process

### 1. Setup Service Account Access

Share the Google Drive folder with your service account email (found in `service-account-key.json`):
```json
{
  "client_email": "your-service-account@project.iam.gserviceaccount.com"
}
```

Give the service account **Viewer** permission on the folder.

### 2. Run Import Script

```bash
# Using environment variable
export GOOGLE_DRIVE_FOLDER_ID="14D6sdUsJevp30p1xNGQVKh_1im_QAKVH"
node scripts/import-business-types.js

# Or inline
GOOGLE_DRIVE_FOLDER_ID="14D6sdUsJevp30p1xNGQVKh_1im_QAKVH" node scripts/import-business-types.js
```

### 3. Verify Import

Check the dashboard at:
```
https://your-app.run.app/business-types
```

## Data Structure

### Firestore Collections

#### `business_classifications`
```javascript
{
  business_type: "WARUNG SEMBAKO & KELONTONG",
  category_number: 1,
  description: "Overview of the business...",
  maturity_levels: [
    {
      level: 1,
      name: "Level 1: Pemula",
      description: "Starting stage...",
      characteristics: ["Trait 1", "Trait 2"],
      criteria: ["Requirement 1", "Requirement 2"],
      swot: {
        strengths: ["Strength 1"],
        weaknesses: ["Weakness 1"],
        opportunities: ["Opportunity 1"],
        threats: ["Threat 1"]
      },
      next_steps: ["Step 1", "Step 2"]
    }
  ],
  source_doc_id: "google-doc-id",
  imported_at: "2024-01-01T00:00:00.000Z"
}
```

#### `business_meta`
Stores reference documents (UMKM definition, summary matrix):
```javascript
{
  title: "Definisi UMKM & Leveling Maturitas",
  sections: [...],
  source_doc_id: "google-doc-id",
  imported_at: "2024-01-01T00:00:00.000Z"
}
```

## Dashboard Features

### Business Types Page (`/business-types`)

**Grid View:**
- Shows all business types as cards
- Sorted by category number
- Displays: category, name, description, maturity level count

**Detail Modal:**
- Click any card to view full details
- Shows all maturity levels with:
  - Characteristics
  - Criteria
  - SWOT analysis (color-coded boxes)
  - Next steps to level up

**Stats:**
- Total business types
- Total maturity levels
- Average levels per type
- Last import date

## Parser Logic

The import script (`scripts/import-business-types.js`) uses intelligent parsing:

1. **Document Detection**: Identifies meta docs vs business type docs
2. **Section Extraction**: Parses headings, paragraphs, tables with formatting
3. **Level Detection**: Recognizes "Level 1-5" or "Tingkat 1-5" patterns
4. **SWOT Extraction**: Detects strength/weakness/opportunity/threat sections
5. **Content Grouping**: Associates content with appropriate sections

## Troubleshooting

### Permission Errors
```
Error: The caller does not have permission
```
**Solution**: Share the folder with the service account email

### Empty Documents
```
⚠️ Skipped (empty document)
```
**Solution**: Check if the document has content and proper formatting

### No Levels Parsed
```
📊 Parsed: 0 maturity levels
```
**Solution**: Ensure documents use "Level 1", "Level 2" etc. headings

## Re-importing

To update business types:

1. Clean up existing data:
```bash
node scripts/cleanup-business-types.js
```

2. Re-run import:
```bash
node scripts/import-business-types.js
```

## API Endpoints

### Get All Business Types
```
GET /api/business-types
```

Returns array of all business classifications with full maturity level data.

## Future Enhancements

- [ ] Search/filter by business type name
- [ ] Filter by maturity level
- [ ] Export to PDF
- [ ] Compare multiple business types
- [ ] User maturity assessment tool
- [ ] Recommendation engine based on user's business
