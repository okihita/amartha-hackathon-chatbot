// Shared layout and styles
const SHARED_STYLES = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 1400px; margin: 0 auto; }
    .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; }
    .header h1 { font-size: 24px; color: #333; margin-bottom: 10px; }
    .nav { display: flex; gap: 15px; margin-top: 10px; }
    .nav a { padding: 8px 16px; background: #f0f0f0; border-radius: 4px; text-decoration: none; color: #333; font-weight: 500; transition: all 0.2s; }
    .nav a:hover { background: #e0e0e0; }
    .nav a.active { background: #007bff; color: white; }
    .admin-badge { background: #f0f0f0; padding: 8px 16px; border-radius: 4px; font-size: 14px; }
    .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
    .card h2 { font-size: 18px; margin-bottom: 20px; color: #333; }
    .btn { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
    .btn-primary { background: #007bff; color: white; }
    .btn-primary:hover { background: #0056b3; }
    .btn-success { background: #28a745; color: white; }
    .btn-success:hover { background: #218838; }
    .btn-danger { background: #dc3545; color: white; }
    .btn-danger:hover { background: #c82333; }
    .btn-secondary { background: #6c757d; color: white; }
    .btn-secondary:hover { background: #5a6268; }
    .btn-delete { background: #6c757d; color: white; }
    .btn-delete:hover { background: #5a6268; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    .loading { text-align: center; padding: 40px; color: #666; }
    .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; }
    .modal.active { display: flex; align-items: center; justify-content: center; }
    .modal-content { background: white; padding: 30px; border-radius: 8px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; }
    .modal-content h2 { margin-bottom: 20px; }
    .form-group { margin-bottom: 15px; }
    .form-group label { display: block; margin-bottom: 5px; font-weight: 500; }
    .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
    .form-group textarea { min-height: 80px; }
    .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
`;

function renderHeader(activePage) {
    return `
        <div class="header">
            <div>
                <h1>🏦 Amartha Admin Dashboard</h1>
                <div class="nav">
                    <a href="/" class="${activePage === 'users' ? 'active' : ''}">👥 Users</a>
                    <a href="/majelis" class="${activePage === 'majelis' ? 'active' : ''}">📅 Majelis</a>
                </div>
            </div>
            <div class="admin-badge">Admin: <strong>Petugas Lapangan</strong></div>
        </div>
    `;
}

// Export for use in pages
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SHARED_STYLES, renderHeader };
}
