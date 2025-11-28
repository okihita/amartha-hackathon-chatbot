import { useState, useEffect } from 'preact/hooks';
import { Users, UsersRound, Briefcase, BookOpen, HelpCircle, Gamepad2 } from 'lucide-preact';

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
          <h1 style="display: flex; align-items: center; gap: 12px;">
            <img src="/assets/logo.png" alt="Amartha" style="height: 36px; width: auto;" />
            Admin Dashboard
          </h1>
          <div class="nav">
            <a
              href="/"
              class={currentPath === '/' ? 'active' : ''}
              onClick={(e) => handleNavClick(e, '/')}
            >
              <Users size={16} /> Users
            </a>
            <a
              href="/majelis"
              class={currentPath === '/majelis' ? 'active' : ''}
              onClick={(e) => handleNavClick(e, '/majelis')}
            >
              <UsersRound size={16} /> Majelis
            </a>
            <a
              href="/business-types"
              class={currentPath === '/business-types' ? 'active' : ''}
              onClick={(e) => handleNavClick(e, '/business-types')}
            >
              <Briefcase size={16} /> Business Types
            </a>
            <a
              href="/financial-literacy"
              class={currentPath === '/financial-literacy' ? 'active' : ''}
              onClick={(e) => handleNavClick(e, '/financial-literacy')}
            >
              <BookOpen size={16} /> Financial Literacy
            </a>
            <a
              href="/how-it-works"
              class={currentPath === '/how-it-works' ? 'active' : ''}
              onClick={(e) => handleNavClick(e, '/how-it-works')}
            >
              <HelpCircle size={16} /> Cara Kerja
            </a>
            <a
              href="/demo"
              class={currentPath === '/demo' ? 'active' : ''}
              onClick={(e) => handleNavClick(e, '/demo')}
            >
              <Gamepad2 size={16} /> Demo
            </a>
          </div>
        </div>
        <div class="admin-badge">
          <span>👤</span> Admin: <strong>Petugas Lapangan</strong>
        </div>
      </div>
    </div>
  );
}
