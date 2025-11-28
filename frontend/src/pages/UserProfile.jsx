import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';

export default function UserProfile({ phone }) {
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]);
  const [biData, setBiData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (phone) loadProfile();
  }, [phone]);

  const loadProfile = async () => {
    try {
      const [usersRes, imagesRes, biRes] = await Promise.all([
        fetch('/api/users'),
        fetch(`/api/users/${phone}/images`),
        fetch(`/api/users/${phone}/business-intelligence`)
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
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <a href="/" class="back-btn">← Back to Users</a>
        {biData.length > 0 && (
          <button class="btn btn-primary" onClick={recalculateCredit}>
            🔄 Recalculate Credit Score
          </button>
        )}
      </div>

      <div class="profile-grid">
        <div class="card">
          <h2>👤 Personal Information</h2>
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
          <h2>📊 Credit Score</h2>
          {hasCredit ? (
            <>
              <div class="score-display">
                <div class="score-label">Overall Credit Score</div>
                <div class="score-number" style={`color: ${user.credit_score >= 70 ? '#28a745' : user.credit_score >= 50 ? '#ffc107' : '#dc3545'}`}>
                  {user.credit_score}
                </div>
                <div class="score-label">out of 100</div>
              </div>
              <div class="profile-row">
                <span class="profile-label">Risk Level</span>
                <span class="profile-value" style={`color: ${cm.risk_level === 'rendah' ? '#28a745' : cm.risk_level === 'sedang' ? '#ffc107' : '#dc3545'}; text-transform: uppercase;`}>
                  {cm.risk_level || 'N/A'}
                </span>
              </div>
              <div class="profile-row">
                <span class="profile-label">Data Points</span>
                <span class="profile-value">{cm.data_points || 0} images analyzed</span>
              </div>
            </>
          ) : (
            <p style="color: #999; padding: 20px; text-align: center;">No credit data available yet</p>
          )}
        </div>

        {hasCredit && (
          <div class="card full-width">
            <h2>💼 Business Metrics</h2>
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
              <div class="metric-item" style="grid-column: 1 / -1;">
                <div class="metric-value" style="color: #007bff;">Rp {(cm.recommended_loan_amount || 0).toLocaleString('id-ID')}</div>
                <div class="metric-label">Recommended Loan Amount</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {biData.length > 0 && (
        <div class="card">
          <h2>🔍 Business Intelligence Analysis</h2>
          {biData.map((bi, index) => (
            <div key={bi.id || index} style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 15px; background: white;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <div>
                  <div style="font-size: 16px; font-weight: 600;">{bi.category}</div>
                  <div style="font-size: 12px; color: #999;">📅 {new Date(bi.analyzed_at).toLocaleString('id-ID')}</div>
                </div>
                <div style="padding: 4px 12px; background: #e3f2fd; color: #1976d2; border-radius: 12px; font-size: 12px;">
                  #{index + 1}
                </div>
              </div>
              {bi.insights && bi.insights.length > 0 && (
                <div style="margin-top: 15px;">
                  <strong style="font-size: 13px;">Insights:</strong>
                  <ul style="margin-top: 8px; margin-left: 20px; font-size: 13px;">
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
