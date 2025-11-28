# Requirements Document

## Introduction

This feature enhances the RAG (Retrieval-Augmented Generation) implementation for the Amartha chatbot by automating the import of business classifications and financial literacy content from Google Drive folders into Firestore. The system will fetch documents from specified Google Drive folders, parse their content, and structure them for use in the AI-powered chatbot responses.

## Glossary

- **RAG System**: The Retrieval-Augmented Generation system that provides contextual information to the AI chatbot
- **Google Drive API**: Google's API service for programmatic access to Drive files and folders
- **Firestore**: Google Cloud's NoSQL document database used for storing structured RAG data
- **Service Account**: A Google Cloud service account with read-only access to specific Drive folders
- **Business Classification**: Structured data describing business types and their maturity levels (1-5)
- **Financial Literacy Module**: Weekly educational content with quizzes for UMKM owners
- **Document Parser**: Component that converts Google Docs content into structured JSON format
- **Import Script**: The automated script that orchestrates the fetch-parse-import workflow

## Requirements

### Requirement 1

**User Story:** As a system administrator, I want to fetch documents from Google Drive folders, so that I can automatically import RAG content without manual data entry.

#### Acceptance Criteria

1. WHEN the import script is executed THEN the Google Drive API SHALL authenticate using the service account credentials
2. WHEN listing files in a folder THEN the system SHALL retrieve all Google Docs files that are not in trash
3. WHEN a Drive folder ID is provided THEN the system SHALL return all document metadata including name, ID, and modification time
4. WHEN authentication fails THEN the system SHALL report a clear error message indicating credential issues
5. WHEN API quota is exceeded THEN the system SHALL handle the error gracefully and report the quota limitation

### Requirement 2

**User Story:** As a system administrator, I want to parse business classification documents, so that maturity level data is structured correctly in Firestore.

#### Acceptance Criteria

1. WHEN parsing a business classification document THEN the system SHALL extract the business type from the document name
2. WHEN processing maturity levels THEN the system SHALL identify and parse all 5 levels with their criteria, characteristics, and next steps
3. WHEN extracting SWOT analysis THEN the system SHALL categorize content into strengths, weaknesses, opportunities, and threats
4. WHEN generating document IDs THEN the system SHALL create URL-safe identifiers by converting business names to lowercase with underscores
5. WHEN parsing fails for a document THEN the system SHALL log the error and continue processing remaining documents

### Requirement 3

**User Story:** As a system administrator, I want to parse financial literacy documents, so that weekly modules and quizzes are structured correctly in Firestore.

#### Acceptance Criteria

1. WHEN parsing a financial module document THEN the system SHALL extract the week number from the document name
2. WHEN processing quiz questions THEN the system SHALL parse question text, options A-D, correct answer, and explanation
3. WHEN extracting learning objectives THEN the system SHALL identify and store all bullet-pointed objectives
4. WHEN parsing content sections THEN the system SHALL separate introduction, main topics, summary, and key takeaways
5. WHEN a quiz question is malformed THEN the system SHALL log a warning and skip that question while continuing with others

### Requirement 4

**User Story:** As a system administrator, I want to import parsed data to Firestore, so that the RAG system can use the content for chatbot responses.

#### Acceptance Criteria

1. WHEN importing a business classification THEN the system SHALL store it in the business_classifications collection with the generated ID
2. WHEN importing a financial module THEN the system SHALL store it in the financial_literacy_modules collection with week-based ID
3. WHEN a document already exists in Firestore THEN the system SHALL overwrite it with the new data and update the updated_at timestamp
4. WHEN import completes THEN the system SHALL report the count of successfully imported documents versus total documents
5. WHEN Firestore write fails THEN the system SHALL log the error with document details and continue processing remaining documents

### Requirement 5

**User Story:** As a system administrator, I want to verify imported data, so that I can confirm the import was successful before using the data.

#### Acceptance Criteria

1. WHEN import completes THEN the system SHALL query Firestore to count documents in each collection
2. WHEN displaying verification results THEN the system SHALL show the count of business classifications and financial modules
3. WHEN verification counts match import counts THEN the system SHALL display a success message
4. WHEN verification counts do not match THEN the system SHALL display a warning with the discrepancy
5. WHEN verification query fails THEN the system SHALL report the error without failing the entire import process

### Requirement 6

**User Story:** As a system administrator, I want clear logging and error reporting, so that I can troubleshoot issues when imports fail.

#### Acceptance Criteria

1. WHEN processing each document THEN the system SHALL log the document name being processed
2. WHEN an import succeeds THEN the system SHALL log the document name and key metadata (e.g., number of levels or questions)
3. WHEN an error occurs THEN the system SHALL log the error message, document name, and stack trace
4. WHEN the script completes THEN the system SHALL display a summary with total counts and success/failure statistics
5. WHEN running in verbose mode THEN the system SHALL output detailed parsing information for debugging

### Requirement 7

**User Story:** As a developer, I want the parser to handle document format variations, so that minor formatting differences do not break the import.

#### Acceptance Criteria

1. WHEN section headers use different languages THEN the system SHALL recognize both English and Indonesian headers (e.g., "Kriteria" or "Criteria")
2. WHEN bullet points use different characters THEN the system SHALL recognize both dash (-) and bullet (•) characters
3. WHEN whitespace varies THEN the system SHALL normalize spacing and trim content appropriately
4. WHEN optional sections are missing THEN the system SHALL use empty arrays or default values without failing
5. WHEN document structure is completely invalid THEN the system SHALL skip the document and log a detailed error

### Requirement 8

**User Story:** As a system administrator, I want to configure folder IDs and credentials via environment variables, so that I can use different configurations for testing and production.

#### Acceptance Criteria

1. WHEN the GOOGLE_APPLICATION_CREDENTIALS environment variable is set THEN the system SHALL use that path for service account credentials
2. WHEN credential path is not set THEN the system SHALL default to ./service-account-key.json in the project root
3. WHEN folder IDs are hardcoded THEN the system SHALL use the configured business types and financial literacy folder IDs
4. WHEN GCP_PROJECT_ID is set THEN the system SHALL use that project ID for Firestore connection
5. WHEN GCP_PROJECT_ID is not set THEN the system SHALL default to the stellar-zoo-478021-v8 project
