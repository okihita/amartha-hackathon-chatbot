import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { User, Building2, CreditCard, BookOpen, Users as UsersIcon, ArrowLeft, Target, Calendar, Phone, TrendingUp, Shield, AlertTriangle, CheckCircle, Activity, PieChart, BarChart3, Clock, Zap, Award, FileText, Package, Ban } from 'lucide-preact';

// Amartha Credit Scoring Model (Max 40 points)
const calculateCreditScore = (userData) => {
  const seed = userData.phone?.slice(-4) || '1234';
  const seedNum = parseInt(seed, 10) || 1234;
  const mockVal = (base, variance) => base + (seedNum % variance) - variance/2;

  // Mock external data (SLIK, financials) - in production these would come from real sources
  const mockData = {
    slik_status: seedNum % 10 < 8 ? 'COL1' : 'COL2',
    slik_last_col2_months: 6 + (seedNum % 18),
    monthly_installment: mockVal(500000, 200000),
    net_profit: mockVal(3000000, 1000000),
    total_monthly_debt: mockVal(800000, 400000),
    claimed_monthly_revenue: mockVal(5000000, 2000000),
  };

  // Get real data from user
  const literacy = userData.literacy || {};
  const completedWeeks = Object.keys(literacy).filter(k => k.startsWith('week_') && literacy[k]?.score >= 100).length;
  const literacyPercent = (completedWeeks / 15) * 100;
  const quizScores = Object.values(literacy).filter(w => w?.score).map(w => w.score);
  const avgQuizScore = quizScores.length > 0 ? quizScores.reduce((a,b) => a+b, 0) / quizScores.length : 0;
  
  const majelisAttendance = userData.majelis ? mockVal(88, 20) : 0;
  const majelisLatePayments = userData.majelis ? (seedNum % 3) : 3;
  
  // BI data
  const bi = userData.business_intelligence || [];
  const latestInventory = bi.filter(b => b.type === 'inventory').sort((a,b) => new Date(b.analyzed_at) - new Date(a.analyzed_at))[0];
  const latestBuilding = bi.filter(b => b.type === 'building').sort((a,b) => new Date(b.analyzed_at) - new Date(a.analyzed_at))[0];
  const inventoryLevel = latestInventory?.data?.stock_level === 'High' ? 85 : latestInventory?.data?.stock_level === 'Medium' ? 60 : latestInventory?.data?.stock_level === 'Low' ? 30 : mockVal(50, 40);
  const assetValuation = latestBuilding?.data?.estimated_value || mockVal(15000000, 10000000);

  // AUTO REJECT checks
  const autoReject = {
    slik: ['COL3', 'COL4', 'COL5'].includes(mockData.slik_status),
    goldenRule: (mockData.monthly_installment / mockData.net_profit) > 0.30
  };
  const isRejected = autoReject.slik || autoReject.goldenRule;

  // A1: SLIK OJK Status (max 8)
  let a1 = 0;
  if (mockData.slik_status === 'COL1') a1 = 8;
  else if (mockData.slik_status === 'COL2') {
    if (mockData.slik_last_col2_months > 12) a1 = 6.4;
    else if (mockData.slik_last_col2_months >= 6) a1 = 4;
    else a1 = 2;
  }

  // A2: Repayment Capacity (max 7)
  const rpc = (mockData.monthly_installment / mockData.net_profit) * 100;
  let a2 = rpc <= 15 ? 7 : rpc <= 20 ? 5 : rpc <= 25 ? 3 : rpc <= 30 ? 1 : 0;

  // A3: Cashflow Volatility (max 3) - mock CV
  const cv = 0.2 + (seedNum % 50) / 100;
  let a3 = cv <= 0.3 ? 3 : cv <= 0.5 ? 2 : cv <= 0.7 ? 1 : 0;

  // A4: Debt Burden Ratio (max 2)
  const dbr = (mockData.total_monthly_debt / mockData.net_profit) * 100;
  let a4 = dbr <= 35 ? 2 : dbr <= 40 ? 1.5 : dbr <= 45 ? 1 : dbr <= 50 ? 0.5 : 0;

  // B1: Capacity Match (max 5)
  const capacityRatio = assetValuation / (mockData.claimed_monthly_revenue * 3);
  let b1 = (capacityRatio >= 0.8 && capacityRatio <= 1.2) ? 5 : 
           (capacityRatio >= 0.6 && capacityRatio < 0.8) || (capacityRatio > 1.2 && capacityRatio <= 1.4) ? 3 :
           (capacityRatio >= 0.4 && capacityRatio < 0.6) || (capacityRatio > 1.4 && capacityRatio <= 1.6) ? 1 : 0;

  // B2: Inventory Level (max 5)
  let b2 = inventoryLevel >= 75 ? 5 : inventoryLevel >= 50 ? 3 : inventoryLevel >= 25 ? 1 : 0;

  // C1: Financial Literacy (max 5)
  const c1Module = literacyPercent >= 100 ? 2.5 : literacyPercent >= 80 ? 1.5 : 0;
  const c1Quiz = avgQuizScore >= 90 ? 2.5 : avgQuizScore >= 75 ? 1.5 : 0;
  const c1 = c1Module + c1Quiz;

  // C2: Majelis Cohesion (max 5)
  let c2 = 0;
  if (userData.majelis) {
    if (majelisAttendance >= 95 && majelisLatePayments === 0) c2 = 5;
    else if (majelisAttendance >= 85 || majelisLatePayments <= 1) c2 = 3;
    else if (majelisAttendance >= 75 || majelisLatePayments <= 2) c2 = 1;
  }

  const totalScore = a1 + a2 + a3 + a4 + b1 + b2 + c1 + c2;
  const maxScore = 40;
  const normalizedScore = Math.round((totalScore / maxScore) * 550 + 300); // Convert to 300-850 scale

  return {
    rawScore: Math.round(totalScore * 10) / 10,
    maxScore,
    normalizedScore: isRejected ? 300 : normalizedScore,
    isRejected,
    autoReject,
    factors: [
      { name: 'SLIK OJK Status', score: a1, max: 8, weight: 20, icon: Shield, category: 'A' },
      { name: 'Repayment Capacity', score: a2, max: 7, weight: 17.5, icon: CreditCard, category: 'A', detail: `${rpc.toFixed(1)}%` },
      { name: 'Cashflow Volatility', score: a3, max: 3, weight: 7.5, icon: Activity, category: 'A', detail: `CV ${cv.toFixed(2)}` },
      { name: 'Debt Burden Ratio', score: a4, max: 2, weight: 5, icon: PieChart, category: 'A', detail: `${dbr.toFixed(1)}%` },
      { name: 'Capacity Match', score: b1, max: 5, weight: 12.5, icon: BarChart3, category: 'B', detail: `Ratio ${capacityRatio.toFixed(2)}` },
      { name: 'Inventory Level', score: b2, max: 5, weight: 12.5, icon: Package, category: 'B', detail: `${inventoryLevel}%` },
      { name: 'Financial Literacy', score: c1, max: 5, weight: 12.5, icon: BookOpen, category: 'C', detail: `${literacyPercent.toFixed(0)}% done` },
      { name: 'Majelis Cohesion', score: c2, max: 5, weight: 12.5, icon: UsersIcon, category: 'C', detail: userData.majelis ? `${majelisAttendance}% att.` : 'No group' },
    ],
    sections: {
      A: { name: 'Financial Capacity', score: a1+a2+a3+a4, max: 20, weight: 60 },
      B: { name: 'Business Validation', score: b1+b2, max: 10, weight: 20 },
      C: { name: 'Literacy & Quality', score: c1+c2, max: 10, weight: 20 },
    },
    riskLevel: isRejected ? 'Rejected' : totalScore >= 32 ? 'Low' : totalScore >= 24 ? 'Medium' : totalScore >= 16 ? 'High' : 'Very High',
    loanEligibility: isRejected ? 0 : Math.round(totalScore * 250000),
    interestRate: isRejected ? null : totalScore >= 32 ? 12 : totalScore >= 24 ? 15 : totalScore >= 16 ? 18 : 24,
    // Generate insights for each section
    insights: {
      A: a1+a2+a3+a4 >= 14 ? 'Strong financial foundation with healthy repayment capacity' : a1+a2+a3+a4 >= 10 ? 'Moderate financial health — monitor debt levels' : 'Financial stress indicators present — requires attention',
      B: b1+b2 >= 7 ? 'Business assets align well with claimed revenue' : b1+b2 >= 4 ? 'Some gaps between assets and revenue claims' : 'Significant validation concerns — verify business data',
      C: c1+c2 >= 7 ? 'High engagement in literacy program and group activities' : c1+c2 >= 4 ? 'Moderate program participation' : 'Low engagement — encourage participation',
      overall: isRejected ? 'Application fails mandatory compliance checks' : totalScore >= 32 ? 'Borrower demonstrates strong creditworthiness across all dimensions' : totalScore >= 24 ? 'Acceptable risk profile with room for improvement in specific areas' : 'Elevated risk — consider smaller loan amount or additional guarantees',
    },
  };
};

// Generate business-friendly insight text
const getFactorInsight = (factor, score, max) => {
  const pct = (score / max) * 100;
  const insights = {
    'SLIK OJK Status': pct >= 80 ? 'Clean credit history — no delinquencies' : pct >= 50 ? 'Minor past issues, now resolved' : 'Credit history concerns detected',
    'Repayment Capacity': pct >= 80 ? 'Comfortable margin for loan payments' : pct >= 50 ? 'Adequate but tight repayment buffer' : 'High payment burden relative to income',
    'Cashflow Volatility': pct >= 80 ? 'Stable, predictable income stream' : pct >= 50 ? 'Some income fluctuation — typical for UMKM' : 'Highly variable income — higher risk',
    'Debt Burden Ratio': pct >= 80 ? 'Low existing debt obligations' : pct >= 50 ? 'Moderate debt load' : 'Heavy debt burden',
    'Capacity Match': pct >= 80 ? 'Business assets support revenue claims' : pct >= 50 ? 'Partial asset-revenue alignment' : 'Revenue claims exceed visible capacity',
    'Inventory Level': pct >= 80 ? 'Well-stocked, active business' : pct >= 50 ? 'Adequate inventory levels' : 'Low stock — potential cash flow issues',
    'Financial Literacy': pct >= 80 ? 'Highly engaged in learning program' : pct >= 50 ? 'Progressing through curriculum' : 'Early stage — encourage completion',
    'Majelis Cohesion': pct >= 80 ? 'Strong group participation & peer support' : pct >= 50 ? 'Regular group attendance' : 'Limited group engagement',
  };
  return insights[factor] || '';
};

const CreditScoreDashboard = ({ userData }) => {
  const credit = calculateCreditScore(userData);
  const { rawScore, maxScore, isRejected, autoReject, factors, sections, riskLevel, loanEligibility, interestRate, insights } = credit;

  const getScoreColor = (s) => isRejected ? '#EF4444' : s >= 32 ? '#10B981' : s >= 24 ? '#F59E0B' : '#EF4444';
  const getRiskColor = (r) => r === 'Low' ? '#10B981' : r === 'Medium' ? '#F59E0B' : '#EF4444';
  const scorePercent = (rawScore / maxScore) * 100;
  const categoryLabels = { A: 'Financial Capacity & History', B: 'Business Validation', C: 'Financial Literacy & Quality' };

  return (
    <div style="margin-top: 32px;">
      {/* Header */}
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
        <div style="width: 4px; height: 32px; background: linear-gradient(180deg, #63297A 0%, #F9CF79 100%); border-radius: 2px;" />
        <h2 style="margin: 0; font-size: 22px; color: #1F2937;">Credit Risk Assessment</h2>
      </div>
      <p style="margin: 0 0 24px; font-size: 13px; color: #6B7280; padding-left: 16px;">
        Powered by Amartha Scoring Model v1.0 — Multi-factor risk analysis based on OJK guidelines
      </p>

      {/* Auto Reject Alert */}
      {isRejected && (
        <div style="margin-bottom: 24px; padding: 20px; background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%); border-radius: 12px; border-left: 4px solid #DC2626;">
          <div style="display: flex; align-items: flex-start; gap: 16px;">
            <div style="width: 48px; height: 48px; background: #DC2626; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <Ban size={24} style="color: white;" />
            </div>
            <div>
              <div style="font-size: 16px; font-weight: 700; color: #DC2626; margin-bottom: 4px;">Application Auto-Rejected</div>
              <div style="font-size: 13px; color: #991B1B; margin-bottom: 8px;">
                {autoReject.slik && '• SLIK OJK violation: Collectibility status 3/4/5 detected within 12 months'}
                {autoReject.slik && autoReject.goldenRule && <br/>}
                {autoReject.goldenRule && '• Golden Rule violation: Installment exceeds 30% of net profit threshold'}
              </div>
              <div style="font-size: 11px; color: #B91C1C;">Ref: OJK Regulation No. 77/POJK.01/2016 on Information Technology-Based Lending Services</div>
            </div>
          </div>
        </div>
      )}

      {/* Executive Summary Card */}
      <div class="card" style="margin-bottom: 24px; padding: 0; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1F2937 0%, #374151 100%); padding: 24px; color: white;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.7; margin-bottom: 4px;">Executive Summary</div>
          <div style="font-size: 18px; font-weight: 600;">Borrower Risk Profile Analysis</div>
        </div>
        <div style="padding: 24px;">
          <div style="display: grid; grid-template-columns: 200px 1fr 1fr; gap: 32px; align-items: center;">
            {/* Score Gauge */}
            <div style="text-align: center;">
              <div style="position: relative; width: 140px; height: 140px; margin: 0 auto;">
                <svg viewBox="0 0 140 140" style="transform: rotate(-90deg);">
                  <circle cx="70" cy="70" r="58" fill="none" stroke="#E5E7EB" stroke-width="10" />
                  <circle cx="70" cy="70" r="58" fill="none" stroke={getScoreColor(rawScore)} stroke-width="10" stroke-dasharray={`${scorePercent * 3.64} 364`} stroke-linecap="round" />
                </svg>
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                  <div style={`font-size: 32px; font-weight: 800; color: ${getScoreColor(rawScore)}; line-height: 1;`}>{rawScore}</div>
                  <div style="font-size: 11px; color: #9CA3AF;">of {maxScore} pts</div>
                </div>
              </div>
              <div style={`margin-top: 12px; padding: 6px 16px; border-radius: 6px; display: inline-block; background: ${getRiskColor(riskLevel)}; color: white; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;`}>
                {riskLevel} Risk
              </div>
            </div>

            {/* Key Metrics */}
            <div>
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6B7280; margin-bottom: 12px;">Key Metrics</div>
              <div style="display: grid; gap: 8px;">
                {Object.entries(sections).map(([key, sec]) => {
                  const pct = Math.round((sec.score / sec.max) * 100);
                  return (
                    <div key={key} style="display: flex; align-items: center; gap: 12px;">
                      <div style={`width: 24px; height: 24px; border-radius: 4px; background: ${pct >= 70 ? '#D1FAE5' : pct >= 40 ? '#FEF3C7' : '#FEE2E2'}; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: ${pct >= 70 ? '#065F46' : pct >= 40 ? '#92400E' : '#991B1B'};`}>{key}</div>
                      <div style="flex: 1;">
                        <div style="height: 6px; background: #E5E7EB; border-radius: 3px; overflow: hidden;">
                          <div style={`height: 100%; width: ${pct}%; background: ${pct >= 70 ? '#10B981' : pct >= 40 ? '#F59E0B' : '#EF4444'}; border-radius: 3px;`} />
                        </div>
                      </div>
                      <div style="font-size: 12px; font-weight: 600; color: #374151; width: 60px; text-align: right;">{sec.score}/{sec.max}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Decision Box */}
            <div style={`padding: 20px; border-radius: 12px; text-align: center; ${isRejected ? 'background: #FEE2E2; border: 2px solid #FECACA;' : 'background: linear-gradient(135deg, #63297A 0%, #7E3D99 100%); color: white;'}`}>
              <div style={`font-size: 11px; text-transform: uppercase; letter-spacing: 1px; ${isRejected ? 'color: #991B1B;' : 'opacity: 0.85;'} margin-bottom: 8px;`}>
                {isRejected ? 'Application Status' : 'Loan Eligibility'}
              </div>
              {isRejected ? (
                <div style="font-size: 20px; font-weight: 800; color: #DC2626;">REJECTED</div>
              ) : (
                <>
                  <div style="font-size: 24px; font-weight: 800;">Rp {(loanEligibility/1000000).toFixed(1)}M</div>
                  <div style="font-size: 12px; opacity: 0.85; margin-top: 4px;">@ {interestRate}% p.a.</div>
                </>
              )}
            </div>
          </div>

          {/* Key Insight - McKinsey "So What" */}
          <div class="so-what-box" style="margin-top: 20px;">
            <div class="so-what-title">💡 Key Insight</div>
            <div class="so-what-text">{insights.overall}</div>
          </div>
        </div>
      </div>

      {/* Detailed Factor Analysis */}
      <div class="card" style="margin-bottom: 24px; padding: 0; overflow: hidden;">
        <div style="padding: 20px 24px; border-bottom: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 15px; font-weight: 600; color: #1F2937;">Scoring Factor Analysis</div>
            <div style="font-size: 12px; color: #6B7280;">8 factors across 3 categories weighted by risk impact</div>
          </div>
          <div style="display: flex; gap: 12px; font-size: 11px;">
            <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #10B981;" /> Optimal</span>
            <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #F59E0B;" /> Moderate</span>
            <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #EF4444;" /> At Risk</span>
          </div>
        </div>

        {['A', 'B', 'C'].map(cat => {
          const catFactors = factors.filter(f => f.category === cat);
          const sec = sections[cat];
          return (
            <div key={cat} style="border-bottom: 1px solid #E5E7EB;">
              <div style="padding: 16px 24px; background: #F9FAFB; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="width: 28px; height: 28px; border-radius: 6px; background: #63297A; color: white; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700;">{cat}</div>
                  <div>
                    <div style="font-size: 13px; font-weight: 600; color: #1F2937;">{categoryLabels[cat]}</div>
                    <div style="font-size: 11px; color: #6B7280;">Weight: {sec.weight}% of total score</div>
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 18px; font-weight: 700; color: #1F2937;">{sec.score}<span style="font-size: 13px; color: #6B7280;">/{sec.max}</span></div>
                  <div style={`font-size: 11px; font-weight: 600; color: ${(sec.score/sec.max) >= 0.7 ? '#059669' : (sec.score/sec.max) >= 0.4 ? '#D97706' : '#DC2626'};`}>
                    {Math.round((sec.score/sec.max)*100)}% achieved
                  </div>
                </div>
              </div>
              {/* Category Insight */}
              <div style="padding: 12px 24px; background: linear-gradient(90deg, rgba(99, 41, 122, 0.03) 0%, transparent 100%); border-left: 3px solid #63297A;">
                <div style="font-size: 12px; color: #4B5563; display: flex; align-items: center; gap: 6px;">
                  <span style="font-size: 14px;">💡</span> {insights[cat]}
                </div>
              </div>
              <div style="padding: 0 24px;">
                {catFactors.map((f, i) => {
                  const Icon = f.icon;
                  const pct = (f.score / f.max) * 100;
                  const color = pct >= 70 ? '#10B981' : pct >= 40 ? '#F59E0B' : '#EF4444';
                  const status = pct >= 70 ? 'Optimal' : pct >= 40 ? 'Moderate' : 'At Risk';
                  const factorInsight = getFactorInsight(f.name, f.score, f.max);
                  return (
                    <div key={i} style={`padding: 14px 0; ${i < catFactors.length - 1 ? 'border-bottom: 1px solid #F3F4F6;' : ''}`}>
                      <div style="display: grid; grid-template-columns: 32px 1fr 100px 80px 90px; align-items: center; gap: 16px;">
                        <div style={`width: 32px; height: 32px; border-radius: 8px; background: ${color}15; display: flex; align-items: center; justify-content: center;`}>
                          <Icon size={16} style={`color: ${color};`} />
                        </div>
                        <div>
                          <div style="font-size: 13px; font-weight: 500; color: #1F2937;">{f.name}</div>
                          <div style="font-size: 11px; color: #6B7280;">{f.detail || `Weight: ${f.weight}%`}</div>
                        </div>
                        <div style="height: 6px; background: #E5E7EB; border-radius: 3px; overflow: hidden;">
                          <div class="progress-bar-fill" style={`height: 100%; width: ${pct}%; background: ${color}; border-radius: 3px;`} />
                        </div>
                        <div style="text-align: right; font-size: 14px; font-weight: 700; color: #1F2937;">{f.score}<span style="font-size: 11px; color: #9CA3AF; font-weight: 400;">/{f.max}</span></div>
                        <div style={`text-align: center; font-size: 10px; padding: 4px 8px; border-radius: 4px; background: ${color}15; color: ${color}; font-weight: 600; text-transform: uppercase;`}>{status}</div>
                      </div>
                      {/* Factor insight annotation */}
                      <div style="margin-left: 48px; margin-top: 6px; font-size: 11px; color: #6B7280; font-style: italic;">{factorInsight}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Methodology Note */}
      <div style="padding: 16px 20px; background: #F8FAFC; border-radius: 12px; border: 1px solid #E2E8F0;">
        <div style="display: flex; gap: 16px;">
          <div style="width: 40px; height: 40px; background: #63297A15; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <FileText size={20} style="color: #63297A;" />
          </div>
          <div>
            <div style="font-size: 13px; font-weight: 600; color: #1F2937; margin-bottom: 4px;">Scoring Methodology</div>
            <div style="font-size: 12px; color: #64748B; line-height: 1.5;">
              This assessment uses Amartha's proprietary credit scoring model combining <strong>SLIK OJK data</strong> (payment history), 
              <strong>financial ratios</strong> (RPC, DBR, cashflow volatility), <strong>AI-powered business validation</strong> (inventory & asset analysis), 
              and <strong>behavioral indicators</strong> (literacy completion, group cohesion). Auto-reject rules comply with OJK microfinance guidelines.
            </div>
            <div style="margin-top: 8px; display: flex; gap: 16px; font-size: 11px; color: #94A3B8;">
              <span>📊 Real data: Literacy, Majelis, Business Intelligence</span>
              <span>🔄 Simulated: SLIK, Income/Debt figures</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function UserProfile({ phone }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [newBiIds, setNewBiIds] = useState(new Set());
  const [businessKPIs, setBusinessKPIs] = useState(null);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/users/${phone}/complete`);
      if (!res.ok) throw new Error('User not found');
      const userData = await res.json();
      setData(userData);
      
      if (userData.business?.category_id) {
        fetchBusinessKPIs(userData.business.category_id, userData.business.maturity_level || 1);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessKPIs = async (categoryId, level) => {
    if (!categoryId) return;
    try {
      const res = await fetch('/api/knowledge/business-classifications');
      const classifications = await res.json();
      const match = classifications.find(c => c.category_id === categoryId);
      
      if (match) {
        const currentLevel = match.maturity_levels?.find(l => l.level === level);
        if (currentLevel?.roadmap) {
          setBusinessKPIs({
            goal: currentLevel.roadmap.description,
            kpis: currentLevel.roadmap.kpis || []
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch KPIs:', err);
    }
  };

  useEffect(() => {
    fetchProfile();
    
    const eventSource = new EventSource(`/api/events/${phone}`);
    eventSource.onmessage = (e) => {
      const update = JSON.parse(e.data);
      if (update.type === 'bi_added') {
        setNewBiIds(prev => new Set([...prev, update.data.id]));
        fetchProfile();
        setTimeout(() => {
          setNewBiIds(prev => { const n = new Set(prev); n.delete(update.data.id); return n; });
        }, 5000);
      }
    };
    
    return () => eventSource.close();
  }, [phone]);

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (num) => `Rp ${(num || 0).toLocaleString('id-ID')}`;

  if (loading) return <div class="card" style="text-align: center; padding: 60px;">Loading...</div>;
  if (error) return <div class="card" style="text-align: center; padding: 60px; color: #EF4444;">{error}</div>;
  if (!data) return null;

  const literacyProgress = () => {
    if (!data.literacy) return { completed: 0, total: 15, percentage: 0 };
    const weeks = Object.keys(data.literacy).filter(k => k.startsWith('week_'));
    const completed = weeks.filter(w => data.literacy[w]?.score >= 100).length;
    return { completed, total: 15, percentage: Math.round((completed / 15) * 100) };
  };

  const currentDebt = data.loan?.history?.length > 0
    ? data.loan.history[data.loan.history.length - 1].balance_after
    : 0;

  const filteredBI = activeTab === 'all'
    ? data.business_intelligence
    : data.business_intelligence?.filter(bi => bi.type === activeTab);

  const progress = literacyProgress();

  // Calculate BI summary
  const bi = data.business_intelligence || [];
  const latestBuilding = bi.filter(b => b.type === 'building').sort((a,b) => new Date(b.analyzed_at) - new Date(a.analyzed_at))[0];
  const latestInventory = bi.filter(b => b.type === 'inventory').sort((a,b) => new Date(b.analyzed_at) - new Date(a.analyzed_at))[0];
  const latestLedger = bi.filter(b => b.type === 'ledger').sort((a,b) => new Date(b.analyzed_at) - new Date(a.analyzed_at))[0];

  return (
    <div>
      {/* Back Button */}
      <button onClick={() => window.history.back()} class="btn btn-secondary" style="margin-bottom: 20px;">
        <ArrowLeft size={18} /> Back to Users
      </button>

      {/* Executive Summary Header */}
      <div class="card" style="margin-bottom: 24px; padding: 0; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1F2937 0%, #374151 100%); padding: 24px; color: white;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 20px;">
            <div style="display: flex; gap: 20px; align-items: center;">
              <div style="width: 72px; height: 72px; border-radius: 16px; background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; color: white; font-size: 28px; font-weight: 700; border: 2px solid rgba(255,255,255,0.2);">
                {data.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.7; margin-bottom: 4px;">Borrower Profile</div>
                <h1 style="margin: 0 0 4px 0; font-size: 26px; font-weight: 700;">{data.name}</h1>
                <div style="display: flex; gap: 16px; font-size: 13px; opacity: 0.85;">
                  <span style="display: flex; align-items: center; gap: 4px;"><Phone size={14} /> {data.phone}</span>
                  <span style="display: flex; align-items: center; gap: 4px;"><Calendar size={14} /> Member since {formatDate(data.created_at)}</span>
                </div>
              </div>
            </div>
            <div style={`padding: 8px 20px; border-radius: 8px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; ${data.status === 'active' ? 'background: #10B981; color: white;' : 'background: #F59E0B; color: white;'}`}>
              {data.status}
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div style="padding: 20px 24px; display: grid; grid-template-columns: repeat(5, 1fr); gap: 24px; border-bottom: 1px solid #E5E7EB;">
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: 800; color: #63297A;">{formatCurrency(data.loan?.limit || 0).replace('Rp ', '')}</div>
            <div style="font-size: 11px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">Loan Limit</div>
          </div>
          <div style="text-align: center;">
            <div style={`font-size: 24px; font-weight: 800; ${currentDebt > 0 ? 'color: #DC2626;' : 'color: #10B981;'}`}>{formatCurrency(currentDebt).replace('Rp ', '')}</div>
            <div style="font-size: 11px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">Outstanding</div>
          </div>
          <div style="text-align: center;">
            <div style={`font-size: 24px; font-weight: 800; ${progress.percentage >= 70 ? 'color: #10B981;' : progress.percentage >= 40 ? 'color: #F59E0B;' : 'color: #EF4444;'}`}>{progress.percentage}%</div>
            <div style="font-size: 11px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">Literacy</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: 800; color: #2563EB;">{data.business?.maturity_level || 0}<span style="font-size: 14px; color: #9CA3AF;">/5</span></div>
            <div style="font-size: 11px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">Biz Level</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: 800; color: #7C3AED;">{bi.length}</div>
            <div style="font-size: 11px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">BI Records</div>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div style="padding: 20px 24px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6B7280; margin-bottom: 8px;">Personal</div>
            <div style="font-size: 13px; color: #374151;">
              <div style="margin-bottom: 4px;"><span style="color: #9CA3AF;">Gender:</span> {data.profile?.gender || '-'}</div>
              <div style="margin-bottom: 4px;"><span style="color: #9CA3AF;">DOB:</span> {data.profile?.dob ? formatDate(data.profile.dob) : '-'}</div>
              <div><span style="color: #9CA3AF;">Address:</span> {data.profile?.address || '-'}</div>
            </div>
          </div>
          <div>
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6B7280; margin-bottom: 8px;">Business</div>
            <div style="font-size: 13px; color: #374151;">
              <div style="margin-bottom: 4px;"><span style="color: #9CA3AF;">Name:</span> {data.business?.name || '-'}</div>
              <div style="margin-bottom: 4px;"><span style="color: #9CA3AF;">Category:</span> {data.business?.category || '-'}</div>
              <div><span style="color: #9CA3AF;">Location:</span> {data.business?.location || '-'}</div>
            </div>
          </div>
          <div>
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6B7280; margin-bottom: 8px;">Majelis</div>
            {data.majelis ? (
              <div style="font-size: 13px; color: #374151;">
                <div style="margin-bottom: 4px;"><span style="color: #9CA3AF;">Group:</span> {data.majelis.name}</div>
                <div style="margin-bottom: 4px;"><span style="color: #9CA3AF;">Schedule:</span> {data.majelis.schedule_day}, {data.majelis.schedule_time}</div>
                <div><span style="color: #9CA3AF;">Members:</span> {data.majelis.member_count}</div>
              </div>
            ) : <div style="font-size: 13px; color: #9CA3AF;">Not assigned</div>}
          </div>
        </div>
      </div>

      {/* Section 1: Loan & Payment Status */}
      <div class="card" style="margin-bottom: 24px; padding: 0; overflow: hidden;">
        <div style="padding: 16px 24px; border-bottom: 1px solid #E5E7EB; display: flex; align-items: center; gap: 12px;">
          <div style="width: 32px; height: 32px; background: #63297A; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
            <CreditCard size={16} style="color: white;" />
          </div>
          <div>
            <div style="font-size: 15px; font-weight: 600; color: #1F2937;">Loan & Payment Status</div>
            <div style="font-size: 12px; color: #6B7280;">Current loan position and transaction history</div>
          </div>
        </div>

        {data.loan && data.loan.limit > 0 ? (
          <>
            {/* Loan Summary */}
            <div style="padding: 20px 24px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; background: #F9FAFB;">
              <div>
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6B7280; margin-bottom: 4px;">Credit Limit</div>
                <div style="font-size: 20px; font-weight: 700; color: #1F2937;">{formatCurrency(data.loan.limit)}</div>
              </div>
              <div>
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6B7280; margin-bottom: 4px;">Outstanding Balance</div>
                <div style={`font-size: 20px; font-weight: 700; ${currentDebt > 0 ? 'color: #DC2626;' : 'color: #10B981;'}`}>{formatCurrency(currentDebt)}</div>
              </div>
              <div>
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6B7280; margin-bottom: 4px;">Available Credit</div>
                <div style="font-size: 20px; font-weight: 700; color: #10B981;">{formatCurrency(data.loan.remaining || (data.loan.limit - currentDebt))}</div>
              </div>
              <div>
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6B7280; margin-bottom: 4px;">Utilization</div>
                <div style="font-size: 20px; font-weight: 700; color: #63297A;">{data.loan.limit > 0 ? Math.round((currentDebt / data.loan.limit) * 100) : 0}%</div>
              </div>
            </div>

            {/* Next Payment Alert */}
            {data.loan.next_payment_date && (
              <div style="padding: 16px 24px; background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <Clock size={20} style="color: #92400E;" />
                  <div>
                    <div style="font-size: 13px; font-weight: 600; color: #92400E;">Next Payment Due</div>
                    <div style="font-size: 12px; color: #A16207;">{formatDate(data.loan.next_payment_date)}</div>
                  </div>
                </div>
                <div style="font-size: 20px; font-weight: 800; color: #92400E;">{formatCurrency(data.loan.next_payment_amount)}</div>
              </div>
            )}

            {/* Transaction History */}
            {data.loan.history?.length > 0 && (
              <div style="padding: 20px 24px;">
                <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #6B7280; margin-bottom: 12px;">Transaction History</div>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                  <thead>
                    <tr style="border-bottom: 2px solid #E5E7EB;">
                      <th style="text-align: left; padding: 10px 0; font-weight: 600; color: #374151;">Date</th>
                      <th style="text-align: left; padding: 10px 0; font-weight: 600; color: #374151;">Type</th>
                      <th style="text-align: left; padding: 10px 0; font-weight: 600; color: #374151;">Description</th>
                      <th style="text-align: right; padding: 10px 0; font-weight: 600; color: #374151;">Amount</th>
                      <th style="text-align: right; padding: 10px 0; font-weight: 600; color: #374151;">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.loan.history.map((txn, i) => (
                      <tr key={txn.id} style={`border-bottom: 1px solid #F3F4F6; ${i === data.loan.history.length - 1 ? 'background: #F0FDF4;' : ''}`}>
                        <td style="padding: 12px 0; color: #6B7280;">{formatDate(txn.date)}</td>
                        <td style="padding: 12px 0;">
                          <span style={`padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; ${txn.type === 'disbursement' ? 'background: #DBEAFE; color: #1E40AF;' : 'background: #D1FAE5; color: #065F46;'}`}>
                            {txn.type.toUpperCase()}
                          </span>
                        </td>
                        <td style="padding: 12px 0; color: #374151;">{txn.description || '-'}</td>
                        <td style={`padding: 12px 0; text-align: right; font-weight: 600; ${txn.type === 'disbursement' ? 'color: #DC2626;' : 'color: #10B981;'}`}>
                          {txn.type === 'disbursement' ? '-' : '+'}{formatCurrency(txn.amount)}
                        </td>
                        <td style="padding: 12px 0; text-align: right; font-weight: 700; color: #1F2937;">{formatCurrency(txn.balance_after)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <div style="padding: 40px; text-align: center; color: #6B7280;">
            <CreditCard size={32} style="color: #D1D5DB; margin-bottom: 12px;" />
            <div>No active loan</div>
          </div>
        )}
      </div>

      {/* Section 2: Business Intelligence */}
      <div class="card" style="margin-bottom: 24px; padding: 0; overflow: hidden;">
        <div style="padding: 16px 24px; border-bottom: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 32px; height: 32px; background: #2563EB; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
              <BarChart3 size={16} style="color: white;" />
            </div>
            <div>
              <div style="font-size: 15px; font-weight: 600; color: #1F2937;">Business Intelligence</div>
              <div style="font-size: 12px; color: #6B7280;">AI-analyzed business assets, inventory, and financials</div>
            </div>
          </div>
          <div style="display: flex; gap: 6px;">
            {['all', 'building', 'inventory', 'ledger'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={`padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; border: none; cursor: pointer; ${activeTab === tab ? 'background: #2563EB; color: white;' : 'background: #F3F4F6; color: #6B7280;'}`}>
                {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* BI Summary */}
        {bi.length > 0 ? (
          <>
            <div style="padding: 20px 24px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; background: #F9FAFB;">
              <div style="padding: 16px; background: white; border-radius: 10px; border: 1px solid #E5E7EB;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  <Building2 size={16} style="color: #7C3AED;" />
                  <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6B7280;">Asset Valuation</span>
                </div>
                <div style="font-size: 22px; font-weight: 700; color: #1F2937;">{latestBuilding?.data?.estimated_value ? formatCurrency(latestBuilding.data.estimated_value) : '-'}</div>
                {latestBuilding?.data?.condition && <div style="font-size: 11px; color: #6B7280; margin-top: 4px;">{latestBuilding.data.building_type} • {latestBuilding.data.condition}</div>}
              </div>
              <div style="padding: 16px; background: white; border-radius: 10px; border: 1px solid #E5E7EB;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  <Package size={16} style="color: #2563EB;" />
                  <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6B7280;">Inventory Value</span>
                </div>
                <div style="font-size: 22px; font-weight: 700; color: #1F2937;">{latestInventory?.data?.inventory_value_estimate ? formatCurrency(latestInventory.data.inventory_value_estimate) : '-'}</div>
                {latestInventory?.data?.total_items_count && <div style="font-size: 11px; color: #6B7280; margin-top: 4px;">{latestInventory.data.total_items_count} items • {latestInventory.data.stock_level} stock</div>}
              </div>
              <div style="padding: 16px; background: white; border-radius: 10px; border: 1px solid #E5E7EB;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  <TrendingUp size={16} style="color: #059669;" />
                  <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6B7280;">Monthly Cashflow</span>
                </div>
                <div style="font-size: 22px; font-weight: 700; color: #1F2937;">{latestLedger?.data?.monthly_cashflow_estimate ? formatCurrency(latestLedger.data.monthly_cashflow_estimate) : '-'}</div>
                {latestLedger?.data?.daily_income_estimate && <div style="font-size: 11px; color: #6B7280; margin-top: 4px;">{formatCurrency(latestLedger.data.daily_income_estimate)}/day income</div>}
              </div>
            </div>

            {/* BI Insight Annotation */}
            <div class="key-takeaway" style="margin: 0 24px 16px;">
              <div class="key-takeaway-title">📊 Business Health Indicator</div>
              <div class="key-takeaway-text">
                {latestBuilding && latestInventory ? (
                  latestInventory.data?.stock_level === 'High' ? 
                    'Strong business indicators: Well-maintained premises with healthy inventory levels suggest active operations and good cash management.' :
                  latestInventory.data?.stock_level === 'Medium' ?
                    'Moderate business health: Adequate inventory with room for growth. Consider seasonal patterns when evaluating.' :
                    'Attention needed: Low inventory may indicate cash flow constraints or declining sales. Verify with recent transaction data.'
                ) : 'Awaiting business verification data. Encourage borrower to submit photos of premises and inventory.'}
              </div>
            </div>

            {/* BI Items */}
            <div style="padding: 20px 24px;">
              <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #6B7280; margin-bottom: 12px;">Analysis Records ({filteredBI?.length || 0})</div>
              {filteredBI?.length > 0 ? (
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px;">
                  {filteredBI.map(item => {
                    const typeConfig = { building: { icon: Building2, color: '#7C3AED' }, inventory: { icon: Package, color: '#2563EB' }, ledger: { icon: FileText, color: '#059669' } };
                    const config = typeConfig[item.type] || typeConfig.building;
                    const Icon = config.icon;
                    return (
                      <div key={item.id} style={`background: #FAFAFA; border: 1px solid ${newBiIds.has(item.id) ? '#10B981' : '#E5E7EB'}; border-radius: 8px; overflow: hidden;`}>
                        {item.source?.image_url && <img src={item.source.image_url} alt="" style="width: 100%; height: 100px; object-fit: cover;" />}
                        <div style="padding: 12px;">
                          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <div style={`display: flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 4px; background: ${config.color}15; font-size: 10px; font-weight: 600; color: ${config.color}; text-transform: uppercase;`}>
                              <Icon size={10} /> {item.type}
                            </div>
                            <span style="font-size: 10px; color: #9CA3AF;">{formatDateTime(item.analyzed_at)}</span>
                          </div>
                          {item.data && (
                            <div style="font-size: 12px; color: #374151;">
                              {item.type === 'building' && <><strong>{formatCurrency(item.data.estimated_value)}</strong> • {item.data.condition}</>}
                              {item.type === 'inventory' && <><strong>{formatCurrency(item.data.inventory_value_estimate)}</strong> • {item.data.total_items_count} items</>}
                              {item.type === 'ledger' && <><strong>{formatCurrency(item.data.monthly_cashflow_estimate)}</strong>/mo</>}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <div style="text-align: center; padding: 20px; color: #9CA3AF;">No records in this category</div>}
            </div>
          </>
        ) : (
          <div style="padding: 40px; text-align: center; color: #6B7280;">
            <BarChart3 size={32} style="color: #D1D5DB; margin-bottom: 12px;" />
            <div>No business intelligence data yet</div>
            <div style="font-size: 12px; color: #9CA3AF; margin-top: 4px;">User can upload photos via WhatsApp for AI analysis</div>
          </div>
        )}
      </div>

      {/* Section 3: Financial Literacy Progress */}
      <div class="card" style="margin-bottom: 24px; padding: 0; overflow: hidden;">
        <div style="padding: 16px 24px; border-bottom: 1px solid #E5E7EB; display: flex; align-items: center; gap: 12px;">
          <div style="width: 32px; height: 32px; background: #10B981; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
            <BookOpen size={16} style="color: white;" />
          </div>
          <div>
            <div style="font-size: 15px; font-weight: 600; color: #1F2937;">Financial Literacy Program</div>
            <div style="font-size: 12px; color: #6B7280;">15-week educational curriculum progress</div>
          </div>
        </div>

        <div style="padding: 20px 24px;">
          {/* Progress Overview */}
          <div style="display: grid; grid-template-columns: 200px 1fr; gap: 32px; align-items: center; margin-bottom: 24px;">
            <div style="text-align: center;">
              <div style="position: relative; width: 120px; height: 120px; margin: 0 auto;">
                <svg viewBox="0 0 120 120" style="transform: rotate(-90deg);">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#E5E7EB" stroke-width="10" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke={progress.percentage >= 70 ? '#10B981' : progress.percentage >= 40 ? '#F59E0B' : '#EF4444'} stroke-width="10" stroke-dasharray={`${progress.percentage * 3.14} 314`} stroke-linecap="round" />
                </svg>
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                  <div style={`font-size: 28px; font-weight: 800; color: ${progress.percentage >= 70 ? '#10B981' : progress.percentage >= 40 ? '#F59E0B' : '#EF4444'};`}>{progress.percentage}%</div>
                </div>
              </div>
              <div style="margin-top: 8px; font-size: 13px; color: #6B7280;">{progress.completed} of {progress.total} completed</div>
            </div>

            <div>
              <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #6B7280; margin-bottom: 12px;">Weekly Modules</div>
              <div style="display: grid; grid-template-columns: repeat(15, 1fr); gap: 4px;">
                {Array.from({ length: 15 }, (_, i) => {
                  const weekKey = `week_${String(i + 1).padStart(2, '0')}`;
                  const weekData = data.literacy?.[weekKey];
                  const score = weekData?.score || 0;
                  const bg = score >= 100 ? '#10B981' : score > 0 ? '#F59E0B' : '#E5E7EB';
                  return (
                    <div key={weekKey} style={`aspect-ratio: 1; border-radius: 4px; background: ${bg}; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; color: ${score > 0 ? 'white' : '#9CA3AF'};`} title={`Week ${i + 1}: ${score}%`}>
                      {i + 1}
                    </div>
                  );
                })}
              </div>
              <div style="display: flex; gap: 16px; margin-top: 12px; font-size: 11px; color: #6B7280;">
                <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 10px; height: 10px; border-radius: 2px; background: #10B981;" /> Completed</span>
                <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 10px; height: 10px; border-radius: 2px; background: #F59E0B;" /> In Progress</span>
                <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 10px; height: 10px; border-radius: 2px; background: #E5E7EB;" /> Not Started</span>
              </div>

              {/* Literacy Insight */}
              <div class="insight-box" style="margin-top: 16px;">
                <div class="insight-box-title">📚 Learning Progress Insight</div>
                <div class="insight-box-text">
                  {progress.percentage >= 80 ? (
                    <><strong>Excellent engagement!</strong> Borrowers who complete 80%+ of the literacy program show 40% lower default rates. This member demonstrates strong commitment to financial education.</>
                  ) : progress.percentage >= 50 ? (
                    <><strong>Good progress.</strong> Halfway through the curriculum. Encourage completion of remaining modules to unlock better loan terms and build stronger financial habits.</>
                  ) : progress.percentage >= 20 ? (
                    <><strong>Early stage learner.</strong> Just getting started with financial literacy. Regular engagement reminders can help improve completion rates and credit scores.</>
                  ) : (
                    <><strong>Not yet started.</strong> Financial literacy completion is a key factor in credit scoring. Encourage the borrower to begin the 15-week program via WhatsApp.</>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Credit Risk Assessment */}
      <CreditScoreDashboard userData={data} />
    </div>
  );
}
