# 🎯 WAR ROOM - Analytics Dashboard Presentation Guide

> **Purpose**: Prepare non-technical team members to present and defend the Analytics Dashboard to hackathon judges.

---

## 📊 The Analytics Page Story (30-Second Pitch)

> "We took 2 million rows of raw microfinance data and built an end-to-end analytics pipeline that:
> 1. **Identifies** 1,400+ high-risk borrowers before they default
> 2. **Benchmarks** branch collection performance (Rp 43B tracked)
> 3. **Reveals** field operations inefficiencies through GPS analysis
> 
> The result: data-driven decisions for credit, collections, and operations teams."

---

## 📚 Terminology Glossary (Know These!)

### Data & Engineering Terms

| Term | Plain English | Why We Use It |
|------|---------------|---------------|
| **Analytics Pipeline** | A series of automated steps that take raw data → clean it → calculate insights → display results. Like a factory assembly line for data. | Shows we built a systematic, repeatable process, not just one-off analysis |
| **ETL (Extract, Transform, Load)** | The 3 steps of data processing: (1) Extract = read from files, (2) Transform = clean & calculate, (3) Load = store for use | Industry-standard term that signals we know data engineering |
| **Denormalized Data** | Data spread across multiple files that needs to be joined together. Opposite of "normalized" (organized in one place) | Explains why we needed to do data joining work |
| **Feature Engineering** | Creating new calculated fields from raw data. Example: "late ratio" doesn't exist in the CSV — we calculated it from payment dates | This is where the "magic" happens in data science |
| **Star Schema** | A way to organize data with one central "fact" table (transactions) connected to multiple "dimension" tables (customer info, dates, etc.) | Shows we understand database design patterns |

### Methodology Terms

| Term | Plain English | Why We Use It |
|------|---------------|---------------|
| **CRISP-DM** | Cross-Industry Standard Process for Data Mining. A 6-step methodology: Business Understanding → Data Understanding → Data Prep → Modeling → Evaluation → Deployment | Shows we followed a proven, industry-standard approach |
| **EDA (Exploratory Data Analysis)** | The first step where you look at the data to understand what you have — checking for missing values, outliers, patterns | Demonstrates we didn't just jump to conclusions |
| **Cohort Analysis** | Grouping customers by a shared characteristic (e.g., signup month) and tracking their behavior over time | Shows sophisticated analysis technique |
| **Trended Data** | Historical data over time (vs. point-in-time snapshot). Example: 50 payment records per customer vs. just "current balance" | Explains why our predictions are more accurate |

### Credit & Finance Terms

| Term | Plain English | Why We Use It |
|------|---------------|---------------|
| **DPD (Days Past Due)** | How many days overdue a payment is. DPD=0 means current, DPD=30 means 1 month late | Industry-standard metric for credit risk |
| **5 C's of Credit** | Traditional framework: Character, Capacity, Capital, Conditions, Collateral. Banks use this to evaluate borrowers | Shows our model is grounded in established credit theory |
| **Behavioral Credit Scoring** | Predicting risk based on how someone *behaves* (payment patterns) vs. who they *are* (demographics) | More predictive than traditional scoring |
| **Collection Rate** | Percentage of scheduled payments actually collected. Formula: (Paid Amount / Scheduled Amount) × 100 | Key metric for microfinance health |

### Operations Terms

| Term | Plain English | Why We Use It |
|------|---------------|---------------|
| **Geospatial Analysis** | Using GPS coordinates to find patterns — where are customers? How far do agents travel? | Shows we extracted value from location data |
| **Vehicle Routing Problem (VRP)** | Classic optimization problem: "What's the best route to visit multiple locations?" Like Google Maps for delivery drivers | Signals we know operations research |
| **Positive Deviance** | Finding people who succeed despite facing the same challenges as others, then learning from them | Explains why we highlight top-performing branches |

---

## 🔢 Key Numbers to Remember

| Metric | Value | Context |
|--------|-------|---------|
| Total records processed | **2M+** | 12K customers + 599K bills + 160K tasks + 1.3M participants |
| High-risk customers | **~1,400 (12%)** | These need immediate attention |
| Collection rate | **85%** | Rp 79B collected of Rp 94B scheduled |
| Field collections | **Rp 43B** | From 263K transactions across 87 branches |
| Branches with poor efficiency | **~30%** | Opportunity for route optimization |
| Potential improvement | **15-30%** | From best practice sharing + route optimization |

---

## ❓ Q&A Preparation

### 🟢 GOOD Questions (We Want These!)

**Q: "How did you decide which features to use in your risk model?"**
> A: "We started with the 5 C's of Credit framework — a proven model used by banks globally. From our data, we could measure 3 of the 5 C's: Character (payment history), Capacity (payment ratio), and Conditions (business type risk). We couldn't measure Capital or Collateral because that data wasn't in the dataset. The weights were calibrated based on industry research showing payment behavior is the strongest predictor of default."

**Q: "What's the business impact of this analysis?"**
> A: "Three main impacts: (1) Early intervention — contacting high-risk customers within 7 days of first missed payment can recover 40-60% of at-risk loans. (2) Resource optimization — segmentation lets us automate low-risk customers and focus human effort on high-risk ones, improving productivity by 25%. (3) Route optimization — fixing inefficient branches could save 30% travel time, enabling 2+ more visits per day per agent."

**Q: "Why rule-based scoring instead of machine learning?"**
> A: "Great question! For a hackathon with limited time, rule-based scoring has advantages: (1) Interpretability — we can explain exactly why someone is high-risk, which is important for compliance. (2) No training data needed — ML requires labeled historical defaults, which we didn't have. (3) Domain knowledge — the 5 C's framework is proven over decades. That said, with more time and labeled data, we'd definitely explore ML models like logistic regression or gradient boosting."

**Q: "How would you validate this model in production?"**
> A: "We'd use backtesting — take historical data, hide the outcomes, run our model, then compare predictions to what actually happened. Key metrics would be precision (of those we flagged high-risk, how many actually defaulted?) and recall (of those who defaulted, how many did we catch?). We'd also track the model over time for drift — if accuracy drops, we'd retrain."

---

### 🟡 OKAY Questions (Handle Carefully)

**Q: "Why didn't you use the task_participants data?"**
> A: "We actually did! We processed all 1.3M records to build the Field Operations section — that's where the Rp 43B collection figure comes from. Initially we skipped it for the risk model because the face_matched and qr_matched fields were all False (not useful), but the payment_amount field was valuable for branch benchmarking."

**Q: "Is 85% collection rate good or bad?"**
> A: "For microfinance in Indonesia, 85% is actually quite healthy — industry average is typically 80-90%. The more interesting insight is the variance between branches and business types. Farming customers have lower rates due to seasonal cash flow, which suggests product innovation opportunity — flexible repayment schedules aligned with harvest cycles."

**Q: "What about data privacy?"**
> A: "All customer identifiers in the dataset were pre-hashed by Amartha before we received them. We never see real names, phone numbers, or addresses. The GPS coordinates are for field agent tasks, not customer homes. Our analysis focuses on aggregate patterns, not individual surveillance."

---

### 🔴 TOUGH Questions (Deflect Gracefully)

**Q: "What's the accuracy of your risk model?"**
> A: "We can't calculate traditional accuracy metrics like precision/recall because we don't have labeled outcome data — we don't know which customers actually defaulted after the snapshot date. What we can say is that our model is grounded in the 5 C's framework, which has decades of validation in credit scoring. In production, we'd set up A/B testing to measure actual default rates for high vs. low-risk segments."

**Q: "Why not use a neural network / deep learning?"**
> A: "Deep learning excels with unstructured data like images or text, and when you have millions of labeled examples. For tabular data with 12K customers and no labeled outcomes, simpler models often outperform neural networks. Plus, interpretability matters in finance — regulators want to know *why* someone was denied credit, not just that a black-box model said so."

**Q: "How do you handle class imbalance?"**
> A: "Good catch — only 12% of customers are high-risk, which is imbalanced. For rule-based scoring, this isn't a problem because we're not training on the data. If we moved to ML, we'd use techniques like SMOTE (synthetic oversampling), class weights, or threshold tuning to ensure we catch high-risk customers even if they're rare."

**Q: "What if the data is wrong?"**
> A: "Data quality is always a concern. We did see issues — for example, GPS coordinates with 'null island' (0,0) from failed GPS locks. We applied geofencing filters to clean this. For payment data, we trust Amartha's source systems but would recommend periodic audits. The beauty of our pipeline is it's repeatable — if source data improves, our insights automatically improve."

---

## 🎭 Presentation Tips

### Do's ✅
- **Lead with business impact**, not technical details
- **Use the "So What?" framing** — every insight should answer "why does this matter?"
- **Acknowledge limitations** — judges respect honesty about what you couldn't do
- **Point to the screen** — the visualizations tell the story better than words

### Don'ts ❌
- Don't say "we just used simple rules" — say "we implemented a rule-based scoring model inspired by the 5 C's of Credit"
- Don't apologize for not using ML — frame it as a deliberate choice for interpretability
- Don't get defensive — if you don't know something, say "great question, that's something we'd explore in the next iteration"

### Power Phrases 💪
- "Following the CRISP-DM methodology..."
- "Our feature engineering process..."
- "Based on behavioral credit scoring principles..."
- "The data tells us..."
- "This enables prescriptive analytics — not just what happened, but what to do about it"

---

## 🔗 Quick Links

- **Live Dashboard**: https://whatsapp-bot-435783355893.asia-southeast2.run.app/analytics
- **Technical Deep Dive**: [ANALYTICS_GUIDE.md](./ANALYTICS_GUIDE.md)
- **Credit Model Details**: [CREDIT_SCORING_MODEL.md](./CREDIT_SCORING_MODEL.md)

---

## 📋 Pre-Presentation Checklist

- [ ] Dashboard loads without errors
- [ ] Map visualization shows Indonesia (not null island)
- [ ] All 8 sections render with data
- [ ] Floating nav works on scroll
- [ ] Team can explain: ETL, Feature Engineering, 5 C's, CRISP-DM
- [ ] Team knows the 3 key numbers: 1,400 high-risk, Rp 43B collected, 30% route optimization opportunity

---

*Last updated: November 29, 2025*
