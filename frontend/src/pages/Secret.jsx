import { h } from 'preact';
import { Trophy, Target, Lightbulb, AlertTriangle, Sparkles, MessageSquare, Zap, Heart } from 'lucide-preact';

const HARD_QUESTIONS = [
  { q: "How does this scale to millions of users?", a: "Firestore auto-scales, Cloud Run scales to 0-1000 instances. Quiz sessions are in-memory but can move to Redis. WhatsApp API handles rate limiting." },
  { q: "What's the business model / monetization?", a: "Amartha already has loan products. This increases engagement → better repayment rates → lower default risk. Also enables upselling financial products." },
  { q: "How do you handle offline/low connectivity users?", a: "WhatsApp handles message queuing natively. Users get responses when back online. No app download needed - works on any phone with WhatsApp." },
  { q: "What about data privacy / GDPR compliance?", a: "Data stored in GCP Indonesia region. Users consent via WhatsApp interaction. No sensitive data in logs. Can implement data deletion on request." },
  { q: "How accurate is the AI for financial advice?", a: "AI is constrained to Amartha's curriculum only - no hallucination on financial advice. RAG retrieval ensures responses are grounded in approved content." },
  { q: "What if AI gives wrong financial advice?", a: "System prompt restricts to predefined topics. AI can't recommend specific investments. All advice is educational, not financial planning." },
  { q: "How do you measure success / KPIs?", a: "Quiz completion rates, loan repayment correlation, user engagement frequency, BI data submission rates, majelis attendance." },
  { q: "What's unique vs other chatbots?", a: "Integrated with Amartha's loan system, image analysis for business intelligence, gamified 15-week curriculum, majelis group management." },
  { q: "How do you prevent fraud/gaming the system?", a: "Demo has fraud detection flags. Real system would track anomalies: rapid quiz completion, suspicious BI patterns, location mismatches." },
  { q: "What's the cost per user?", a: "Gemini API ~$0.001/message, Cloud Run ~$0.00001/request, Firestore ~$0.0001/read. Total <$0.01/user/month for active users." },
];

const WINNING_TIPS = [
  { icon: '🎯', title: "Lead with Impact", tip: "Start pitch with: 'We help 1M+ Indonesian micro-entrepreneurs escape poverty through AI-powered financial literacy'" },
  { icon: '📊', title: "Show Real Numbers", tip: "Mention: 15-week curriculum, 25 business categories, 5 maturity levels, real-time BI analysis" },
  { icon: '🔥', title: "Live Demo Flow", tip: "Registration → Quiz → Image Analysis → Dashboard update. Show SSE real-time sync!" },
  { icon: '💡', title: "Technical Depth", tip: "Mention: Gemini 2.5 Flash, tool calling, RAG retrieval, SSE for real-time, SOLID architecture" },
  { icon: '🎭', title: "Use Demo Personas", tip: "Show /demo:warung+krisis for struggling user, then /demo:lulus for success story - emotional contrast" },
  { icon: '⚡', title: "Speed Matters", tip: "Pre-load dashboard, have demo commands ready to paste. Every second counts in demo." },
  { icon: '🏆', title: "End Strong", tip: "Close with: 'This isn't just a chatbot - it's a pathway out of poverty for millions of families'" },
];

const IMPRESS_JUDGES = [
  "Ask judges: 'Would you like to try it yourself?' - Hand them your phone with WhatsApp open",
  "Mention Google Cloud services used: Cloud Run, Firestore, Gemini API, Cloud Build",
  "Show the code architecture briefly - SOLID principles, clean separation of concerns",
  "Highlight accessibility: Works on basic phones, no app install, Indonesian language",
  "Connect to UN SDGs: Financial inclusion, poverty reduction, quality education",
  "Show dashboard real-time update when sending WhatsApp - judges love live demos",
  "Have backup: Screenshots/video ready if WhatsApp or internet fails",
  "Mention security: Rate limiting, input validation, no PII in logs",
];

export default function Secret() {
  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px', padding: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', color: '#fff' }}>
        <Trophy size={48} style={{ marginBottom: '12px' }} />
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>🏆 Secret War Room 🏆</h1>
        <p style={{ margin: 0, opacity: 0.9 }}>Let's WIN this hackathon! 💪</p>
      </div>

      {/* Motivation */}
      <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '8px', marginBottom: '24px', border: '2px solid #ff9800' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <Heart size={24} color="#ff5722" />
          <h2 style={{ margin: 0, color: '#e65100' }}>You've Got This! 🔥</h2>
        </div>
        <p style={{ margin: 0, lineHeight: 1.8, color: '#5d4037' }}>
          You built something <strong>real</strong> that can help <strong>millions</strong> of Indonesian families. 
          The tech is solid, the demo is polished, and the impact is undeniable. 
          Walk in there with confidence - you're not just presenting a project, you're presenting a <strong>solution to poverty</strong>.
          The judges will see your passion. Now go show them what you've built! 🚀
        </p>
      </div>

      {/* Hard Questions */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #e0e0e0' }}>
        <h2 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#c62828' }}>
          <AlertTriangle size={22} /> Hard Questions & Answers
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {HARD_QUESTIONS.map((item, i) => (
            <div key={i} style={{ background: '#fafafa', padding: '14px', borderRadius: '6px', borderLeft: '4px solid #f44336' }}>
              <div style={{ fontWeight: 600, color: '#c62828', marginBottom: '6px', fontSize: '14px' }}>Q: {item.q}</div>
              <div style={{ color: '#333', fontSize: '13px', lineHeight: 1.6 }}>A: {item.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Winning Tips */}
      <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #a5d6a7' }}>
        <h2 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#2e7d32' }}>
          <Target size={22} /> Winning Strategies
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {WINNING_TIPS.map((item, i) => (
            <div key={i} style={{ background: '#fff', padding: '14px', borderRadius: '6px', border: '1px solid #c8e6c9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                <strong style={{ color: '#2e7d32', fontSize: '14px' }}>{item.title}</strong>
              </div>
              <div style={{ color: '#555', fontSize: '13px', lineHeight: 1.5 }}>{item.tip}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Impress Judges */}
      <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #90caf9' }}>
        <h2 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#1565c0' }}>
          <Sparkles size={22} /> Pro Tips to Impress
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {IMPRESS_JUDGES.map((tip, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', background: '#fff', borderRadius: '6px' }}>
              <Zap size={16} color="#1976d2" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ color: '#333', fontSize: '13px', lineHeight: 1.5 }}>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Demo Checklist */}
      <div style={{ background: '#fce4ec', padding: '20px', borderRadius: '8px', border: '1px solid #f48fb1' }}>
        <h2 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#c2185b' }}>
          <Lightbulb size={22} /> Pre-Demo Checklist
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
          {[
            '✅ Dashboard open in browser',
            '✅ WhatsApp open on phone',
            '✅ Demo commands copied & ready',
            '✅ /demo:reset sent (clean slate)',
            '✅ Internet connection stable',
            '✅ Phone charged > 50%',
            '✅ Backup screenshots ready',
            '✅ Pitch script memorized',
          ].map((item, i) => (
            <div key={i} style={{ padding: '8px 12px', background: '#fff', borderRadius: '4px' }}>{item}</div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '32px', padding: '20px', color: '#666' }}>
        <p style={{ margin: 0, fontSize: '18px' }}>🌟 You're going to crush it! 🌟</p>
        <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>Remember: Confidence + Preparation = Victory</p>
      </div>
    </div>
  );
}
