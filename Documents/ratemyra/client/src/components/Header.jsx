import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

function Header() {
  const { user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && navRef.current && !navRef.current.contains(event.target)) {
        const toggleButton = document.querySelector('.mobile-menu-toggle');
        if (toggleButton && !toggleButton.contains(event.target)) {
          setMobileMenuOpen(false);
        }
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent body scroll when menu is open
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo" onClick={() => setMobileMenuOpen(false)}>
            <img src="/favicon.png" alt="RateMyRA Logo" className="logo-image" />
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
          <nav ref={navRef} className={mobileMenuOpen ? 'mobile-open' : ''}>
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/search" onClick={() => setMobileMenuOpen(false)}>Search RAs</Link>
            <Link to="/add-ra" onClick={() => setMobileMenuOpen(false)}>Add RA</Link>
            <Link to="/add-staff" onClick={() => setMobileMenuOpen(false)}>Add Staff</Link>
            {isAdmin && (
              <>
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin</Link>
                <button onClick={handleLogout} className="link-button">
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
