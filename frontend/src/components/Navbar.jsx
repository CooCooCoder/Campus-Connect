import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Users, LayoutDashboard, Sparkles, Activity } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar">
      <div className="container nav-container">
        <Link to="/" className="brand">
          <div className="brand-icon">
            <Calendar size={20} />
          </div>
          <span>CampusConnect</span>
        </Link>

        <nav className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/events" className={`nav-link ${isActive('/events') ? 'active' : ''}`}>
            Explore Events
          </Link>
          <Link to="/clubs" className={`nav-link ${isActive('/clubs') ? 'active' : ''}`}>
            Clubs
          </Link>
          <Link to="/organizer" className={`nav-link ${isActive('/organizer') ? 'active' : ''}`}>
            Organizer Portal
          </Link>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            background: '#ecfdf5',
            color: '#059669',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            <Activity size={12} />
            <span>API Online</span>
          </div>

          <Link to="/events" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <Sparkles size={16} />
            <span>Register Now</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
