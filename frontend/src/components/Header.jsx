import { useState, useEffect } from 'preact/hooks';

export default function Header() {
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    const updatePath = () => {
      setCurrentPath(window.location.pathname);
    };

    updatePath();
    window.addEventListener('popstate', updatePath);

    // Listen for route changes
    const observer = new MutationObserver(updatePath);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('popstate', updatePath);
      observer.disconnect();
    };
  }, []);

  const handleNavClick = (e, path) => {
    e.preventDefault();
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    setCurrentPath(path);
  };

  return (
    <div class="header">
      <div class="header-content">
        <div>
          <h1>🏦 Amartha Admin Dashboard</h1>
          <div class="nav">
            <a
              href="/"
              class={currentPath === '/' ? 'active' : ''}
              onClick={(e) => handleNavClick(e, '/')}
            >
              👥 Users
            </a>
            <a
              href="/majelis"
              class={currentPath === '/majelis' ? 'active' : ''}
              onClick={(e) => handleNavClick(e, '/majelis')}
            >
              📅 Majelis
            </a>
            <a
              href="/business-types"
              class={currentPath === '/business-types' ? 'active' : ''}
              onClick={(e) => handleNavClick(e, '/business-types')}
            >
              🏪 Business Types
            </a>
            <a
              href="/financial-literacy"
              class={currentPath === '/financial-literacy' ? 'active' : ''}
              onClick={(e) => handleNavClick(e, '/financial-literacy')}
            >
              📚 Financial Literacy
            </a>
          </div>
        </div>
        <div class="admin-badge">Admin: <strong>Petugas Lapangan</strong></div>
      </div>
    </div>
  );
}
