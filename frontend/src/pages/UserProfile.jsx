import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { User, Building2, CreditCard, BookOpen, Users as UsersIcon, ArrowLeft, Target, Calendar, Phone, TrendingUp, Shield, AlertTriangle, CheckCircle, Activity, PieChart, BarChart3, Clock, Zap, Award, FileText, Package } from 'lucide-preact';

// MOCK DATA GENERATOR - All data is simulated for demonstration
const generateMockCreditData = (userData) => {
  const seed = userData.phone?.slice(-4) || '1234';
  const seedNum = parseInt(seed, 10) || 1234;
  const pseudoRandom = (n) => ((seedNum * n) % 100);
  
  const baseScore = 650 + pseudoRandom(7) + (userData.status === 'active' ? 50 : 0) + 
    (userData.business?.maturity_level || 0) * 20 + (userData.majelis ? 30 : 0);
  const score = Math.min(850, Math.max(300, baseScore));
  
  return {
    score,
    scoreHistory: [
      { month: 'Jun', score: score - 45 },
      { month: 'Jul', score: score - 32 },
      { month: 'Aug', score: score - 18 },
      { month: 'Sep', score: score - 8 },
      { month: 'Oct', score: score - 3 },
      { month: 'Nov', score },
    ],
    factors: [
      { name: 'Payment History', score: 75 + pseudoRandom(3), weight: 35, icon: Clock },
      { name: 'Credit Utilization', score: 60 + pseudoRandom(5), weight: 30, icon: PieChart },
      { name: 'Business Performance', score: 70 + pseudoRandom(7), weight: 15, icon: BarChart3 },
      { name: 'Majelis Engagement', score: 80 + pseudoRandom(2), weight: 10, icon: UsersIcon },
      { name: 'Financial Literacy', score: 50 + pseudoRandom(11), weight: 10, icon: BookOpen },
    ],
    riskMatrix: {
      probability: score >= 700 ? 'Low' : score >= 600 ? 'Medium' : 'High',
      impact: 'Medium',
      overall: score >= 700 ? 'Acceptable' : score >= 600 ? 'Monitor' : 'Elevated',
    },
    benchmarks: {
      portfolio: 685,
      industry: 670,
      region: 662,
    },
    loanEligibility: Math.round(score * 12000),
    interestRate: score >= 750 ? 12 : score >= 700 ? 14 : score >= 650 ? 16 : 18,
  };
};

const CreditScoreDashboard = ({ userData }) => {
  const mock = generateMockCreditData(userData);
  const { score, scoreHistory, factors, riskMatrix, benchmarks, loanEligibility, interestRate } = mock;

  const getScoreColor = (s) => s >= 750 ? '#10B981' : s >= 650 ? '#F59E0B' : '#EF4444';
  const getScoreGrade = (s) => s >= 800 ? 'A+' : s >= 750 ? 'A' : s >= 700 ? 'B+' : s >= 650 ? 'B' : s >= 600 ? 'C' : 'D';
  const getScoreLabel = (s) => s >= 800 ? 'Excellent' : s >= 750 ? 'Very Good' : s >= 700 ? 'Good' : s >= 650 ? 'Fair' : 'Needs Improvement';
  const getRiskColor = (r) => r === 'Low' || r === 'Acceptable' ? '#10B981' : r === 'Medium' || r === 'Monitor' ? '#F59E0B' : '#EF4444';
  const scorePercent = ((score - 300) / 550) * 100;

  const MockBadge = () => (
    <span style="background: #FEF3C7; color: #92400E; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; margin-left: 8px;">MOCK DATA</span>
  );

  return (
    <div style="margin-top: 32px;">
      {/* Section Header */}
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
        <div style="width: 4px; height: 32px; background: linear-gradient(180deg, #63297A 0%, #F9CF79 100%); border-radius: 2px;" />
        <h2 style="margin: 0; font-size: 22px; color: #1F2937;">Credit Risk Assessment</h2>
        <MockBadge />
      </div>

      {/* Executive Summary Row */}
      <div style="display: grid; grid-template-columns: 320px 1fr; gap: 24px; margin-bottom: 24px;">
        {/* Score Card */}
        <div class="card" style="text-align: center; padding: 28px;">
          <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #6B7280; margin-bottom: 16px;">Composite Credit Score</div>
          <div style="position: relative; width: 180px; height: 180px; margin: 0 auto;">
            <svg viewBox="0 0 180 180" style="transform: rotate(-90deg);">
              <circle cx="90" cy="90" r="75" fill="none" stroke="#E5E7EB" stroke-width="12" />
              <circle cx="90" cy="90" r="75" fill="none" stroke={getScoreColor(score)} stroke-width="12" stroke-dasharray={`${scorePercent * 4.71} 471`} stroke-linecap="round" />
            </svg>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
              <div style={`font-size: 44px; font-weight: 800; color: ${getScoreColor(score)}; line-height: 1;`}>{score}</div>
              <div style="font-size: 12px; color: #9CA3AF; margin-top: 4px;">/ 850</div>
            </div>
          </div>
          <div style={`margin-top: 16px; display: inline-flex; align-items: center; gap: 8px; padding: 8px 20px; border-radius: 20px; background: ${getScoreColor(score)}15;`}>
            <Award size={16} style={`color: ${getScoreColor(score)};`} />
            <span style={`font-size: 16px; font-weight: 700; color: ${getScoreColor(score)};`}>Grade {getScoreGrade(score)}</span>
          </div>
          <div style="font-size: 13px; color: #6B7280; margin-top: 8px;">{getScoreLabel(score)}</div>
        </div>

        {/* Trend & Benchmark */}
        <div class="card" style="padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div style="font-size: 14px; font-weight: 600; color: #374151;">6-Month Score Trend</div>
            <div style="display: flex; align-items: center; gap: 6px; color: #10B981; font-size: 13px; font-weight: 600;">
              <TrendingUp size={14} /> +{score - scoreHistory[0].score} pts
            </div>
          </div>
          {/* Mini Chart */}
          <div style="display: flex; align-items: end; gap: 12px; height: 100px; margin-bottom: 20px;">
            {scoreHistory.map((h, i) => {
              const height = ((h.score - 300) / 550) * 100;
              return (
                <div key={i} style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                  <div style={`width: 100%; background: ${i === scoreHistory.length - 1 ? '#63297A' : '#E5E7EB'}; border-radius: 4px 4px 0 0; height: ${height}%;`} />
                  <span style="font-size: 11px; color: #6B7280;">{h.month}</span>
                </div>
              );
            })}
          </div>
          {/* Benchmarks */}
          <div style="border-top: 1px solid #E5E7EB; padding-top: 16px;">
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #6B7280; margin-bottom: 12px;">Benchmark Comparison</div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
              {[
                { label: 'Portfolio Avg', value: benchmarks.portfolio, diff: score - benchmarks.portfolio },
                { label: 'Industry Avg', value: benchmarks.industry, diff: score - benchmarks.industry },
                { label: 'Regional Avg', value: benchmarks.region, diff: score - benchmarks.region },
              ].map((b, i) => (
                <div key={i} style="text-align: center; padding: 12px; background: #F9FAFB; border-radius: 8px;">
                  <div style="font-size: 18px; font-weight: 700; color: #1F2937;">{b.value}</div>
                  <div style="font-size: 11px; color: #6B7280; margin: 2px 0;">{b.label}</div>
                  <div style={`font-size: 12px; font-weight: 600; color: ${b.diff >= 0 ? '#10B981' : '#EF4444'};`}>{b.diff >= 0 ? '+' : ''}{b.diff}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Factor Analysis */}
      <div class="card" style="margin-bottom: 24px; padding: 24px;">
        <div style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 20px;">Score Factor Analysis</div>
        <div style="display: grid; gap: 16px;">
          {factors.map((f, i) => {
            const Icon = f.icon;
            const status = f.score >= 80 ? 'excellent' : f.score >= 65 ? 'good' : f.score >= 50 ? 'fair' : 'poor';
            const statusColor = status === 'excellent' ? '#10B981' : status === 'good' ? '#3B82F6' : status === 'fair' ? '#F59E0B' : '#EF4444';
            return (
              <div key={i} style="display: grid; grid-template-columns: 200px 1fr 80px 80px; align-items: center; gap: 16px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style={`width: 32px; height: 32px; border-radius: 8px; background: ${statusColor}15; display: flex; align-items: center; justify-content: center;`}>
                    <Icon size={16} style={`color: ${statusColor};`} />
                  </div>
                  <span style="font-size: 14px; color: #374151;">{f.name}</span>
                </div>
                <div style="height: 8px; background: #E5E7EB; border-radius: 4px; overflow: hidden;">
                  <div style={`height: 100%; width: ${f.score}%; background: ${statusColor}; border-radius: 4px; transition: width 0.5s;`} />
                </div>
                <div style="text-align: right; font-size: 15px; font-weight: 700; color: #1F2937;">{f.score}<span style="font-size: 12px; color: #9CA3AF;">/100</span></div>
                <div style={`text-align: center; font-size: 11px; padding: 4px 8px; border-radius: 4px; background: ${statusColor}15; color: ${statusColor}; font-weight: 600;`}>
                  {f.weight}% weight
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Risk Matrix & Loan Eligibility */}
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
        {/* Risk Matrix */}
        <div class="card" style="padding: 24px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
            <AlertTriangle size={18} style="color: #63297A;" />
            <span style="font-size: 14px; font-weight: 600; color: #374151;">Risk Assessment Matrix</span>
          </div>
          <div style="display: grid; gap: 12px;">
            {[
              { label: 'Default Probability', value: riskMatrix.probability },
              { label: 'Loss Impact', value: riskMatrix.impact },
              { label: 'Overall Risk Rating', value: riskMatrix.overall },
            ].map((r, i) => (
              <div key={i} style="display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background: #F9FAFB; border-radius: 8px;">
                <span style="font-size: 14px; color: #374151;">{r.label}</span>
                <span style={`font-size: 13px; font-weight: 700; padding: 4px 12px; border-radius: 4px; background: ${getRiskColor(r.value)}15; color: ${getRiskColor(r.value)};`}>{r.value}</span>
              </div>
            ))}
          </div>
          <div style="margin-top: 16px; padding: 12px; background: #F5F3FF; border-radius: 8px; border-left: 3px solid #63297A;">
            <div style="font-size: 12px; color: #5B21B6; font-weight: 600;">Analyst Note</div>
            <div style="font-size: 13px; color: #374151; margin-top: 4px;">
              {score >= 700 ? 'Low-risk profile. Recommend standard approval process.' : score >= 600 ? 'Moderate risk. Enhanced monitoring recommended.' : 'Elevated risk. Additional verification required.'}
            </div>
          </div>
        </div>

        {/* Loan Eligibility */}
        <div class="card" style="padding: 0; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #63297A 0%, #7E3D99 100%); padding: 24px; color: white;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
              <Zap size={18} />
              <span style="font-size: 14px; font-weight: 600;">Loan Eligibility Assessment</span>
            </div>
            <div style="font-size: 36px; font-weight: 800;">Rp {loanEligibility.toLocaleString('id-ID')}</div>
            <div style="font-size: 13px; opacity: 0.85; margin-top: 4px;">Maximum Recommended Limit</div>
          </div>
          <div style="padding: 20px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
              <div style="text-align: center; padding: 12px; background: #F9FAFB; border-radius: 8px;">
                <div style="font-size: 22px; font-weight: 700; color: #63297A;">{interestRate}%</div>
                <div style="font-size: 11px; color: #6B7280;">Suggested Rate p.a.</div>
              </div>
              <div style="text-align: center; padding: 12px; background: #F9FAFB; border-radius: 8px;">
                <div style="font-size: 22px; font-weight: 700; color: #63297A;">12</div>
                <div style="font-size: 11px; color: #6B7280;">Max Tenure (months)</div>
              </div>
            </div>
            <button class="btn btn-primary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;">
              <FileText size={16} /> Generate Full Report
            </button>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div style="margin-top: 20px; padding: 12px 16px; background: #FEF3C7; border-radius: 8px; border: 1px solid #FCD34D;">
        <div style="display: flex; align-items: flex-start; gap: 10px;">
          <AlertTriangle size={16} style="color: #92400E; flex-shrink: 0; margin-top: 2px;" />
          <div style="font-size: 12px; color: #92400E;">
            <strong>Disclaimer:</strong> This credit assessment uses mock/simulated data for demonstration purposes only. Actual credit decisions should be based on verified financial data and comply with applicable regulations.
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
