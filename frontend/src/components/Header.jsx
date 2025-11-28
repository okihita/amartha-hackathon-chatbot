import { Link } from 'preact-router/match';

export default function Header() {
  return (
    <div class="header">
      <div class="header-content">
        <div>
          <h1>🏦 Amartha Admin Dashboard</h1>
          <div class="nav">
            <Link href="/" activeClassName="active">👥 Users</Link>
            <Link href="/majelis" activeClassName="active">📅 Majelis</Link>
            <Link href="/business-types" activeClassName="active">🏪 Business Types</Link>
            <Link href="/financial-literacy" activeClassName="active">📚 Financial Literacy</Link>
          </div>
        </div>
        <div class="admin-badge">Admin: <strong>Petugas Lapangan</strong></div>
      </div>
    </div>
  );
}
