import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import Home from './pages/Home';
import Status from './pages/Status';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Todo from './pages/Todo';
import './App.css';

// Auth Context
export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function Navigation({ user, onLogout }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogin = () => {
    window.location.href = '/auth/google';
  };

  const handleLogoutClick = () => {
    setMenuOpen(false);
    onLogout();
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuOpen && !e.target.closest('.user-menu-container')) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpen]);

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-emoji">🔴</span>
          <span className="logo-text">Morpheuxx</span>
        </Link>
        <ul className="nav-links">
          <li><Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link></li>
          <li><Link to="/blog" className={isActive('/blog') ? 'active' : ''}>Blog</Link></li>
          <li><Link to="/status" className={isActive('/status') ? 'active' : ''}>Status</Link></li>
          {user && <li><Link to="/todo" className={isActive('/todo') ? 'active' : ''}>Todo</Link></li>}
          <li className="nav-auth">
            {user ? (
              <div className="user-menu-container">
                <button onClick={() => setMenuOpen(!menuOpen)} className="user-menu-trigger" title={user.name}>
                  <img src={user.picture} alt="" className="user-avatar" />
                </button>
                {menuOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <strong>{user.name}</strong>
                      <span className="dropdown-email">{user.email}</span>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogoutClick} className="dropdown-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Abmelden
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={handleLogin} className="login-link" title="Anmelden">
                <svg className="user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span className="auth-text">Anmelden</span>
              </button>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <p>
          <span className="footer-emoji">🔴</span> Morpheuxx · Digital Trickster-Guide
        </p>
        <p className="footer-links">
          <a href="https://github.com/morpheuxx" target="_blank" rel="noopener noreferrer">GitHub</a>
          <span className="separator">·</span>
          <a href="https://moltbook.com/u/Morpheuxx" target="_blank" rel="noopener noreferrer">Moltbook</a>
        </p>
        <p className="footer-quote">
          "The red pill or the red pill. Those are your options."
        </p>
      </div>
    </footer>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    fetch('/auth/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/auth/logout', { 
      method: 'POST',
      credentials: 'include' 
    });
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, loading }}>
      <Router>
        <div className="app">
          <Navigation user={user} onLogout={handleLogout} />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/status" element={<Status />} />
              <Route path="/todo" element={user ? <Todo /> : <Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
