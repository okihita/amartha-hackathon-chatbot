import { h } from 'preact';
import { Trophy, Target, Lightbulb, AlertTriangle, Sparkles, Zap, Heart, Clock, Users, Star, CheckCircle, Coffee, Moon, BarChart } from 'lucide-preact';

// JUDGES - Know your audience!
const JUDGES = [
  { name: 'Andi Taufan Garuda Putra', role: 'Founder & CEO @ Amartha', tip: 'Focus on IMPACT - how many lives can this change? He built Amartha to fight poverty.' },
  { name: 'William Notowidagdo', role: 'SVP of Engineering @ Amartha', tip: 'Technical depth matters. Show clean architecture, scalability, security considerations.' },
  { name: 'Riza Fahmi', role: 'Co-Founder @ HACKTIV8, GDE Web', tip: 'Code quality & developer experience. He teaches coding - show you know best practices.' },
];

// MENTORS - Use them wisely!
const KEY_MENTORS = [
  { name: 'Alexander Li', role: 'Head of Engineering @ Amartha', focus: 'Architecture, scalability' },
  { name: 'Muhammad Rofi Hidayat', role: 'Sr. Lead Data Scientist @ Amartha', focus: 'AI/ML implementation' },
  { name: 'Ruben Elkana', role: 'Sr. Product Manager @ Amartha', focus: 'Product-market fit, user stories' },
  { name: 'Angga Agia Wardhana', role: 'GDE Workspace, GDG Cloud', focus: 'Google Cloud services' },
];

// HARD QUESTIONS tailored to judges
const HARD_QUESTIONS = [
  { q: "How does this scale to Amartha's 1M+ users?", a: "Firestore auto-scales horizontally. Cloud Run scales 0-1000 instances. Quiz sessions can move to Redis for high concurrency. WhatsApp API handles rate limiting natively.", judge: 'William' },
  { q: "What's the business impact / ROI?", a: "Higher engagement → better financial literacy → lower default rates → reduced NPL. Also enables upselling: users who complete 15 weeks are prime candidates for larger loans.", judge: 'Taufan' },
  { q: "How do you ensure AI doesn't give bad financial advice?", a: "RAG retrieval grounds responses in Amartha's approved curriculum. System prompt restricts topics. No investment recommendations - purely educational.", judge: 'Riza' },
  { q: "What about offline/low connectivity in rural areas?", a: "WhatsApp handles message queuing natively. No app download needed. Works on basic phones. Users get responses when back online.", judge: 'Taufan' },
  { q: "How do you measure success?", a: "Quiz completion rates, loan repayment correlation, user engagement frequency, BI submission rates, majelis attendance tracking.", judge: 'William' },
  { q: "What's unique vs other chatbots?", a: "Integrated with loan system, image analysis for BI, gamified 15-week curriculum, majelis group management, real-time dashboard sync via SSE.", judge: 'Riza' },
  { q: "Cost per user?", a: "Gemini ~$0.001/msg, Cloud Run ~$0.00001/req, Firestore ~$0.0001/read. Total <$0.01/user/month. At 1M users = ~$10K/month.", judge: 'William' },
  { q: "Data privacy / compliance?", a: "Data in GCP Indonesia region. Users consent via WhatsApp. No PII in logs. Can implement GDPR deletion on request.", judge: 'William' },
  { q: "Why WhatsApp vs custom app?", a: "95% smartphone penetration in Indonesia uses WhatsApp. Zero friction - no download, no learning curve. Meets users where they already are.", judge: 'Taufan' },
  { q: "How do you prevent gaming/fraud?", a: "Demo has fraud flags. Production would track: rapid quiz completion, suspicious BI patterns, location mismatches, anomaly detection.", judge: 'William' },
];

// TIMELINE - Critical moments
const TIMELINE = [
  { time: '10:00', event: 'Registration & Lunch', action: 'Arrive EARLY. Set up workspace. Test WiFi.' },
  { time: '13:15', event: 'Opening', action: 'Listen for any rule changes or hints from CEO/CTO speech.' },
  { time: '13:30', event: 'Hackathon Start', action: 'Already have code ready. Focus on polish & demo prep.' },
  { time: '18:00', event: 'Dinner + Mentoring 1', action: '⭐ CRITICAL: Get feedback from Alexander Li or Rofi on AI implementation.' },
  { time: '22:00', event: 'Late Night Hack', action: 'Fix bugs, prepare demo script, practice pitch.' },
  { time: '08:00', event: 'Day 2 Breakfast', action: 'Rest well. Fresh mind for final push.' },
  { time: '10:00', event: 'Mentoring 2', action: '⭐ LAST CHANCE: Get final feedback, fix critical issues.' },
  { time: '13:00', event: 'Hackathon End', action: 'STOP CODING. Focus 100% on presentation.' },
  { time: '13:30', event: 'Demo & Judging', action: '10 mins per team. Be READY when called.' },
  { time: '16:30', event: 'Winner Announcement', action: '🏆 VICTORY!' },
];

// WINNING STRATEGIES
const STRATEGIES = [
  { icon: '🎯', title: "Lead with Taufan's Mission", tip: "Open with: 'We help Amartha's 1M+ micro-entrepreneurs escape poverty through AI-powered financial literacy.' This is HIS life's work." },
  { icon: '📊', title: "Show Real Numbers", tip: "15-week curriculum, 25 business categories, 5 maturity levels, 225 quiz questions, real-time BI analysis. Concrete > Abstract." },
  { icon: '🔥', title: "Live Demo is KING", tip: "Registration → Quiz → Image Analysis → Dashboard SSE update. Show the MAGIC of real-time sync!" },
  { icon: '💡', title: "Technical Depth for William", tip: "Mention: Gemini 2.5 Flash tool calling, RAG retrieval, SSE real-time, SOLID architecture, rate limiting, input validation." },
  { icon: '🎭', title: "Emotional Story Arc", tip: "Start with /demo:baru (struggling new user) → Show journey → End with /demo:lulus (graduated success). Make judges FEEL the impact." },
  { icon: '⚡', title: "Speed = Confidence", tip: "Pre-load everything. Demo commands ready to paste. Every second of smooth demo = trust in your competence." },
  { icon: '🏆', title: "Close with Vision", tip: "End: 'This isn't just a chatbot - it's a pathway out of poverty. With Amartha's reach, we can transform millions of lives.'" },
];

// DEMO FLOW - Exact script
const DEMO_SCRIPT = [
  { step: 1, action: 'Open Dashboard + WhatsApp side by side', speak: '"Let me show you Akademi-AI in action."' },
  { step: 2, action: 'Send /demo:baru', speak: '"Meet Siti, a new micro-entrepreneur with zero financial literacy."' },
  { step: 3, action: 'Show dashboard - user appears', speak: '"Real-time sync - field agents see new registrations instantly."' },
  { step: 4, action: 'Send "kuis"', speak: '"Siti starts her financial literacy journey with interactive quizzes."' },
  { step: 5, action: 'Answer 2 questions', speak: '"Gamified learning - she needs 100% to pass each week."' },
  { step: 6, action: 'Send photo with caption', speak: '"She can also send business photos for AI analysis."' },
  { step: 7, action: 'Show BI card with NEW badge', speak: '"Dashboard updates in real-time with extracted business intelligence."' },
  { step: 8, action: 'Send "cek data"', speak: '"Siti can check her profile, loan status, and progress anytime."' },
  { step: 9, action: 'Show /demo:lulus user', speak: '"After 15 weeks, she graduates - financially literate and loan-ready."' },
  { step: 10, action: 'Close', speak: '"This is how we transform 1 million Sitis into empowered entrepreneurs."' },
];

// DATA ANALYTICS Q&A - Thorough preparation for judges
const ANALYTICS_QA = [
  {
    question: "How did you choose which data to analyze from the dataset?",
    context: "Judges want to see your data discovery and prioritization process.",
    best: "I started by profiling all 5 CSV files to understand their structure. I identified that loan_snapshots.csv has DPD (Days Past Due) which is the key delinquency indicator. bills.csv with 599K records gives payment behavior history. I prioritized these because payment history is the #1 predictor of default in credit risk literature. The GPS data in tasks.csv was a bonus for operational insights.",
    okay: "I looked at the files and picked the ones with the most useful columns like DPD and payment dates.",
    bad: "I just loaded all the data and ran some calculations on it."
  },
  {
    question: "Why did you choose these specific metrics for risk prediction?",
    context: "Tests your understanding of credit risk fundamentals.",
    best: "I selected 4 factors based on credit scoring best practices: (1) Payment ratio - historical discipline, (2) Late ratio - behavioral pattern, (3) DPD - current status, (4) Business type - income stability proxy. These map to the 5 C's of credit: Character (payment history), Capacity (business type), and Conditions (current DPD). I weighted them based on predictive power - payment history gets 30 points because it's the strongest predictor.",
    okay: "I picked metrics that seemed related to whether someone would pay back their loan.",
    bad: "I just used all the numbers available in the dataset."
  },
  {
    question: "How accurate is your risk prediction model?",
    context: "Tests your understanding of model validation.",
    best: "This is a rule-based scoring model, not ML, so accuracy isn't measured traditionally. However, I validated it by checking that high-risk customers (score 80+) have avg DPD of 90+ days and payment ratio under 30%, while low-risk (score <30) have 0 DPD and 90%+ payment ratio. The model correctly separates these populations. For production, I'd train a logistic regression on historical defaults and measure AUC-ROC.",
    okay: "I checked that customers with high scores have bad payment history.",
    bad: "I didn't test it, but the formula makes sense."
  },
  {
    question: "What insights did you find that surprised you?",
    context: "Shows depth of analysis and curiosity.",
    best: "Three surprises: (1) 18% late payment rate is higher than I expected for microfinance - indicates cash flow timing issues. (2) Farming businesses have 15% higher risk scores than retail, likely due to seasonal income. (3) Some branches have 5+ hour delays between scheduled and actual visits - huge operational inefficiency. These insights directly inform interventions: flexible payment dates for farmers, route optimization for field agents.",
    okay: "I found that some customers pay late more often than others.",
    bad: "Nothing really surprised me, the data was pretty straightforward."
  },
  {
    question: "How would you improve this analysis with more time?",
    context: "Shows you understand limitations and have vision.",
    best: "Three improvements: (1) Train actual ML model (XGBoost/LightGBM) on historical defaults for better accuracy. (2) Add time-series analysis - predict WHEN a customer will default, not just IF. (3) Incorporate the 200 images - use Gemini Vision to extract business health indicators and correlate with default rates. (4) Build a recommendation engine that suggests specific interventions per customer segment.",
    okay: "I would add more features and maybe use machine learning.",
    bad: "I think it's pretty complete already."
  },
  {
    question: "How does your segmentation help field agents?",
    context: "Tests practical business application.",
    best: "Each segment has specific, actionable recommendations. Star Performers (8,900 customers) - don't waste time visiting, offer loan increases remotely. High Risk (1,400) - prioritize for immediate visits, bring restructuring options. Needs Attention (300) - send payment reminders 3 days before due date. This lets field agents focus their limited time on customers who need intervention most, potentially increasing collection efficiency by 30%.",
    okay: "Field agents can see which customers are risky and visit them first.",
    bad: "It shows different groups of customers."
  },
  {
    question: "What's the business value of your route analysis?",
    context: "Tests ROI thinking.",
    best: "Branches with 'Poor' efficiency have 5+ hour delays and high geographic spread. If a field agent does 10 visits/day and wastes 2 hours on travel, that's 20% productivity loss. With 160K tasks/year, optimizing routes could save 32K hours annually. At Rp 50K/hour, that's Rp 1.6B in savings. Plus faster collections improve cash flow and reduce defaults.",
    okay: "Field agents can plan better routes and save time.",
    bad: "It shows where the visits are on a map."
  },
  {
    question: "How did you handle data quality issues?",
    context: "Shows attention to detail and engineering rigor.",
    best: "I found several issues: (1) Some GPS coordinates were 0,0 or invalid - filtered these out before analysis. (2) Some bills had no paid_date but had paid_amount - treated as unpaid. (3) Customer IDs are hashed - joined tables using loan_id as intermediate key. (4) Business purpose field had inconsistent naming - used keyword matching (contains 'warung' OR 'dagang' → retail) for categorization.",
    okay: "I filtered out rows with missing data.",
    bad: "The data was clean, I didn't have any issues."
  },
  {
    question: "Why didn't you use machine learning for predictions?",
    context: "Tests pragmatism vs over-engineering.",
    best: "For a hackathon with limited time, a rule-based model was the right choice. It's interpretable - I can explain exactly why a customer is high risk. It's fast to implement and doesn't need training data split. For production, I'd use ML, but the rule-based model actually performs well for this use case because the features (payment ratio, DPD) have clear, monotonic relationships with default risk.",
    okay: "I didn't have enough time to train a machine learning model.",
    bad: "Machine learning is overkill for this problem."
  },
  {
    question: "How would this scale to Amartha's full dataset?",
    context: "Tests production thinking.",
    best: "Current implementation loads CSVs into memory - works for 12K customers but not 1M+. For production: (1) Move to BigQuery for analytics queries. (2) Pre-compute risk scores nightly and store in Firestore. (3) Use Cloud Functions for on-demand recalculation. (4) Add caching layer (Redis) for dashboard. The scoring logic itself is O(1) per customer, so computation scales linearly.",
    okay: "I would use a database instead of loading files into memory.",
    bad: "It should work fine, Node.js can handle a lot of data."
  },
  {
    question: "What ethical considerations did you think about?",
    context: "Shows maturity and responsibility.",
    best: "Three considerations: (1) Bias - business type scoring could disadvantage farmers unfairly; I'd validate this doesn't create discriminatory outcomes. (2) Transparency - borrowers should understand why they're flagged high-risk. (3) Privacy - customer IDs are hashed, but combined data could still identify individuals; need proper access controls. I'd recommend an ethics review before production deployment.",
    okay: "I made sure not to use any personal information directly.",
    bad: "I didn't think about ethics, it's just data analysis."
  },
  {
    question: "How do you validate that your insights are actionable?",
    context: "Tests practical impact thinking.",
    best: "I designed each insight with a specific action in mind. Risk prediction → field agent visit prioritization. Payment trends → seasonal payment flexibility. Segmentation → targeted literacy content. Route analysis → visit scheduling optimization. The test is: can a field agent or credit analyst DO something different tomorrow based on this insight? If yes, it's actionable.",
    okay: "The insights show useful information that people can use.",
    bad: "The data speaks for itself."
  }
];

// PRE-DEMO CHECKLIST
const CHECKLIST = [
  '✅ Dashboard open: /demo page',
  '✅ WhatsApp open on phone',
  '✅ /demo:reset sent (clean slate)',
  '✅ Demo commands copied',
  '✅ Backup screenshots ready',
  '✅ Phone charged > 80%',
  '✅ Internet tested & stable',
  '✅ Pitch script memorized',
  '✅ Timer set for 9 minutes',
  '✅ Water bottle ready',
];

export default function Secret() {
  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px', padding: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', color: '#fff' }}>
        <Trophy size={48} style={{ marginBottom: '12px' }} />
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>🏆 War Room: Amartha x GDG Hackathon 🏆</h1>
        <p style={{ margin: 0, opacity: 0.9 }}>Nov 28-29, 2025 • Amartha Village • TOP 15 FINALIST</p>
      </div>

      {/* Motivation */}
      <div style={{ background: 'linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)', padding: '24px', borderRadius: '12px', marginBottom: '24px', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Heart size={28} />
          <h2 style={{ margin: 0 }}>You're Already in the TOP 15! 🔥</h2>
        </div>
        <p style={{ margin: 0, lineHeight: 1.8, fontSize: '15px' }}>
          Out of ALL the teams that applied, YOU made it to the finals. Your idea is validated. Your code works. 
          Now it's about <strong>execution and presentation</strong>. The judges want to be impressed - give them a reason to pick YOU.
          <br/><br/>
          Remember: <strong>Andi Taufan built Amartha to fight poverty</strong>. Show him how YOUR solution amplifies that mission. 
          Make him see the faces of the millions of Ibus whose lives will change. That's how you win. 💪
        </p>
      </div>

      {/* Know Your Judges */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #e0e0e0' }}>
        <h2 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#1565c0' }}>
          <Star size={22} /> Know Your Judges
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {JUDGES.map((j, i) => (
            <div key={i} style={{ background: '#e3f2fd', padding: '14px', borderRadius: '8px', borderLeft: '4px solid #1976d2' }}>
              <div style={{ fontWeight: 700, color: '#1565c0', marginBottom: '4px' }}>{j.name}</div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>{j.role}</div>
              <div style={{ fontSize: '13px', color: '#333', lineHeight: 1.5 }}>💡 {j.tip}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div style={{ background: '#f3e5f5', padding: '20px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #ce93d8' }}>
        <h2 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#7b1fa2' }}>
          <Clock size={22} /> Critical Timeline
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '8px' }}>
          {TIMELINE.map((t, i) => (
            <div key={i} style={{ background: '#fff', padding: '10px 14px', borderRadius: '6px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ fontWeight: 700, color: '#7b1fa2', minWidth: '50px', fontSize: '13px' }}>{t.time}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px', color: '#333' }}>{t.event}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{t.action}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hard Questions */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #e0e0e0' }}>
        <h2 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#c62828' }}>
          <AlertTriangle size={22} /> Hard Questions & Killer Answers
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {HARD_QUESTIONS.map((item, i) => (
            <div key={i} style={{ background: '#fafafa', padding: '12px 14px', borderRadius: '6px', borderLeft: '4px solid #f44336' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <div style={{ fontWeight: 600, color: '#c62828', fontSize: '13px', flex: 1 }}>Q: {item.q}</div>
                <span style={{ background: '#e3f2fd', color: '#1565c0', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>{item.judge}</span>
              </div>
              <div style={{ color: '#333', fontSize: '12px', lineHeight: 1.6 }}>A: {item.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Winning Strategies */}
      <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #a5d6a7' }}>
        <h2 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#2e7d32' }}>
          <Target size={22} /> Winning Strategies
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
          {STRATEGIES.map((item, i) => (
            <div key={i} style={{ background: '#fff', padding: '14px', borderRadius: '6px', border: '1px solid #c8e6c9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '22px' }}>{item.icon}</span>
                <strong style={{ color: '#2e7d32', fontSize: '14px' }}>{item.title}</strong>
              </div>
              <div style={{ color: '#555', fontSize: '13px', lineHeight: 1.6 }}>{item.tip}</div>
            </div>
          ))}
        </div>
      </div>

      {/* DATA ANALYTICS Q&A - NEW SECTION */}
      <div style={{ background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)', padding: '24px', borderRadius: '12px', marginBottom: '24px', color: '#fff' }}>
        <h2 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart size={24} /> 📊 Data Analytics Deep Dive Q&A
        </h2>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
          Judges will probe your data analysis methodology. Here are 12 likely questions with Best / Okay / Bad answer examples.
        </p>
      </div>

      {ANALYTICS_QA.map((qa, i) => (
        <div key={i} style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e0e0e0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
            <div style={{ background: '#1a237e', color: '#fff', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
              {i + 1}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#1a237e', marginBottom: '4px' }}>
                "{qa.question}"
              </div>
              <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                {qa.context}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginLeft: '40px' }}>
            {/* Best Answer */}
            <div style={{ background: '#e8f5e9', padding: '12px 14px', borderRadius: '6px', borderLeft: '4px solid #4caf50' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ background: '#4caf50', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>✅ BEST ANSWER</span>
              </div>
              <div style={{ fontSize: '13px', color: '#2e7d32', lineHeight: 1.7 }}>{qa.best}</div>
            </div>

            {/* Okay Answer */}
            <div style={{ background: '#fff3e0', padding: '12px 14px', borderRadius: '6px', borderLeft: '4px solid #ff9800' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ background: '#ff9800', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>😐 OKAY ANSWER</span>
              </div>
              <div style={{ fontSize: '13px', color: '#e65100', lineHeight: 1.7 }}>{qa.okay}</div>
            </div>

            {/* Bad Answer */}
            <div style={{ background: '#ffebee', padding: '12px 14px', borderRadius: '6px', borderLeft: '4px solid #f44336' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ background: '#f44336', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>❌ BAD ANSWER</span>
              </div>
              <div style={{ fontSize: '13px', color: '#c62828', lineHeight: 1.7 }}>{qa.bad}</div>
            </div>
          </div>
        </div>
      ))}

      {/* Demo Script */}
      <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #ffcc80' }}>
        <h2 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#e65100' }}>
          <Sparkles size={22} /> 10-Minute Demo Script
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {DEMO_SCRIPT.map((s, i) => (
            <div key={i} style={{ background: '#fff', padding: '12px 14px', borderRadius: '6px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ background: '#ff9800', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>{s.step}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: '#333', marginBottom: '4px' }}>{s.action}</div>
                <div style={{ fontSize: '12px', color: '#e65100', fontStyle: 'italic' }}>{s.speak}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mentors to Target */}
      <div style={{ background: '#e0f7fa', padding: '20px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #80deea' }}>
        <h2 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#00838f' }}>
          <Users size={22} /> Key Mentors to Approach
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
          {KEY_MENTORS.map((m, i) => (
            <div key={i} style={{ background: '#fff', padding: '12px', borderRadius: '6px' }}>
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#00838f' }}>{m.name}</div>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px' }}>{m.role}</div>
              <div style={{ fontSize: '12px', color: '#333' }}>Ask about: <strong>{m.focus}</strong></div>
            </div>
          ))}
        </div>
      </div>

      {/* Pre-Demo Checklist */}
      <div style={{ background: '#fce4ec', padding: '20px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #f48fb1' }}>
        <h2 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#c2185b' }}>
          <CheckCircle size={22} /> Pre-Demo Checklist
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
          {CHECKLIST.map((item, i) => (
            <div key={i} style={{ padding: '8px 12px', background: '#fff', borderRadius: '4px' }}>{item}</div>
          ))}
        </div>
      </div>

      {/* Final Words */}
      <div style={{ textAlign: 'center', padding: '32px', background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', borderRadius: '12px', color: '#fff' }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '24px' }}>🌟 You've Got This! 🌟</h2>
        <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.8, maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
          You built something <strong>real</strong> that can change <strong>millions of lives</strong>.
          <br/><br/>
          Walk in there with confidence. You're not just presenting code - you're presenting a <strong>solution to poverty</strong>.
          <br/><br/>
          <strong>Now go WIN this thing! 🏆</strong>
        </p>
      </div>
    </div>
  );
}
