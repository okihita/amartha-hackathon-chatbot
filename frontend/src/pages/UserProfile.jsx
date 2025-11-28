import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { User, Building2, CreditCard, BookOpen, Users as UsersIcon, ArrowLeft } from 'lucide-preact';

export default function UserProfile({ phone }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchProfile();
  }, [phone]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${phone}/complete`);
      if (!res.ok) throw new Error('User not found');
      setData(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div class="card" style="text-align: center; padding: 40px;">Loading...</div>;
  if (error) return <div class="card" style="text-align: center; padding: 40px; color: var(--color-danger);">{error}</div>;
  if (!data) return null;

  const statusColors = {
    active: 'var(--color-success)',
    pending: 'var(--color-warning)',
    suspended: 'var(--color-danger)',
    inactive: 'var(--color-neutral)'
  };

  const maturityStars = (level) => '⭐'.repeat(level) + '☆'.repeat(5 - level);

  const literacyProgress = () => {
    if (!data.literacy) return { completed: 0, total: 15, percentage: 0 };
    const weeks = Object.keys(data.literacy).filter(k => k.startsWith('week_'));
    const completed = weeks.filter(w => data.literacy[w]?.score >= 70).length;
    return { completed, total: 15, percentage: Math.round((completed / 15) * 100) };
  };

  const currentDebt = data.loan?.history?.length > 0
    ? data.loan.history[data.loan.history.length - 1].balance_after
    : 0;

  const filteredBI = activeTab === 'all'
    ? data.business_intelligence
    : data.business_intelligence?.filter(bi => bi.type === activeTab);

  return (
    <div style="padding: 20px;">
      {/* Header */}
      <div class="card" style="margin-bottom: 20px;">
        <button onClick={() => window.history.back()} class="btn" style="margin-bottom: 16px;">
          <ArrowLeft size={20} style="margin-right: 8px;" />
          Back
        </button>
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <h1 style="margin: 0 0 8px 0;">{data.name}</h1>
            <p style="color: var(--color-neutral); margin: 0 0 4px 0;">{data.phone}</p>
            <p style="color: var(--color-neutral); font-size: 14px; margin: 0;">
              Joined {new Date(data.created_at).toLocaleDateString('id-ID')}
            </p>
          </div>
          <span class="status" style={`background: ${statusColors[data.status]}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 14px;`}>
            {data.status}
          </span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
        {/* Personal Info */}
        <div class="card">
          <div style="display: flex; align-items: center; margin-bottom: 16px;">
            <User size={24} style="color: var(--color-primary); margin-right: 8px;" />
            <h2 style="margin: 0;">Personal Info</h2>
          </div>
          {data.profile ? (
            <div>
              <p><strong>DOB:</strong> {data.profile.dob ? new Date(data.profile.dob).toLocaleDateString('id-ID') : '-'}</p>
              <p><strong>Gender:</strong> {data.profile.gender || '-'}</p>
              <p><strong>Address:</strong> {data.profile.address || '-'}</p>
            </div>
          ) : (
            <p style="color: var(--color-neutral);">No profile data</p>
          )}
        </div>

        {/* Business Info */}
        <div class="card">
          <div style="display: flex; align-items: center; margin-bottom: 16px;">
            <Building2 size={24} style="color: var(--color-primary); margin-right: 8px;" />
            <h2 style="margin: 0;">Business Info</h2>
          </div>
          {data.business ? (
            <div>
              <p><strong>Name:</strong> {data.business.name || '-'}</p>
              <p><strong>Location:</strong> {data.business.location || '-'}</p>
              <p><strong>Category:</strong> {data.business.category || '-'}</p>
              <p><strong>Maturity:</strong> {maturityStars(data.business.maturity_level)}</p>
            </div>
          ) : (
            <p style="color: var(--color-neutral);">No business data</p>
          )}
        </div>

        {/* Loan Status */}
        <div class="card" style="grid-column: 1 / -1;">
          <div style="display: flex; align-items: center; margin-bottom: 16px;">
            <CreditCard size={24} style="color: var(--color-success); margin-right: 8px;" />
            <h2 style="margin: 0;">Loan Status</h2>
          </div>
          {data.loan && data.loan.limit > 0 ? (
            <div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 16px;">
                <div style="text-align: center; padding: 16px; background: var(--color-primary); color: white; border-radius: 8px;">
                  <div style="font-size: 14px;">Total Limit</div>
                  <div style="font-size: 24px; font-weight: bold;">Rp {data.loan.limit.toLocaleString('id-ID')}</div>
                </div>
                <div style="text-align: center; padding: 16px; background: var(--color-warning); color: white; border-radius: 8px;">
                  <div style="font-size: 14px;">Current Debt</div>
                  <div style="font-size: 24px; font-weight: bold;">Rp {currentDebt.toLocaleString('id-ID')}</div>
                </div>
                <div style="text-align: center; padding: 16px; background: var(--color-success); color: white; border-radius: 8px;">
                  <div style="font-size: 14px;">Remaining</div>
                  <div style="font-size: 24px; font-weight: bold;">Rp {data.loan.remaining.toLocaleString('id-ID')}</div>
                </div>
              </div>
              {data.loan.next_payment_date && (
                <div style="padding: 16px; background: var(--color-warning-bg); border-radius: 8px; margin-bottom: 16px;">
                  <div style="font-weight: bold;">Next Payment</div>
                  <div>{new Date(data.loan.next_payment_date).toLocaleDateString('id-ID')} - Rp {data.loan.next_payment_amount.toLocaleString('id-ID')}</div>
                </div>
              )}
              {data.loan.history?.length > 0 && (
                <div>
                  <h3>Transaction History</h3>
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th style="text-align: right;">Amount</th>
                        <th style="text-align: right;">Balance After</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.loan.history.map(txn => (
                        <tr key={txn.id}>
                          <td>{new Date(txn.date).toLocaleDateString('id-ID')}</td>
                          <td>
                            <span class="status" style={`background: ${txn.type === 'disbursement' ? 'var(--color-primary)' : 'var(--color-success)'}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;`}>
                              {txn.type}
                            </span>
                          </td>
                          <td style="text-align: right;">Rp {txn.amount.toLocaleString('id-ID')}</td>
                          <td style="text-align: right; font-weight: bold;">Rp {txn.balance_after.toLocaleString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <p style="color: var(--color-neutral);">No active loan</p>
          )}
        </div>

        {/* Literacy Progress */}
        <div class="card">
          <div style="display: flex; align-items: center; margin-bottom: 16px;">
            <BookOpen size={24} style="color: var(--color-primary); margin-right: 8px;" />
            <h2 style="margin: 0;">Literacy Progress</h2>
          </div>
          {data.literacy ? (
            <div>
              <div style="margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="font-size: 14px; font-weight: bold;">Progress</span>
                  <span style="font-size: 14px; font-weight: bold;">{literacyProgress().percentage}%</span>
                </div>
                <div style="width: 100%; background: #e0e0e0; border-radius: 4px; height: 8px;">
                  <div style={`background: var(--color-primary); height: 8px; border-radius: 4px; width: ${literacyProgress().percentage}%`}></div>
                </div>
                <p style="font-size: 14px; color: var(--color-neutral); margin-top: 4px;">
                  {literacyProgress().completed} of {literacyProgress().total} weeks completed
                </p>
              </div>
              <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px;">
                {Array.from({ length: 15 }, (_, i) => {
                  const weekKey = `week_${String(i + 1).padStart(2, '0')}`;
                  const week = data.literacy[weekKey];
                  const score = week?.score || 0;
                  const color = score >= 70 ? 'var(--color-success)' : score > 0 ? 'var(--color-warning)' : '#ccc';
                  return (
                    <div key={weekKey} style={`background: ${color}; color: white; text-align: center; padding: 8px; border-radius: 4px; font-size: 12px; font-weight: bold;`} title={`Week ${i + 1}: ${score}`}>
                      {i + 1}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p style="color: var(--color-neutral);">No literacy data</p>
          )}
        </div>

        {/* Majelis */}
        <div class="card">
          <div style="display: flex; align-items: center; margin-bottom: 16px;">
            <UsersIcon size={24} style="color: var(--color-primary); margin-right: 8px;" />
            <h2 style="margin: 0;">Majelis</h2>
          </div>
          {data.majelis ? (
            <div>
              <p><strong>Name:</strong> {data.majelis.name}</p>
              <p><strong>Schedule:</strong> {data.majelis.schedule_day}, {data.majelis.schedule_time}</p>
              <p><strong>Location:</strong> {data.majelis.location}</p>
              <p><strong>Members:</strong> {data.majelis.member_count}</p>
            </div>
          ) : (
            <p style="color: var(--color-neutral);">Not in any majelis</p>
          )}
        </div>

        {/* Business Intelligence */}
        <div class="card" style="grid-column: 1 / -1;">
          <h2>Business Intelligence</h2>
          <div style="display: flex; gap: 8px; margin-bottom: 16px; overflow-x: auto;">
            {['all', 'ledger', 'inventory', 'building', 'transaction'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                class="btn"
                style={activeTab === tab ? 'background: var(--color-primary); color: white;' : ''}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          {filteredBI?.length > 0 ? (
            <div style="display: grid; gap: 16px;">
              {filteredBI.map(bi => (
                <div key={bi.id} style="border: 1px solid #ddd; border-radius: 8px; padding: 16px;">
                  <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                    <div>
                      <span style="font-weight: bold; font-size: 16px;">{bi.type.toUpperCase()}</span>
                      <span style="font-size: 14px; color: var(--color-neutral); margin-left: 8px;">({bi.analysis_category})</span>
                    </div>
                    <span style="font-size: 12px; color: var(--color-neutral);">{new Date(bi.analyzed_at).toLocaleDateString('id-ID')}</span>
                  </div>
                  
                  {/* Ledger Details */}
                  {bi.type === 'ledger' && bi.data && (
                    <div style="background: var(--color-success-bg); padding: 12px; border-radius: 8px; margin-bottom: 8px;">
                      <p style="margin: 4px 0;"><strong>Record Type:</strong> {bi.data.record_type}</p>
                      <p style="margin: 4px 0;"><strong>Daily Income:</strong> Rp {bi.data.daily_income_estimate?.toLocaleString('id-ID')}</p>
                      <p style="margin: 4px 0;"><strong>Daily Expense:</strong> Rp {bi.data.daily_expense_estimate?.toLocaleString('id-ID')}</p>
                      <p style="margin: 4px 0;"><strong>Daily Profit:</strong> Rp {bi.data.daily_profit_estimate?.toLocaleString('id-ID')}</p>
                      <p style="margin: 4px 0;"><strong>Monthly Cashflow:</strong> Rp {bi.data.monthly_cashflow_estimate?.toLocaleString('id-ID')}</p>
                      {bi.data.record_quality && <p style="margin: 4px 0;"><strong>Quality:</strong> {bi.data.record_quality}</p>}
                    </div>
                  )}
                  
                  {/* Inventory Details */}
                  {bi.type === 'inventory' && bi.data && (
                    <div style="background: var(--color-warning-bg); padding: 12px; border-radius: 8px; margin-bottom: 8px;">
                      <p style="margin: 4px 0;"><strong>Total Items:</strong> {bi.data.total_items_count}</p>
                      <p style="margin: 4px 0;"><strong>Inventory Value:</strong> Rp {bi.data.inventory_value_estimate?.toLocaleString('id-ID')}</p>
                      <p style="margin: 4px 0;"><strong>Stock Level:</strong> {bi.data.stock_level}</p>
                      {bi.data.turnover_indicator && <p style="margin: 4px 0;"><strong>Turnover:</strong> {bi.data.turnover_indicator}</p>}
                      {bi.data.items && bi.data.items.length > 0 && (
                        <div style="margin-top: 8px;">
                          <strong>Sample Items:</strong>
                          <ul style="margin: 4px 0; padding-left: 20px;">
                            {bi.data.items.slice(0, 3).map((item, idx) => (
                              <li key={idx}>{item.name} - {item.quantity_estimate} {item.unit}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Building Details */}
                  {bi.type === 'building' && bi.data && (
                    <div style="background: var(--color-primary-bg); padding: 12px; border-radius: 8px; margin-bottom: 8px;">
                      <p style="margin: 4px 0;"><strong>Type:</strong> {bi.data.building_type}</p>
                      <p style="margin: 4px 0;"><strong>Condition:</strong> {bi.data.condition}</p>
                      {bi.data.size_estimate && <p style="margin: 4px 0;"><strong>Size:</strong> {bi.data.size_estimate}</p>}
                      <p style="margin: 4px 0;"><strong>Location:</strong> {bi.data.location_type}</p>
                      {bi.data.visibility && <p style="margin: 4px 0;"><strong>Visibility:</strong> {bi.data.visibility}</p>}
                      <p style="margin: 4px 0;"><strong>Estimated Value:</strong> Rp {bi.data.estimated_value?.toLocaleString('id-ID')}</p>
                    </div>
                  )}
                  
                  {/* Transaction Details */}
                  {bi.type === 'transaction' && bi.data && (
                    <div style="background: var(--color-neutral-bg); padding: 12px; border-radius: 8px; margin-bottom: 8px;">
                      <p style="margin: 4px 0;"><strong>Transaction Count:</strong> {bi.data.transaction_count}</p>
                      <p style="margin: 4px 0;"><strong>Total Amount:</strong> Rp {bi.data.total_amount?.toLocaleString('id-ID')}</p>
                    </div>
                  )}
                  
                  {bi.source?.image_url && (
                    <img src={bi.source.image_url} alt="BI" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
                  )}
                  {bi.source?.caption && (
                    <p style="font-size: 14px; color: var(--color-neutral); font-style: italic; margin: 8px 0 0 0;">"{bi.source.caption}"</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style="color: var(--color-neutral);">No business intelligence data</p>
          )}
        </div>
      </div>
    </div>
  );
}
