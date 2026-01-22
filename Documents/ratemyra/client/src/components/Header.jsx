import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

function Header() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>RateMyRA</h1>
          </Link>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/search">Search RAs</Link>
            <Link to="/add-ra">Add RA</Link>
            {isAdmin && (
              <Link to="/admin">Admin</Link>
            )}
            {user ? (
              <button onClick={logout} className="link-button">
                Logout
              </button>
            ) : (
              <Link to="/login">Login</Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
