// Enterprise-grade shared layout
// Styles are loaded from /styles.css

function renderHeader(activePage) {
    return `
        <div class="header">
            <div class="header-content">
                <div>
                    <h1>🏦 Amartha Admin Dashboard</h1>
                    <div class="nav">
                        <a href="/" class="${activePage === 'users' ? 'active' : ''}">👥 Users</a>
                        <a href="/majelis" class="${activePage === 'majelis' ? 'active' : ''}">📅 Majelis</a>
                        <a href="/business-types" class="${activePage === 'business-types' ? 'active' : ''}">🏪 Business Types</a>
                        <a href="/financial-literacy" class="${activePage === 'financial-literacy' ? 'active' : ''}">📚 Financial Literacy</a>
                    </div>
                </div>
                <div class="admin-badge">Admin: <strong>Petugas Lapangan</strong></div>
            </div>
        </div>
    `;
}

// Export for use in pages
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { renderHeader };
}
