import { useState, useEffect } from 'preact/hooks';
import { User, TrendingUp, Briefcase, Search, BookOpen } from 'lucide-preact';
import { route } from 'preact-router';

export default function UserProfile({ phone }) {
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]);
  const [biData, setBiData] = useState([]);
  const [literacyWeeks, setLiteracyWeeks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (phone) loadProfile();
  }, [phone]);

  const loadProfile = async () => {
    try {
      const [usersRes, imagesRes, biRes, literacyRes] = await Promise.all([
        fetch('/api/users'),
        fetch(`/api/users/${phone}/images`),
        fetch(`/api/users/${phone}/business-intelligence`),
        fetch('/api/knowledge/financial-literacy')
      ]);

      const users = await usersRes.json();
      const foundUser = users.find(u => u.phone === phone);

      if (!foundUser) {
        alert('User not found');
        route('/');
        return;
      }

      setUser(foundUser);
      setImages(await imagesRes.json());
      setBiData(await biRes.json());
      setLiteracyWeeks(await literacyRes.json());
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const recalculateCredit = async () => {
    try {
      const res = await fetch(`/api/users/${phone}/recalculate-credit`, { method: 'POST' });
      const result = await res.json();

      if (res.ok) {
        alert(`✅ Credit score recalculated!\n\nScore: ${result.credit_score}/100\nRisk Level: ${result.credit_metrics?.risk_level}\nData Points: ${result.data_points} images`);
        loadProfile();
      } else {
        alert(`❌ ${result.error}\n\n${result.message || ''}`);
      }
    } catch (error) {
      alert('❌ Failed to recalculate credit score');
    }
  };

  if (loading) return <div class="loading">Loading user profile...</div>;
  if (!user) return <div class="loading">User not found</div>;

  const majelisInfo = user.majelis_name || 'Not assigned';
  const hasCredit = user.credit_score && user.credit_metrics;
  const cm = user.credit_metrics || {};

  return (
    <>
      <div class="profile-header">
        <a href="/" class="back-btn">← Back to Users</a>
        {biData.length > 0 && (
          <button class="btn btn-primary" onClick={recalculateCredit}>
            🔄 Recalculate Credit Score
          </button>
        )}
      </div>

      <div class="profile-grid">
        <div class="card">
          <h2 style="display: flex; align-items: center; gap: 8px;">
            <User size={20} /> Personal Information
          </h2>
          <div class="profile-row">
            <span class="profile-label">Name</span>
            <span class="profile-value">{user.name}</span>
          </div>
          <div class="profile-row">
            <span class="profile-label">Phone</span>
            <span class="profile-value">{user.phone}</span>
          </div>
          <div class="profile-row">
            <span class="profile-label">Business</span>
            <span class="profile-value">{user.business_type}</span>
          </div>
          <div class="profile-row">
            <span class="profile-label">Location</span>
            <span class="profile-value">{user.location}</span>
          </div>
          <div class="profile-row">
            <span class="profile-label">Majelis</span>
            <span class="profile-value">{majelisInfo}</span>
          </div>
          <div class="profile-row">
            <span class="profile-label">Status</span>
            <span class="profile-value">
              <span class={`status ${user.is_verified ? 'verified' : 'pending'}`}>
                {user.is_verified ? 'Verified' : 'Pending'}
              </span>
            </span>
          </div>
        </div>

        <div class="card">
          <h2 style="display: flex; align-items: center; gap: 8px;">
            <BookOpen size={20} /> Financial Literacy Progress
          </h2>
          {literacyWeeks.length > 0 ? (
            <div class="literacy-grid">
              {literacyWeeks.map((module) => {
                const weekNumber = module.week_number;
                const weekKey = `week_${String(weekNumber).padStart(2, '0')}`;
                const userProgress = user.literacy?.[weekKey];
                const score = userProgress?.score || 0;
                const completedDate = userProgress?.last_updated 
                  ? new Date(userProgress.last_updated).toLocaleDateString('id-ID')
                  : 'N/A';

                return (
                  <div key={weekKey} class="literacy-week">
                    <div class="literacy-week-header">
                      <span class="literacy-week-number">Week {weekNumber}</span>
                      <span class={`literacy-score ${score >= 70 ? 'score-pass' : 'score-pending'}`}>
                        {score}%
                      </span>
                    </div>
                    <div class="literacy-week-date">
                      Completed: {completedDate}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p class="empty-data-message">No literacy courses available</p>
          )}
        </div>

        <div class="card">
          <h2 style="display: flex; align-items: center; gap: 8px;">
            <TrendingUp size={20} /> Credit Score
          </h2>
          {hasCredit ? (
            <>
              <div class="score-display">
                <div class="score-label">Overall Credit Score</div>
                <div class={`score-number score-color-${user.credit_score >= 70 ? 'success' : user.credit_score >= 50 ? 'warning' : 'danger'}`}>
                  {user.credit_score}
                </div>
                <div class="score-label">out of 100</div>
              </div>
              <div class="profile-row">
                <span class="profile-label">Risk Level</span>
                <span class={`profile-value risk-level-${cm.risk_level === 'rendah' ? 'low' : cm.risk_level === 'sedang' ? 'medium' : 'high'}`}>
                  {cm.risk_level || 'N/A'}
                </span>
              </div>
              <div class="profile-row">
                <span class="profile-label">Data Points</span>
                <span class="profile-value">{cm.data_points || 0} images analyzed</span>
              </div>
            </>
          ) : (
            <p class="empty-data-message">No credit data available yet</p>
          )}
        </div>

        {hasCredit && (
          <div class="card full-width">
            <h2 style="display: flex; align-items: center; gap: 8px;">
              <Briefcase size={20} /> Business Metrics
            </h2>
            <div class="metric-grid">
              <div class="metric-item">
                <div class="metric-value">{cm.business_health_score || 0}</div>
                <div class="metric-label">Business Health</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">{cm.asset_score || 0}</div>
                <div class="metric-label">Asset Score</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">{cm.cashflow_score || 0}</div>
                <div class="metric-label">Cashflow Score</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">{cm.management_score || 0}</div>
                <div class="metric-label">Management Score</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">{cm.growth_potential || 0}</div>
                <div class="metric-label">Growth Potential</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">Rp {(cm.total_asset_value || 0).toLocaleString('id-ID')}</div>
                <div class="metric-label">Total Assets</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">Rp {(cm.total_inventory_value || 0).toLocaleString('id-ID')}</div>
                <div class="metric-label">Inventory Value</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">Rp {(cm.estimated_monthly_cashflow || 0).toLocaleString('id-ID')}</div>
                <div class="metric-label">Monthly Cashflow</div>
              </div>
              <div class="metric-item metric-full-width">
                <div class="metric-value metric-value-highlight">Rp {(cm.recommended_loan_amount || 0).toLocaleString('id-ID')}</div>
                <div class="metric-label">Recommended Loan Amount</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {biData.length > 0 && (
        <div class="card">
          <h2 style="display: flex; align-items: center; gap: 8px;">
            <Search size={20} /> Business Intelligence Analysis
          </h2>
          {biData.map((bi, index) => (
            <div key={bi.id || index} class="bi-card">
              <div class="bi-header">
                <div>
                  <div class="bi-category">{bi.category}</div>
                  <div class="bi-date">📅 {new Date(bi.analyzed_at).toLocaleString('id-ID')}</div>
                </div>
                <div class="bi-tag">
                  #{index + 1}
                </div>
              </div>
              {bi.insights && bi.insights.length > 0 && (
                <div class="bi-insights">
                  <strong class="bi-insights-title">Insights:</strong>
                  <ul class="bi-insights-list">
                    {bi.insights.map((insight, i) => <li key={i}>{insight}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
