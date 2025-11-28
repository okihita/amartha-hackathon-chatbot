# Design Document

## Overview

The Google Drive RAG Import system automates the process of fetching, parsing, and importing educational content from Google Drive into Firestore. The system consists of three main components: a Google Drive client for fetching documents, parsers for converting document content into structured data, and an importer for storing data in Firestore.

The existing `fetch-from-google-drive.js` script provides a foundation, but needs improvements in error handling, parsing robustness, and verification. This design enhances the current implementation to handle edge cases, provide better logging, and ensure data integrity.

## Architecture

### High-Level Flow

```
Google Drive Folders
        ↓
   [Drive API Client]
        ↓
   [Document Fetcher]
        ↓
   [Content Parser] ──→ Business Classification Parser
        ↓                Financial Module Parser
   [Data Validator]
        ↓
   [Firestore Importer]
        ↓
   [Verification Service]
```

### Component Responsibilities

1. **Drive API Client**: Authenticates and provides access to Google Drive API
2. **Document Fetcher**: Lists and retrieves document content from specified folders
3. **Content Parser**: Converts raw Google Docs content into structured JSON
4. **Data Validator**: Ensures parsed data meets schema requirements
5. **Firestore Importer**: Writes validated data to Firestore collections
6. **Verification Service**: Confirms successful import by querying Firestore

## Components and Interfaces

### 1. Drive API Client

```javascript
class DriveAPIClient {
  constructor(credentialsPath, scopes)
  async authenticate()
  async listFiles(folderId, mimeType)
  async getDocument(documentId)
}
```

**Responsibilities:**
- Initialize Google Auth with service account credentials
- Provide authenticated Drive and Docs API clients
- Handle authentication errors

### 2. Document Fetcher

```javascript
class DocumentFetcher {
  constructor(driveClient)
  async fetchFolderContents(folderId)
  async fetchDocumentContent(documentId)
}
```

**Responsibilities:**
- List all Google Docs in a folder (excluding trashed files)
- Fetch full document content including text and structure
- Return document metadata (name, ID, timestamps)

### 3. Content Parser

```javascript
class ContentParser {
  extractTextFromDocument(googleDoc)
}

class BusinessClassificationParser extends ContentParser {
  parse(documentName, content)
  parseLevel(lines, startIndex)
  parseSWOT(lines, startIndex)
  generateKeywords(businessType)
}

class FinancialModuleParser extends ContentParser {
  parse(documentName, content)
  parseQuiz(lines, startIndex)
  parseQuestion(lines, startIndex)
  extractLearningObjectives(lines)
}
```

**Responsibilities:**
- Extract plain text from Google Docs structure
- Parse document sections based on headers and formatting
- Handle both English and Indonesian section names
- Generate structured JSON matching Firestore schema
- Handle malformed content gracefully

### 4. Data Validator

```javascript
class DataValidator {
  validateBusinessClassification(data)
  validateFinancialModule(data)
  validateLevel(level)
  validateQuizQuestion(question)
}
```

**Responsibilities:**
- Ensure required fields are present
- Validate data types and formats
- Check array lengths and content
- Return validation errors with details

### 5. Firestore Importer

```javascript
class FirestoreImporter {
  constructor(firestoreClient)
  async importBusinessClassification(data)
  async importFinancialModule(data)
  async batchImport(collection, documents)
}
```

**Responsibilities:**
- Write documents to Firestore collections
- Handle overwrites with updated timestamps
- Batch operations for efficiency
- Report success/failure per document

### 6. Verification Service

```javascript
class VerificationService {
  constructor(firestoreClient)
  async verifyImport(expectedCounts)
  async getCollectionCount(collectionName)
  async sampleDocuments(collectionName, count)
}
```

**Responsibilities:**
- Count documents in each collection
- Compare actual vs expected counts
- Sample documents for spot-checking
- Generate verification report

## Data Models

### Business Classification Schema

```javascript
{
  id: string,                    // e.g., "warung_sembako"
  business_type: string,         // e.g., "Warung Sembako"
  legal_category: string,        // "Mikro", "Kecil", "Menengah"
  description: string,
  levels: [
    {
      level: number,             // 1-5
      name: string,
      criteria: string[],
      characteristics: string[],
      next_steps: string[],
      swot: {
        strengths: string[],
        weaknesses: string[],
        opportunities: string[],
        threats: string[]
      },
      recommended_actions: string[],
      estimated_duration: string
    }
  ],
  keywords: string[],
  created_at: string,            // ISO 8601
  updated_at: string             // ISO 8601
}
```

### Financial Module Schema

```javascript
{
  id: string,                    // e.g., "week_1"
  week: number,
  title: string,
  subtitle: string,
  description: string,
  learning_objectives: string[],
  content: {
    introduction: string,
    main_topics: [
      {
        topic: string,
        content: string,
        examples: string[]
      }
    ],
    summary: string,
    key_takeaways: string[]
  },
  quiz: [
    {
      id: string,                // e.g., "q1"
      question: string,
      options: string[],         // ["A. ...", "B. ...", "C. ...", "D. ..."]
      correct_answer: string,    // "A", "B", "C", or "D"
      explanation: string
    }
  ],
  passing_score: number,         // default 70
  keywords: string[],
  difficulty: string,            // "Pemula", "Menengah", "Lanjut"
  estimated_time: string,        // e.g., "30 menit"
  created_at: string,
  updated_at: string
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Authentication with valid credentials succeeds

*For any* valid service account credentials file, authentication should succeed and return authenticated API clients.
**Validates: Requirements 1.1**

### Property 2: Folder listing excludes trashed files

*For any* Google Drive folder, listing files should return only non-trashed Google Docs files, excluding all trashed files and non-document file types.
**Validates: Requirements 1.2**

### Property 3: Document metadata completeness

*For any* document returned from folder listing, the metadata should include name, ID, and modification time fields.
**Validates: Requirements 1.3**

### Property 4: Business type extraction from document name

*For any* business classification document name following the expected format, extracting the business type should produce a non-empty string.
**Validates: Requirements 2.1**

### Property 5: Maturity level parsing completeness

*For any* valid business classification document with 5 maturity levels, parsing should return exactly 5 level objects, each containing criteria, characteristics, and next_steps arrays.
**Validates: Requirements 2.2**

### Property 6: SWOT categorization correctness

*For any* SWOT section in a document, parsed content should be categorized into exactly four categories: strengths, weaknesses, opportunities, and threats, with no items in wrong categories.
**Validates: Requirements 2.3**

### Property 7: Document ID URL-safety

*For any* business name string, the generated document ID should be lowercase, contain only alphanumeric characters and underscores, and have no spaces or special characters.
**Validates: Requirements 2.4**

### Property 8: Partial failure resilience

*For any* batch of documents where one document fails to parse, the system should successfully process all other valid documents and return their results.
**Validates: Requirements 2.5, 3.5, 4.5**

### Property 9: Week number extraction

*For any* financial module document name containing "Week N" format, extracting the week number should return the integer N.
**Validates: Requirements 3.1**

### Property 10: Quiz question field completeness

*For any* parsed quiz question, the result should contain question text, exactly 4 options (A-D), a correct answer, and an explanation field.
**Validates: Requirements 3.2**

### Property 11: Learning objectives extraction completeness

*For any* document with N bullet-pointed learning objectives, parsing should extract exactly N objectives with no duplicates or omissions.
**Validates: Requirements 3.3**

### Property 12: Content section separation

*For any* financial module document with introduction, main topics, summary, and key takeaways sections, parsing should populate all four content fields separately without mixing content between sections.
**Validates: Requirements 3.4**

### Property 13: Firestore storage location correctness

*For any* business classification document, after import, querying Firestore collection "business_classifications" with the generated ID should return the document.
**Validates: Requirements 4.1**

### Property 14: Financial module storage with week-based ID

*For any* financial module with week number N, after import, querying Firestore collection "financial_literacy_modules" with ID "week_N" should return the document.
**Validates: Requirements 4.2**

### Property 15: Import idempotency with timestamp update

*For any* document imported twice, the second import should overwrite the first, and the updated_at timestamp of the second import should be later than the first.
**Validates: Requirements 4.3**

### Property 16: Import count accuracy

*For any* import operation processing N documents with M successes, the reported success count should equal M and the total count should equal N.
**Validates: Requirements 4.4**

### Property 17: Verification query execution

*For any* completed import, the verification step should execute and return document counts for both business_classifications and financial_literacy_modules collections.
**Validates: Requirements 5.1, 5.2**

### Property 18: Verification error isolation

*For any* import where verification fails, the import process should still complete successfully and report the verification error separately.
**Validates: Requirements 5.5**

### Property 19: Document processing logging

*For any* document being processed, the logs should contain at least one entry with the document name.
**Validates: Requirements 6.1**

### Property 20: Success logging completeness

*For any* successfully imported document, the logs should contain the document name and at least one piece of key metadata (e.g., number of levels or questions).
**Validates: Requirements 6.2**

### Property 21: Error logging completeness

*For any* error during processing, the logs should contain the error message, the document name being processed, and a stack trace.
**Validates: Requirements 6.3**

### Property 22: Summary display on completion

*For any* script execution, the output should include a summary section with total document counts and success/failure statistics.
**Validates: Requirements 6.4**

### Property 23: Verbose mode detail increase

*For any* document processed in verbose mode, the log output should contain more entries than when processed in normal mode.
**Validates: Requirements 6.5**

### Property 24: Bilingual header recognition

*For any* document section header in either English or Indonesian (e.g., "Kriteria" or "Criteria"), the parser should correctly identify and process that section.
**Validates: Requirements 7.1**

### Property 25: Multi-character bullet point recognition

*For any* list using either dash (-) or bullet (•) characters, all list items should be extracted regardless of which character is used.
**Validates: Requirements 7.2**

### Property 26: Whitespace normalization

*For any* content string with leading/trailing whitespace or multiple consecutive spaces, the parsed output should have normalized spacing (single spaces, no leading/trailing whitespace).
**Validates: Requirements 7.3**

### Property 27: Optional section graceful handling

*For any* document missing optional sections, parsing should succeed and populate those fields with empty arrays or default values.
**Validates: Requirements 7.4**

### Property 28: Invalid document skipping

*For any* batch containing a completely invalid document, the system should skip that document, log a detailed error, and continue processing remaining documents.
**Validates: Requirements 7.5**

### Property 29: Environment variable credential path precedence

*For any* execution where GOOGLE_APPLICATION_CREDENTIALS environment variable is set, the system should use that path instead of the default path.
**Validates: Requirements 8.1**

### Property 30: Environment variable project ID precedence

*For any* execution where GCP_PROJECT_ID environment variable is set, the Firestore client should connect to that project ID.
**Validates: Requirements 8.4**

## Error Handling

### Error Categories

1. **Authentication Errors**
   - Invalid credentials file
   - Missing credentials
   - Insufficient permissions
   - **Handling**: Fail fast with clear error message, do not proceed with import

2. **API Errors**
   - Quota exceeded
   - Network timeout
   - Rate limiting
   - **Handling**: Log error, implement exponential backoff for retries, continue with remaining documents

3. **Parsing Errors**
   - Malformed document structure
   - Missing required sections
   - Invalid data format
   - **Handling**: Log detailed error with document name, skip document, continue with batch

4. **Validation Errors**
   - Missing required fields
   - Invalid data types
   - Out-of-range values
   - **Handling**: Log validation errors, skip document, continue with batch

5. **Firestore Errors**
   - Write permission denied
   - Document too large
   - Network failure
   - **Handling**: Log error with document details, retry with exponential backoff, continue with remaining documents

### Error Recovery Strategies

1. **Retry with Exponential Backoff**: For transient errors (network, rate limiting)
2. **Skip and Continue**: For document-specific errors (parsing, validation)
3. **Fail Fast**: For fatal errors (authentication, missing credentials)
4. **Graceful Degradation**: Verification failures don't fail the import

### Error Logging Format

```javascript
{
  timestamp: "2025-11-22T10:30:00Z",
  level: "ERROR",
  component: "BusinessClassificationParser",
  document: "Warung Sembako - Maturity Levels.gdoc",
  error: "Missing required section: Level 3",
  stack: "Error: Missing required section...",
  context: {
    folderId: "14D6sdUsJevp30p1xNGQVKh_1im_QAKVH",
    documentId: "abc123"
  }
}
```

## Testing Strategy

### Unit Testing

Unit tests will verify individual components in isolation:

1. **Parser Tests**
   - Test business type extraction from various document name formats
   - Test SWOT section parsing with different formatting
   - Test quiz question parsing with various layouts
   - Test whitespace normalization
   - Test bilingual header recognition

2. **Validator Tests**
   - Test validation of complete valid documents
   - Test validation catches missing required fields
   - Test validation catches invalid data types
   - Test validation of edge cases (empty arrays, null values)

3. **ID Generation Tests**
   - Test URL-safe ID generation from various business names
   - Test handling of special characters
   - Test handling of Unicode characters

4. **Error Handling Tests**
   - Test authentication failure handling
   - Test parsing error recovery
   - Test Firestore write error handling

### Property-Based Testing

Property-based tests will verify universal properties across many inputs using the **fast-check** library for JavaScript. Each test will run a minimum of 100 iterations.

1. **Document ID Generation Properties**
   - Property 7: Generated IDs are always URL-safe
   - Test with random business names including special characters, Unicode, spaces

2. **Parsing Resilience Properties**
   - Property 8: One document failure doesn't affect others
   - Test with batches containing random valid and invalid documents

3. **Metadata Completeness Properties**
   - Property 3: All returned documents have required metadata
   - Property 10: All quiz questions have required fields
   - Test with randomly generated document structures

4. **Whitespace Normalization Properties**
   - Property 26: Output always has normalized whitespace
   - Test with random strings containing various whitespace patterns

5. **Import Idempotency Properties**
   - Property 15: Re-importing updates timestamp
   - Test by importing same document multiple times

6. **Count Accuracy Properties**
   - Property 16: Reported counts match actual results
   - Test with random batch sizes and success/failure ratios

### Integration Testing

Integration tests will verify end-to-end workflows:

1. **Full Import Workflow**
   - Test complete import from Drive to Firestore
   - Verify all documents are correctly stored
   - Verify verification step runs successfully

2. **Error Recovery Workflow**
   - Test import with mix of valid and invalid documents
   - Verify valid documents are imported despite errors
   - Verify error logs contain all required information

3. **Configuration Testing**
   - Test with different environment variable configurations
   - Test credential path resolution
   - Test project ID configuration

### Test Data

1. **Sample Documents**: Create minimal test documents in Google Drive for integration tests
2. **Mock Data**: Use mock Google Docs API responses for unit tests
3. **Generated Data**: Use property-based testing to generate random valid and invalid inputs

### Testing Framework

- **Unit Tests**: Jest
- **Property-Based Tests**: fast-check
- **Integration Tests**: Jest with real Firestore emulator
- **Mocking**: Jest mocks for Google APIs in unit tests

## Performance Considerations

### Optimization Strategies

1. **Batch Operations**: Use Firestore batch writes (up to 500 documents per batch)
2. **Parallel Fetching**: Fetch multiple documents concurrently (limit: 10 concurrent requests)
3. **Caching**: Cache authenticated API clients to avoid re-authentication
4. **Streaming**: Process documents as they're fetched, don't wait for all to download

### Expected Performance

- **Small Import** (20 business types + 15 modules): ~30-60 seconds
- **Large Import** (100+ documents): ~3-5 minutes
- **API Quota**: Google Drive API allows 1000 requests per 100 seconds per user

### Monitoring

- Log processing time per document
- Log total import duration
- Track API quota usage
- Alert on import failures

## Security Considerations

1. **Credential Management**
   - Service account key stored securely (not in git)
   - Minimal permissions (read-only Drive access)
   - Credentials loaded from environment variables in production

2. **Data Validation**
   - Validate all parsed data before Firestore write
   - Sanitize document IDs to prevent injection
   - Limit document size to prevent DoS

3. **Access Control**
   - Service account has read-only Drive access
   - Service account has write access only to specific Firestore collections
   - No user data or PII in imported documents

## Deployment

### Prerequisites

1. Google Cloud service account with Drive API enabled
2. Service account shared with Drive folders (Viewer permission)
3. Firestore database initialized
4. Node.js 18+ installed

### Deployment Steps

1. **Setup Credentials**
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="./service-account-key.json"
   export GCP_PROJECT_ID="stellar-zoo-478021-v8"
   ```

2. **Install Dependencies**
   ```bash
   npm install googleapis @google-cloud/firestore
   ```

3. **Run Import**
   ```bash
   node scripts/fetch-from-google-drive.js
   ```

4. **Verify Import**
   - Check Firestore console for document counts
   - Sample a few documents to verify structure
   - Check logs for any errors

### Automation Options

1. **Manual**: Run script when documents are updated
2. **Scheduled**: Use Cloud Scheduler to run weekly
3. **Triggered**: Use Cloud Functions triggered by Drive changes (requires Drive API webhooks)

## Future Enhancements

1. **Incremental Updates**: Only import documents modified since last import
2. **Diff Detection**: Compare existing Firestore documents with Drive versions
3. **Rollback Support**: Keep document versions for rollback capability
4. **Validation Dashboard**: Web UI to review parsing results before import
5. **Multi-language Support**: Parse documents in multiple languages
6. **Schema Evolution**: Handle schema changes gracefully with migrations
