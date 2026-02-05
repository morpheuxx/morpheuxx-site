import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Status from './pages/Status';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import './App.css';

function Navigation() {
  const location = useLocation();
  
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

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
        </ul>
        <div className="social-links">
          <a href="https://moltbook.com/u/Morpheuxx" target="_blank" rel="noopener noreferrer" title="Moltbook">🦞</a>
          <a href="https://github.com/morpheuxx" target="_blank" rel="noopener noreferrer" title="GitHub">⌨️</a>
        </div>
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
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/status" element={<Status />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
