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
  };
};

const CreditScoreDashboard = ({ userData }) => {
  const credit = calculateCreditScore(userData);
  const { rawScore, maxScore, normalizedScore, isRejected, autoReject, factors, sections, riskLevel, loanEligibility, interestRate } = credit;

  const getScoreColor = (s) => isRejected ? '#EF4444' : s >= 32 ? '#10B981' : s >= 24 ? '#F59E0B' : '#EF4444';
  const getRiskColor = (r) => r === 'Low' ? '#10B981' : r === 'Medium' ? '#F59E0B' : '#EF4444';
  const scorePercent = (rawScore / maxScore) * 100;

  const MockBadge = () => (
    <span style="background: #FEF3C7; color: #92400E; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; margin-left: 8px;">PARTIAL MOCK</span>
  );

  return (
    <div style="margin-top: 32px;">
      {/* Section Header */}
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
        <div style="width: 4px; height: 32px; background: linear-gradient(180deg, #63297A 0%, #F9CF79 100%); border-radius: 2px;" />
        <h2 style="margin: 0; font-size: 22px; color: #1F2937;">Credit Risk Assessment</h2>
        <MockBadge />
      </div>

      {/* Auto Reject Warning */}
      {isRejected && (
        <div style="margin-bottom: 20px; padding: 16px; background: #FEE2E2; border-radius: 12px; border: 1px solid #FECACA;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <Ban size={24} style="color: #DC2626;" />
            <div>
              <div style="font-size: 15px; font-weight: 700; color: #DC2626;">AUTO REJECT</div>
              <div style="font-size: 13px; color: #991B1B;">
                {autoReject.slik && 'SLIK OJK: COL 3/4/5 dalam 12 bulan terakhir. '}
                {autoReject.goldenRule && 'Golden Rule: Angsuran > 30% dari Net Profit.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Score Summary */}
      <div style="display: grid; grid-template-columns: 280px 1fr; gap: 24px; margin-bottom: 24px;">
        {/* Score Gauge */}
        <div class="card" style="text-align: center; padding: 24px;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6B7280; margin-bottom: 12px;">Total Score</div>
          <div style="position: relative; width: 160px; height: 160px; margin: 0 auto;">
            <svg viewBox="0 0 160 160" style="transform: rotate(-90deg);">
              <circle cx="80" cy="80" r="65" fill="none" stroke="#E5E7EB" stroke-width="12" />
              <circle cx="80" cy="80" r="65" fill="none" stroke={getScoreColor(rawScore)} stroke-width="12" stroke-dasharray={`${scorePercent * 4.08} 408`} stroke-linecap="round" />
            </svg>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
              <div style={`font-size: 36px; font-weight: 800; color: ${getScoreColor(rawScore)}; line-height: 1;`}>{rawScore}</div>
              <div style="font-size: 12px; color: #9CA3AF;">/ {maxScore}</div>
            </div>
          </div>
          <div style={`margin-top: 12px; padding: 6px 16px; border-radius: 20px; display: inline-block; background: ${getRiskColor(riskLevel)}15; color: ${getRiskColor(riskLevel)}; font-weight: 700; font-size: 14px;`}>
            {riskLevel} Risk
          </div>
        </div>

        {/* Section Breakdown */}
        <div class="card" style="padding: 24px;">
          <div style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 16px;">Score by Section</div>
          <div style="display: grid; gap: 16px;">
            {Object.entries(sections).map(([key, sec]) => {
              const pct = (sec.score / sec.max) * 100;
              const color = pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444';
              return (
                <div key={key}>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span style="font-size: 13px; color: #374151;">{key}. {sec.name}</span>
                    <span style="font-size: 13px; font-weight: 700;">{sec.score}/{sec.max} <span style="color: #9CA3AF; font-weight: 400;">({sec.weight}%)</span></span>
                  </div>
                  <div style="height: 8px; background: #E5E7EB; border-radius: 4px; overflow: hidden;">
                    <div style={`height: 100%; width: ${pct}%; background: ${color}; border-radius: 4px;`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Factor Details */}
      <div class="card" style="margin-bottom: 24px; padding: 24px;">
        <div style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 16px;">Scoring Factors</div>
        <div style="display: grid; gap: 12px;">
          {factors.map((f, i) => {
            const Icon = f.icon;
            const pct = (f.score / f.max) * 100;
            const color = pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444';
            return (
              <div key={i} style="display: grid; grid-template-columns: 180px 1fr 70px 90px; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid #F3F4F6;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style={`width: 28px; height: 28px; border-radius: 6px; background: ${color}15; display: flex; align-items: center; justify-content: center;`}>
                    <Icon size={14} style={`color: ${color};`} />
                  </div>
                  <span style="font-size: 13px; color: #374151;">{f.name}</span>
                </div>
                <div style="height: 6px; background: #E5E7EB; border-radius: 3px; overflow: hidden;">
                  <div style={`height: 100%; width: ${pct}%; background: ${color}; border-radius: 3px;`} />
                </div>
                <div style="text-align: right; font-size: 14px; font-weight: 700; color: #1F2937;">{f.score}<span style="font-size: 11px; color: #9CA3AF;">/{f.max}</span></div>
                <div style="font-size: 11px; color: #6B7280; text-align: right;">{f.detail || ''}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Loan Eligibility */}
      {!isRejected && (
        <div class="card" style="padding: 0; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #63297A 0%, #7E3D99 100%); padding: 20px; color: white;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
              <div>
                <div style="font-size: 12px; opacity: 0.9; margin-bottom: 4px;">Loan Eligibility</div>
                <div style="font-size: 28px; font-weight: 800;">Rp {loanEligibility.toLocaleString('id-ID')}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 12px; opacity: 0.9; margin-bottom: 4px;">Suggested Rate</div>
                <div style="font-size: 24px; font-weight: 700;">{interestRate}% <span style="font-size: 13px; opacity: 0.8;">p.a.</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div style="margin-top: 20px; padding: 12px 16px; background: #FEF3C7; border-radius: 8px; border: 1px solid #FCD34D;">
        <div style="display: flex; align-items: flex-start; gap: 10px;">
          <AlertTriangle size={16} style="color: #92400E; flex-shrink: 0; margin-top: 2px;" />
          <div style="font-size: 12px; color: #92400E;">
            <strong>Note:</strong> SLIK OJK, financial data (income, debt) are mocked. Real data: literacy progress, majelis, business intelligence.
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

  return (
    <div>
      {/* Back Button */}
      <button onClick={() => window.history.back()} class="btn btn-secondary" style="margin-bottom: 20px;">
        <ArrowLeft size={18} /> Back to Users
      </button>

      {/* Profile Header */}
      <div class="card" style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 20px;">
          <div style="display: flex; gap: 20px; align-items: center;">
            <div style="width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #63297A 0%, #7E3D99 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 28px; font-weight: 700;">
              {data.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h1 style="margin: 0 0 4px 0; font-size: 26px; color: #1F2937;">{data.name}</h1>
              <div style="display: flex; gap: 16px; color: #6B7280; font-size: 14px; flex-wrap: wrap;">
                <span style="display: flex; align-items: center; gap: 4px;"><Phone size={14} /> {data.phone}</span>
                <span style="display: flex; align-items: center; gap: 4px;"><Calendar size={14} /> Joined {formatDate(data.created_at)}</span>
              </div>
            </div>
          </div>
          <span style={`padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; ${data.status === 'active' ? 'background: #D1FAE5; color: #065F46;' : 'background: #FEF3C7; color: #92400E;'}`}>
            {data.status?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div class="stats-grid" style="margin-bottom: 24px;">
        <div class="stat-card">
          <div class="stat-value">{formatCurrency(data.loan?.limit || 0)}</div>
          <div class="stat-label">Loan Limit</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{formatCurrency(currentDebt)}</div>
          <div class="stat-label">Current Debt</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{progress.percentage}%</div>
          <div class="stat-label">Literacy Progress</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{data.business?.maturity_level || 0}/5</div>
          <div class="stat-label">Business Level</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 24px;">
        {/* Personal & Business Info */}
        <div class="card">
          <h2><User size={20} /> Personal Info</h2>
          <div style="display: grid; gap: 12px;">
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F3F4F6;">
              <span style="color: #6B7280;">Gender</span>
              <span style="font-weight: 500;">{data.profile?.gender || '-'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F3F4F6;">
              <span style="color: #6B7280;">Date of Birth</span>
              <span style="font-weight: 500;">{data.profile?.dob ? formatDate(data.profile.dob) : '-'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0;">
              <span style="color: #6B7280;">Address</span>
              <span style="font-weight: 500; text-align: right; max-width: 200px;">{data.profile?.address || '-'}</span>
            </div>
          </div>
        </div>

        <div class="card">
          <h2><Building2 size={20} /> Business Info</h2>
          {data.business ? (
            <div style="display: grid; gap: 12px;">
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F3F4F6;">
                <span style="color: #6B7280;">Business Name</span>
                <span style="font-weight: 500;">{data.business.name || '-'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F3F4F6;">
                <span style="color: #6B7280;">Category</span>
                <span style="background: #EDE9FE; color: #5B21B6; padding: 2px 10px; border-radius: 4px; font-size: 13px;">{data.business.category || '-'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F3F4F6;">
                <span style="color: #6B7280;">Location</span>
                <span style="font-weight: 500;">{data.business.location || '-'}</span>
              </div>
              <div style="padding: 8px 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #6B7280;">Maturity Level</span>
                  <span style="font-weight: 600;">{data.business.maturity_level}/5</span>
                </div>
                <div style="display: flex; gap: 4px;">
                  {[1,2,3,4,5].map(level => (
                    <div key={level} style={`flex: 1; height: 6px; border-radius: 3px; background: ${level <= data.business.maturity_level ? '#63297A' : '#E5E7EB'};`} />
                  ))}
                </div>
              </div>
              {businessKPIs && data.business.maturity_level < 5 && (
                <div style="margin-top: 8px; padding: 12px; background: #F5F3FF; border-radius: 8px;">
                  <div style="font-size: 13px; font-weight: 600; color: #5B21B6; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                    <Target size={14} /> Next Level Goals
                  </div>
                  <ul style="margin: 0; padding-left: 16px; font-size: 13px; color: #444;">
                    {businessKPIs.kpis.slice(0, 3).map((kpi, i) => <li key={i} style="margin-bottom: 2px;">{kpi}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ) : <p style="color: #6B7280;">No business data</p>}
        </div>

        {/* Majelis */}
        <div class="card">
          <h2><UsersIcon size={20} /> Majelis</h2>
          {data.majelis ? (
            <div style="display: grid; gap: 12px;">
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F3F4F6;">
                <span style="color: #6B7280;">Group Name</span>
                <span style="font-weight: 500;">{data.majelis.name}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F3F4F6;">
                <span style="color: #6B7280;">Schedule</span>
                <span style="font-weight: 500;">{data.majelis.schedule_day}, {data.majelis.schedule_time}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F3F4F6;">
                <span style="color: #6B7280;">Location</span>
                <span style="font-weight: 500;">{data.majelis.location}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                <span style="color: #6B7280;">Members</span>
                <span style="font-weight: 500;">{data.majelis.member_count} people</span>
              </div>
            </div>
          ) : <p style="color: #6B7280;">Not assigned to any majelis</p>}
        </div>

        {/* Literacy Progress */}
        <div class="card">
          <h2><BookOpen size={20} /> Literacy Progress</h2>
          <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-size: 14px; color: #6B7280;">{progress.completed} of {progress.total} weeks</span>
              <span style="font-size: 14px; font-weight: 600;">{progress.percentage}%</span>
            </div>
            <div style="width: 100%; background: #E5E7EB; border-radius: 4px; height: 8px;">
              <div style={`background: #63297A; height: 8px; border-radius: 4px; width: ${progress.percentage}%; transition: width 0.3s;`}></div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px;">
            {Array.from({ length: 15 }, (_, i) => {
              const weekKey = `week_${String(i + 1).padStart(2, '0')}`;
              const score = data.literacy?.[weekKey]?.score || 0;
              const bg = score >= 100 ? '#10B981' : score > 0 ? '#F59E0B' : '#E5E7EB';
              const color = score > 0 ? 'white' : '#9CA3AF';
              return (
                <div key={weekKey} style={`background: ${bg}; color: ${color}; text-align: center; padding: 6px; border-radius: 4px; font-size: 12px; font-weight: 600;`} title={`Week ${i + 1}: ${score}%`}>
                  {i + 1}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Loan Section */}
      {data.loan && data.loan.limit > 0 && (
        <div class="card" style="margin-top: 24px;">
          <h2><CreditCard size={20} /> Loan & Transactions</h2>
          {data.loan.next_payment_date && (
            <div style="background: #FEF3C7; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #92400E; font-weight: 500;">Next Payment: {formatDate(data.loan.next_payment_date)}</span>
              <span style="color: #92400E; font-weight: 700;">{formatCurrency(data.loan.next_payment_amount)}</span>
            </div>
          )}
          {data.loan.history?.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th style="text-align: right;">Amount</th>
                  <th style="text-align: right;">Balance</th>
                </tr>
              </thead>
              <tbody>
                {data.loan.history.map(txn => (
                  <tr key={txn.id}>
                    <td>{formatDate(txn.date)}</td>
                    <td>
                      <span style={`padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; ${txn.type === 'disbursement' ? 'background: #DBEAFE; color: #1E40AF;' : 'background: #D1FAE5; color: #065F46;'}`}>
                        {txn.type}
                      </span>
                    </td>
                    <td style="color: #6B7280;">{txn.description || '-'}</td>
                    <td style="text-align: right;">{formatCurrency(txn.amount)}</td>
                    <td style="text-align: right; font-weight: 600;">{formatCurrency(txn.balance_after)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Business Intelligence */}
      <div style="margin-top: 32px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 4px; height: 32px; background: linear-gradient(180deg, #63297A 0%, #F9CF79 100%); border-radius: 2px;" />
            <h2 style="margin: 0; font-size: 22px; color: #1F2937;">Business Intelligence</h2>
          </div>
          <div style="display: flex; gap: 6px;">
            {['all', 'building', 'inventory', 'ledger'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={`padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; border: none; cursor: pointer; ${activeTab === tab ? 'background: #63297A; color: white;' : 'background: #F3F4F6; color: #6B7280;'}`}>
                {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* BI Summary Cards */}
        {data.business_intelligence?.length > 0 && (
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px;">
            {(() => {
              const bi = data.business_intelligence;
              const latestBuilding = bi.filter(b => b.type === 'building').sort((a,b) => new Date(b.analyzed_at) - new Date(a.analyzed_at))[0];
              const latestInventory = bi.filter(b => b.type === 'inventory').sort((a,b) => new Date(b.analyzed_at) - new Date(a.analyzed_at))[0];
              const latestLedger = bi.filter(b => b.type === 'ledger').sort((a,b) => new Date(b.analyzed_at) - new Date(a.analyzed_at))[0];
              return (
                <>
                  <div style="background: linear-gradient(135deg, #EDE9FE 0%, #F5F3FF 100%); padding: 16px; border-radius: 12px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                      <Building2 size={16} style="color: #7C3AED;" />
                      <span style="font-size: 12px; color: #6B7280;">Asset Value</span>
                    </div>
                    <div style="font-size: 22px; font-weight: 700; color: #1F2937;">{latestBuilding?.data?.estimated_value ? formatCurrency(latestBuilding.data.estimated_value) : '-'}</div>
                    {latestBuilding?.data?.condition && <div style="font-size: 11px; color: #6B7280; margin-top: 4px;">{latestBuilding.data.building_type} • {latestBuilding.data.condition}</div>}
                  </div>
                  <div style="background: linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%); padding: 16px; border-radius: 12px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                      <Package size={16} style="color: #2563EB;" />
                      <span style="font-size: 12px; color: #6B7280;">Inventory Value</span>
                    </div>
                    <div style="font-size: 22px; font-weight: 700; color: #1F2937;">{latestInventory?.data?.inventory_value_estimate ? formatCurrency(latestInventory.data.inventory_value_estimate) : '-'}</div>
                    {latestInventory?.data?.total_items_count && <div style="font-size: 11px; color: #6B7280; margin-top: 4px;">{latestInventory.data.total_items_count} items • {latestInventory.data.stock_level} stock</div>}
                  </div>
                  <div style="background: linear-gradient(135deg, #D1FAE5 0%, #ECFDF5 100%); padding: 16px; border-radius: 12px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                      <TrendingUp size={16} style="color: #059669;" />
                      <span style="font-size: 12px; color: #6B7280;">Monthly Cashflow</span>
                    </div>
                    <div style="font-size: 22px; font-weight: 700; color: #1F2937;">{latestLedger?.data?.monthly_cashflow_estimate ? formatCurrency(latestLedger.data.monthly_cashflow_estimate) : '-'}</div>
                    {latestLedger?.data?.daily_income_estimate && <div style="font-size: 11px; color: #6B7280; margin-top: 4px;">{formatCurrency(latestLedger.data.daily_income_estimate)}/day income</div>}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* BI Items Grid */}
        {filteredBI?.length > 0 ? (
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">
            {filteredBI.map(bi => {
              const typeConfig = {
                building: { icon: Building2, color: '#7C3AED', bg: '#F5F3FF' },
                inventory: { icon: Package, color: '#2563EB', bg: '#EFF6FF' },
                ledger: { icon: FileText, color: '#059669', bg: '#ECFDF5' },
              };
              const config = typeConfig[bi.type] || typeConfig.building;
              const Icon = config.icon;
              return (
                <div key={bi.id} style={`background: white; border: 1px solid ${newBiIds.has(bi.id) ? '#10B981' : '#E5E7EB'}; border-radius: 10px; overflow: hidden; ${newBiIds.has(bi.id) ? 'box-shadow: 0 0 0 2px #D1FAE5;' : ''}`}>
                  {bi.source?.image_url && (
                    <div style="position: relative;">
                      <img src={bi.source.image_url} alt="" style="width: 100%; height: 120px; object-fit: cover;" />
                      <div style={`position: absolute; top: 8px; left: 8px; display: flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 4px; background: ${config.bg}; font-size: 11px; font-weight: 600; color: ${config.color};`}>
                        <Icon size={12} /> {bi.type}
                      </div>
                      {newBiIds.has(bi.id) && <span style="position: absolute; top: 8px; right: 8px; background: #10B981; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600;">NEW</span>}
                    </div>
                  )}
                  <div style="padding: 12px;">
                    {!bi.source?.image_url && (
                      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                        <div style={`display: flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 4px; background: ${config.bg}; font-size: 11px; font-weight: 600; color: ${config.color};`}>
                          <Icon size={12} /> {bi.type}
                        </div>
                        {newBiIds.has(bi.id) && <span style="background: #10B981; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600;">NEW</span>}
                      </div>
                    )}
                    {bi.data && (
                      <div style="display: grid; gap: 4px; font-size: 13px;">
                        {bi.type === 'building' && <>
                          <div style="display: flex; justify-content: space-between;"><span style="color: #6B7280;">Value</span><span style="font-weight: 600;">{formatCurrency(bi.data.estimated_value)}</span></div>
                          <div style="display: flex; justify-content: space-between;"><span style="color: #6B7280;">Type</span><span>{bi.data.building_type}</span></div>
                          <div style="display: flex; justify-content: space-between;"><span style="color: #6B7280;">Condition</span><span style={`padding: 1px 6px; border-radius: 3px; font-size: 11px; ${bi.data.condition === 'Good' || bi.data.condition === 'Excellent' ? 'background: #D1FAE5; color: #065F46;' : 'background: #FEF3C7; color: #92400E;'}`}>{bi.data.condition}</span></div>
                        </>}
                        {bi.type === 'inventory' && <>
                          <div style="display: flex; justify-content: space-between;"><span style="color: #6B7280;">Value</span><span style="font-weight: 600;">{formatCurrency(bi.data.inventory_value_estimate)}</span></div>
                          <div style="display: flex; justify-content: space-between;"><span style="color: #6B7280;">Items</span><span>{bi.data.total_items_count}</span></div>
                          <div style="display: flex; justify-content: space-between;"><span style="color: #6B7280;">Stock</span><span style={`padding: 1px 6px; border-radius: 3px; font-size: 11px; ${bi.data.stock_level === 'High' || bi.data.stock_level === 'Medium' ? 'background: #D1FAE5; color: #065F46;' : 'background: #FEE2E2; color: #991B1B;'}`}>{bi.data.stock_level}</span></div>
                        </>}
                        {bi.type === 'ledger' && <>
                          <div style="display: flex; justify-content: space-between;"><span style="color: #6B7280;">Cashflow/mo</span><span style="font-weight: 600;">{formatCurrency(bi.data.monthly_cashflow_estimate)}</span></div>
                          <div style="display: flex; justify-content: space-between;"><span style="color: #6B7280;">Income/day</span><span style="color: #059669;">{formatCurrency(bi.data.daily_income_estimate)}</span></div>
                          <div style="display: flex; justify-content: space-between;"><span style="color: #6B7280;">Expense/day</span><span style="color: #DC2626;">{formatCurrency(bi.data.daily_expense_estimate)}</span></div>
                        </>}
                      </div>
                    )}
                    <div style="font-size: 10px; color: #9CA3AF; margin-top: 8px; text-align: right;">{formatDateTime(bi.analyzed_at)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : <div class="card" style="text-align: center; padding: 40px; color: #6B7280;">No business intelligence data yet</div>}
      </div>

      {/* Credit Score Dashboard */}
      <CreditScoreDashboard userData={data} />
    </div>
  );
}
