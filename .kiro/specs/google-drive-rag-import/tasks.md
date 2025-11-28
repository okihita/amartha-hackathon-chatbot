# Implementation Plan

- [ ] 1. Refactor existing script into modular components
  - Extract Drive API client initialization into separate class
  - Extract document fetching logic into DocumentFetcher class
  - Extract parsing logic into separate parser classes
  - Create base ContentParser class with shared functionality
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2. Implement robust business classification parser
  - [ ] 2.1 Create BusinessClassificationParser class
    - Implement parse() method that handles document name and content
    - Implement parseLevel() method for extracting maturity levels
    - Implement parseSWOT() method for SWOT analysis extraction
    - Implement generateKeywords() method
    - Handle both English and Indonesian section headers
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 7.1_

  - [ ]* 2.2 Write property test for business type extraction
    - **Property 4: Business type extraction from document name**
    - **Validates: Requirements 2.1**

  - [ ]* 2.3 Write property test for document ID generation
    - **Property 7: Document ID URL-safety**
    - **Validates: Requirements 2.4**

  - [ ]* 2.4 Write property test for maturity level parsing
    - **Property 5: Maturity level parsing completeness**
    - **Validates: Requirements 2.2**

  - [ ]* 2.5 Write property test for SWOT categorization
    - **Property 6: SWOT categorization correctness**
    - **Validates: Requirements 2.3**

- [ ] 3. Implement robust financial module parser
  - [ ] 3.1 Create FinancialModuleParser class
    - Implement parse() method for module documents
    - Implement parseQuiz() method for quiz section extraction
    - Implement parseQuestion() method for individual questions
    - Implement extractLearningObjectives() method
    - Handle bilingual headers and various bullet point characters
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 7.1, 7.2_

  - [ ]* 3.2 Write property test for week number extraction
    - **Property 9: Week number extraction**
    - **Validates: Requirements 3.1**

  - [ ]* 3.3 Write property test for quiz question parsing
    - **Property 10: Quiz question field completeness**
    - **Validates: Requirements 3.2**

  - [ ]* 3.4 Write property test for learning objectives extraction
    - **Property 11: Learning objectives extraction completeness**
    - **Validates: Requirements 3.3**

  - [ ]* 3.5 Write property test for content section separation
    - **Property 12: Content section separation**
    - **Validates: Requirements 3.4**

- [ ] 4. Implement data validation layer
  - [ ] 4.1 Create DataValidator class
    - Implement validateBusinessClassification() method
    - Implement validateFinancialModule() method
    - Implement validateLevel() helper method
    - Implement validateQuizQuestion() helper method
    - Return detailed validation errors
    - _Requirements: 2.2, 2.3, 3.2, 3.3_

  - [ ]* 4.2 Write unit tests for validator
    - Test validation of complete valid documents
    - Test validation catches missing required fields
    - Test validation catches invalid data types
    - _Requirements: 2.2, 2.3, 3.2, 3.3_

- [ ] 5. Implement error handling and resilience
  - [ ] 5.1 Add error handling to parsers
    - Wrap parsing logic in try-catch blocks
    - Log detailed errors with document context
    - Return null or skip on parse failure
    - Continue processing remaining documents
    - _Requirements: 2.5, 3.5, 6.3, 7.5_

  - [ ] 5.2 Add error handling to Firestore importer
    - Implement retry logic with exponential backoff
    - Handle write failures gracefully
    - Continue processing remaining documents on failure
    - _Requirements: 4.5, 6.3_

  - [ ]* 5.3 Write property test for partial failure resilience
    - **Property 8: Partial failure resilience**
    - **Validates: Requirements 2.5, 3.5, 4.5**

  - [ ]* 5.4 Write property test for invalid document skipping
    - **Property 28: Invalid document skipping**
    - **Validates: Requirements 7.5**

- [ ] 6. Implement comprehensive logging
  - [ ] 6.1 Add structured logging throughout
    - Log document name when processing starts
    - Log success with key metadata (levels count, questions count)
    - Log errors with message, document name, and stack trace
    - Add verbose mode flag for detailed logging
    - _Requirements: 6.1, 6.2, 6.3, 6.5_

  - [ ] 6.2 Implement summary report generation
    - Track total documents processed
    - Track success and failure counts
    - Display summary at script completion
    - _Requirements: 6.4_

  - [ ]* 6.3 Write property test for logging completeness
    - **Property 19: Document processing logging**
    - **Property 20: Success logging completeness**
    - **Property 21: Error logging completeness**
    - **Validates: Requirements 6.1, 6.2, 6.3**

  - [ ]* 6.4 Write property test for summary display
    - **Property 22: Summary display on completion**
    - **Validates: Requirements 6.4**

- [ ] 7. Implement Firestore import with verification
  - [ ] 7.1 Enhance FirestoreImporter class
    - Implement batch write operations
    - Handle document overwrites with timestamp updates
    - Return accurate import counts
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 7.2 Create VerificationService class
    - Implement verifyImport() method
    - Implement getCollectionCount() method
    - Query Firestore for document counts
    - Compare expected vs actual counts
    - Handle verification failures gracefully
    - _Requirements: 5.1, 5.2, 5.5_

  - [ ]* 7.3 Write property test for Firestore storage correctness
    - **Property 13: Firestore storage location correctness**
    - **Property 14: Financial module storage with week-based ID**
    - **Validates: Requirements 4.1, 4.2**

  - [ ]* 7.4 Write property test for import idempotency
    - **Property 15: Import idempotency with timestamp update**
    - **Validates: Requirements 4.3**

  - [ ]* 7.5 Write property test for import count accuracy
    - **Property 16: Import count accuracy**
    - **Validates: Requirements 4.4**

  - [ ]* 7.6 Write property test for verification execution
    - **Property 17: Verification query execution**
    - **Validates: Requirements 5.1, 5.2**

- [ ] 8. Implement configuration and environment handling
  - [ ] 8.1 Add environment variable support
    - Read GOOGLE_APPLICATION_CREDENTIALS with fallback to default
    - Read GCP_PROJECT_ID with fallback to default
    - Document environment variables in README
    - _Requirements: 8.1, 8.2, 8.4, 8.5_

  - [ ]* 8.2 Write property test for credential path precedence
    - **Property 29: Environment variable credential path precedence**
    - **Validates: Requirements 8.1**

  - [ ]* 8.3 Write property test for project ID precedence
    - **Property 30: Environment variable project ID precedence**
    - **Validates: Requirements 8.4**

- [ ] 9. Implement parser robustness features
  - [ ] 9.1 Add whitespace normalization
    - Trim leading and trailing whitespace
    - Normalize multiple spaces to single space
    - Apply to all parsed text content
    - _Requirements: 7.3_

  - [ ] 9.2 Add multi-character bullet point support
    - Recognize both dash (-) and bullet (•) characters
    - Extract list items regardless of character used
    - _Requirements: 7.2_

  - [ ] 9.3 Add optional section handling
    - Use empty arrays for missing list sections
    - Use empty strings for missing text sections
    - Don't fail parsing when optional sections are absent
    - _Requirements: 7.4_

  - [ ]* 9.4 Write property test for whitespace normalization
    - **Property 26: Whitespace normalization**
    - **Validates: Requirements 7.3**

  - [ ]* 9.5 Write property test for bullet point recognition
    - **Property 25: Multi-character bullet point recognition**
    - **Validates: Requirements 7.2**

  - [ ]* 9.6 Write property test for optional section handling
    - **Property 27: Optional section graceful handling**
    - **Validates: Requirements 7.4**

- [ ] 10. Implement Drive API features
  - [ ] 10.1 Enhance folder listing
    - Filter for Google Docs only
    - Exclude trashed files
    - Return complete metadata (name, ID, modifiedTime)
    - _Requirements: 1.2, 1.3_

  - [ ] 10.2 Add authentication error handling
    - Catch authentication failures
    - Display clear error messages
    - Fail fast on credential issues
    - _Requirements: 1.4_

  - [ ]* 10.3 Write property test for folder listing
    - **Property 2: Folder listing excludes trashed files**
    - **Property 3: Document metadata completeness**
    - **Validates: Requirements 1.2, 1.3**

  - [ ]* 10.4 Write unit test for authentication failure
    - Test with invalid credentials
    - Verify clear error message
    - _Requirements: 1.4_

- [ ] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Update documentation
  - [ ] 12.1 Update GOOGLE_DRIVE_SETUP.md
    - Document new environment variables
    - Update usage instructions
    - Add troubleshooting section for new error cases
    - _Requirements: 8.1, 8.4_

  - [ ] 12.2 Update RAG_IMPLEMENTATION_GUIDE.md
    - Document new parser features
    - Update error handling documentation
    - Add examples of supported document formats
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 13. Final integration and testing
  - [ ] 13.1 Test complete import workflow
    - Run import with real Google Drive folders
    - Verify all documents imported correctly
    - Check Firestore for correct data structure
    - Verify verification step runs successfully
    - _Requirements: All_

  - [ ]* 13.2 Write integration tests
    - Test end-to-end import workflow
    - Test error recovery with mixed valid/invalid documents
    - Test with different environment configurations
    - _Requirements: All_
