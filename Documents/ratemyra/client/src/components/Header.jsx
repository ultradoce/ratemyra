import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

function Header() {
  const { user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo" onClick={() => setMobileMenuOpen(false)}>
            <h1>RateMyRA</h1>
          </Link>
          <button 
            className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <nav className={mobileMenuOpen ? 'mobile-open' : ''}>
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/search" onClick={() => setMobileMenuOpen(false)}>Search RAs</Link>
            <Link to="/add-ra" onClick={() => setMobileMenuOpen(false)}>Add RA</Link>
            {isAdmin && (
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin</Link>
            )}
            {user ? (
              <button onClick={handleLogout} className="link-button">
                Logout
              </button>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
