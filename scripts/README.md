# Import Scripts

Scripts for importing content from Google Drive into Firestore.

## Prerequisites

1. **GEMINI_API_KEY**: Set in `.env` file (already configured)
2. **Public Google Drive Folders**: Folders must be set to "Anyone with the link can view"
3. **Firestore**: Database must be enabled in your GCP project

## Financial Literacy Import

Import financial literacy course modules from Google Drive.

### Setup

The folder IDs are already configured in `.env`:
- `FINANCIAL_LITERACY_FOLDER_ID=1_qBhLNCfdxkLVTro_jJACF6sm_rG9ZBt`
- `BUSINESS_TYPES_FOLDER_ID=14D6sdUsJevp30p1xNGQVKh_1im_QAKVH`

### Run Import

```bash
# Import financial literacy (uses env variable)
node scripts/import-financial-literacy.js

# Or override folder ID
FINANCIAL_LITERACY_FOLDER_ID="your-folder-id" node scripts/import-financial-literacy.js
```

### Expected Document Structure

Each Google Doc should contain:

- **Module Name**: Document title (e.g., "Modul 1: Pengelolaan Keuangan")
- **Description**: Opening paragraphs explaining the module
- **Keywords**: List of relevant keywords for search
- **Lessons**: Sections with headings for each lesson
  - Lesson content (paragraphs)
  - Key points (bullet lists)
  - Examples (bullet lists)
- **Tips**: Practical advice (bullet lists)
- **Exercises**: Practice activities (bullet lists)

### Output

Data is stored in Firestore collection: `financial_literacy`

Each document contains:
```javascript
{
  module_name: "Modul 1: Pengelolaan Keuangan",
  module_number: 1,
  description: "Overview of the module...",
  keywords: ["keuangan", "budgeting", "tabungan"],
  lessons: [
    {
      title: "Lesson 1: Budgeting Basics",
      content: ["Paragraph 1...", "Paragraph 2..."],
      key_points: ["Point 1", "Point 2"],
      examples: ["Example 1", "Example 2"]
    }
  ],
  tips: ["Tip 1", "Tip 2"],
  examples: ["Example 1"],
  exercises: ["Exercise 1"],
  source_doc_id: "google-doc-id",
  imported_at: "2025-11-23T..."
}
```

### View Imported Data

After import, view the data at:
```
https://your-app.run.app/financial-literacy
```

## Business Types Import

Import business classifications with maturity levels.

### Run Import

```bash
# Uses folder ID from .env (already configured)
node scripts/import-business-types.js

# Or override folder ID
BUSINESS_TYPES_FOLDER_ID="your-folder-id" node scripts/import-business-types.js
```

### Output

Data is stored in Firestore collections:
- `business_classifications` - 25 business types with maturity levels
- `business_meta` - Reference documents (UMKM definition, summary)

### View Imported Data

```
https://your-app.run.app/business-types
```

## Troubleshooting

### Permission Denied

```
Error: The caller does not have permission
```

**Solution**: 
1. Ensure the Google Drive folder is set to "Anyone with the link can view"
2. Check that `GEMINI_API_KEY` is set in `.env`
3. Verify the API key has Google Drive API enabled in GCP console

### Empty Documents

```
⚠️ Skipped (empty document)
```

**Solution**: Check if the document has content and proper formatting

### Firestore Error

```
Error: Missing or insufficient permissions
```

**Solution**: 
1. Verify Firestore is enabled in GCP project
2. Check `GCP_PROJECT_ID` environment variable
3. Ensure service account has Firestore permissions

## Re-importing

To update content, simply re-run the import script. It will create new documents (not update existing ones).

To clean up old data first:
```bash
# Delete all documents in a collection (use with caution!)
# You'll need to create a cleanup script or use Firestore console
```

## Integration with AI Bot

The imported financial literacy content is automatically integrated with the AI bot through:

1. **Knowledge Retrieval** (`src/knowledge.js`): Searches modules by keywords
2. **API Endpoint** (`/api/financial-literacy`): Provides data to dashboard
3. **Dashboard** (`/financial-literacy`): Displays modules for field agents

When users ask questions, the bot will:
1. Check static knowledge base
2. Search financial literacy modules by keywords
3. Return relevant content with key points
