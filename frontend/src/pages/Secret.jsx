import { h } from 'preact';
import { Trophy, Target, Lightbulb, AlertTriangle, Sparkles, Zap, Heart, Clock, Users, Star, CheckCircle, Coffee, Moon } from 'lucide-preact';

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
