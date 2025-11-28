# Amartha WhatsApp Chatbot - Requirements

## Project Overview

AI-powered WhatsApp chatbot for Amartha's financial literacy program, providing personalized business coaching and management tools for Indonesian micro-entrepreneurs (UMKM).

## Business Goals

1. **Automate User Onboarding**: Reduce manual registration time by 80%
2. **Scale Financial Education**: Reach 10,000+ UMKM members
3. **Improve Loan Management**: Real-time tracking and payment reminders
4. **Empower Field Agents**: Digital tools for efficient member management
5. **Data-Driven Insights**: Business intelligence from image analysis

## Target Users

### Primary Users
- **UMKM Members** (Micro-entrepreneurs)
  - Age: 25-55 years old
  - Gender: Primarily female (80%)
  - Location: Rural and semi-urban Indonesia
  - Tech literacy: Basic smartphone usage
  - Language: Bahasa Indonesia

### Secondary Users
- **Field Agents (BP - Business Partners)**
  - Age: 22-40 years old
  - Role: Facilitate Majelis meetings, verify users
  - Tech literacy: Moderate to high
  - Tools: Web dashboard, WhatsApp

## Functional Requirements

### FR-1: User Registration
**Priority**: Critical  
**Status**: ✅ Implemented

**Acceptance Criteria**:
- AC-1.1: User can register via natural language WhatsApp message
- AC-1.2: System extracts name, business type, and location automatically
- AC-1.3: Registration confirmation sent within 2 seconds
- AC-1.4: User profile created in Firestore with default values
- AC-1.5: Pending verification status set until BP approval

**Example**:
```
User: "Nama saya Ibu Siti, usaha warung sembako di Bogor"
Bot: "Terima kasih Ibu Siti! Data Anda sudah kami terima..."
```

### FR-2: User Verification
**Priority**: Critical  
**Status**: ✅ Implemented

**Acceptance Criteria**:
- AC-2.1: BP can view all pending users in dashboard
- AC-2.2: BP can approve or reject users with one click
- AC-2.3: Status update reflected in real-time
- AC-2.4: Verified users gain full access to features
- AC-2.5: Rejected users can re-register

### FR-3: AI Conversation
**Priority**: Critical  
**Status**: ✅ Implemented

**Acceptance Criteria**:
- AC-3.1: Bot responds to financial literacy questions
- AC-3.2: Context-aware responses based on user profile
- AC-3.3: Spam and inappropriate content filtered
- AC-3.4: Response time < 2 seconds for text messages
- AC-3.5: Fallback message on AI failure

### FR-4: Image Analysis
**Priority**: High  
**Status**: ✅ Implemented

**Acceptance Criteria**:
- AC-4.1: User can upload business photos via WhatsApp
- AC-4.2: AI classifies image (building, inventory, financial records)
- AC-4.3: Structured data extracted (value estimates, insights)
- AC-4.4: Credit score updated based on analysis
- AC-4.5: Response time < 10 seconds for image processing

### FR-5: Majelis Management
**Priority**: High  
**Status**: ✅ Implemented

**Acceptance Criteria**:
- AC-5.1: BP can create Majelis groups with schedule
- AC-5.2: BP can add/remove members
- AC-5.3: System validates one user per Majelis
- AC-5.4: Member list displayed on dashboard
- AC-5.5: User's Majelis info updated automatically

### FR-6: Loan Tracking
**Priority**: High  
**Status**: ✅ Implemented

**Acceptance Criteria**:
- AC-6.1: User can check loan limit and balance
- AC-6.2: Payment history displayed chronologically
- AC-6.3: Next payment date and amount shown
- AC-6.4: Transaction history stored in Firestore
- AC-6.5: Loan data accessible via dashboard

### FR-7: Business Intelligence
**Priority**: Medium  
**Status**: ✅ Implemented

**Acceptance Criteria**:
- AC-7.1: Credit score calculated from multiple data points
- AC-7.2: Asset and inventory values aggregated
- AC-7.3: Monthly cashflow estimated
- AC-7.4: Loan recommendations generated
- AC-7.5: Risk level assessed (low, medium, high)

### FR-8: Financial Literacy Content
**Priority**: Medium  
**Status**: ✅ Implemented

**Acceptance Criteria**:
- AC-8.1: 15-week course content stored in Firestore
- AC-8.2: Modules grouped by topic
- AC-8.3: Interactive quizzes with instant feedback
- AC-8.4: Progress tracking per user
- AC-8.5: Content accessible via dashboard

### FR-9: Business Types Library
**Priority**: Medium  
**Status**: ✅ Implemented

**Acceptance Criteria**:
- AC-9.1: 25+ business categories with maturity levels
- AC-9.2: SWOT analysis for each level
- AC-9.3: Roadmap to next level
- AC-9.4: Searchable and filterable
- AC-9.5: Importable from Google Drive

### FR-10: Admin Dashboard
**Priority**: High  
**Status**: ✅ Implemented

**Acceptance Criteria**:
- AC-10.1: Responsive design (mobile and desktop)
- AC-10.2: Real-time data updates
- AC-10.3: Consistent navigation across pages
- AC-10.4: Enterprise-grade UI with gradients
- AC-10.5: Accessible (WCAG AA compliance)

## Non-Functional Requirements

### NFR-1: Performance
- Response time < 2s for text messages
- Response time < 10s for image analysis
- API response time < 500ms
- Dashboard load time < 1s
- Support 1000+ concurrent users

### NFR-2: Scalability
- Auto-scale from 0 to 100 instances
- Handle 10,000+ registered users
- Process 1,000+ messages per day
- Store unlimited transaction history
- Support 100+ Majelis groups

### NFR-3: Reliability
- 99.9% uptime SLA
- Automatic failover on errors
- Graceful degradation on AI failure
- Data backup every 24 hours
- Disaster recovery plan

### NFR-4: Security
- Input validation and sanitization
- Spam detection and filtering
- Topic filtering (politics, religion, etc.)
- Secure API authentication
- Firestore security rules
- No PII in logs

### NFR-5: Usability
- Natural language interface (Bahasa Indonesia)
- Simple dashboard UI
- Mobile-first design
- Consistent navigation
- Clear error messages

### NFR-6: Maintainability
- Modular architecture (SOLID principles)
- Comprehensive documentation
- Automated testing
- Version control (Git)
- CI/CD pipeline

### NFR-7: Compliance
- GDPR-compliant data handling
- Indonesian data residency (Jakarta region)
- Audit logging for sensitive operations
- User consent for data collection
- Right to deletion

## User Stories

### US-1: New User Registration
**As a** UMKM member  
**I want to** register via WhatsApp  
**So that** I can access financial literacy content

**Acceptance Criteria**:
- Given I send a message with my name, business, and location
- When the AI processes my message
- Then I receive a confirmation and my profile is created

### US-2: Check Loan Status
**As a** verified UMKM member  
**I want to** check my loan balance  
**So that** I know how much I can borrow

**Acceptance Criteria**:
- Given I send "cek data" command
- When the bot retrieves my profile
- Then I see my loan limit, used amount, and next payment

### US-3: Upload Business Photo
**As a** UMKM member  
**I want to** upload photos of my business  
**So that** I can get AI insights and improve my credit score

**Acceptance Criteria**:
- Given I send a photo of my store or inventory
- When the AI analyzes the image
- Then I receive insights and my credit score is updated

### US-4: Verify New User
**As a** field agent  
**I want to** approve or reject new registrations  
**So that** only legitimate users access the system

**Acceptance Criteria**:
- Given I open the dashboard
- When I see pending users
- Then I can approve or reject with one click

### US-5: Manage Majelis
**As a** field agent  
**I want to** create and manage Majelis groups  
**So that** members are organized by schedule and location

**Acceptance Criteria**:
- Given I open the Majelis page
- When I create a new group
- Then I can add members and set schedule

## Out of Scope

The following features are explicitly out of scope for v1.0:

1. **Voice Messages**: Audio processing not supported
2. **Video Messages**: Video analysis not supported
3. **Payment Processing**: No direct payment integration
4. **Multi-language**: Only Bahasa Indonesia supported
5. **Mobile App**: Web dashboard only (no native app)
6. **Offline Mode**: Requires internet connection
7. **Advanced Analytics**: Basic reporting only
8. **Third-party Integrations**: No external API integrations
9. **Custom Branding**: Fixed Amartha branding
10. **White-label**: Not available for other organizations

## Success Metrics

### Key Performance Indicators (KPIs)

1. **User Adoption**
   - Target: 1,000 registered users in 3 months
   - Metric: Total registered users
   - Measurement: Firestore user count

2. **Engagement Rate**
   - Target: 60% weekly active users
   - Metric: Users sending messages per week
   - Measurement: Message logs analysis

3. **Verification Rate**
   - Target: 80% of registrations verified within 48 hours
   - Metric: Time from registration to verification
   - Measurement: Timestamp difference

4. **Response Accuracy**
   - Target: 90% user satisfaction
   - Metric: Positive feedback vs total interactions
   - Measurement: User surveys

5. **System Uptime**
   - Target: 99.9% availability
   - Metric: Uptime percentage
   - Measurement: Cloud Run monitoring

6. **Image Analysis Adoption**
   - Target: 50% of users upload at least 1 photo
   - Metric: Users with business intelligence data
   - Measurement: Firestore BI collection count

## Constraints

### Technical Constraints
- Must use Google Cloud Platform (GCP)
- Must integrate with WhatsApp Business API
- Must use Gemini AI (no other LLMs)
- Must store data in Firestore (no other databases)
- Must deploy to Cloud Run (no VMs or Kubernetes)

### Business Constraints
- Budget: $500/month for cloud services
- Timeline: 3 months for v1.0 launch
- Team: 2 developers, 1 designer
- Support: Indonesian language only
- Region: Indonesia (Jakarta) only

### Regulatory Constraints
- Data must reside in Indonesia
- Must comply with Indonesian data protection laws
- Must obtain user consent for data collection
- Must provide data deletion on request
- Must maintain audit logs for 1 year

## Dependencies

### External Services
1. **WhatsApp Business API** - Message delivery
2. **Google Gemini API** - AI processing
3. **Google Cloud Firestore** - Database
4. **Google Cloud Run** - Hosting
5. **Google Cloud Storage** - Backups

### Internal Dependencies
1. **Field Agent Training** - BP must be trained on dashboard
2. **Content Creation** - Financial literacy content must be ready
3. **Business Types Data** - Classification data must be imported
4. **User Consent Forms** - Legal documents must be prepared

## Risks and Mitigation

### Risk 1: AI Hallucination
**Impact**: High  
**Probability**: Medium  
**Mitigation**: Input validation, topic filtering, fallback responses

### Risk 2: WhatsApp API Changes
**Impact**: High  
**Probability**: Low  
**Mitigation**: Monitor API updates, maintain backward compatibility

### Risk 3: Data Privacy Breach
**Impact**: Critical  
**Probability**: Low  
**Mitigation**: Security rules, encryption, audit logging, penetration testing

### Risk 4: Scalability Issues
**Impact**: Medium  
**Probability**: Medium  
**Mitigation**: Load testing, auto-scaling, caching, optimization

### Risk 5: User Adoption Failure
**Impact**: High  
**Probability**: Medium  
**Mitigation**: User training, onboarding flow, feedback collection

## Glossary

- **UMKM**: Usaha Mikro, Kecil, dan Menengah (Micro, Small, and Medium Enterprises)
- **Majelis**: Weekly group meeting for UMKM members
- **BP**: Business Partner (Amartha field agent)
- **RAG**: Retrieval-Augmented Generation (AI technique)
- **Tanggung Renteng**: Joint liability system in microfinance
- **A-Score**: Amartha credit score
- **Poket**: Digital wallet in AmarthaFin app

---

**Version**: 1.0  
**Last Updated**: 2025-11-23  
**Status**: Active Development
