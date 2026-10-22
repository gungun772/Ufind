// src/components/Navbar.jsx
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, Menu, X, Home, ClipboardList, Activity } from 'lucide-react'
import './Navbar.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  function closeMenu() { setMenuOpen(false) }

  return (
    <>
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="container navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo" onClick={closeMenu} aria-label="UFind home">
            <span className="navbar-logo-icon" aria-hidden="true">
              <Search size={18} strokeWidth={2.5} />
            </span>
            <span className="navbar-logo-name">U<span>Find</span></span>
          </Link>

          {/* Desktop nav */}
          <nav className="navbar-nav" aria-label="Site pages">
            <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <Home size={16} /> Home
            </NavLink>
            <NavLink to="/activity" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <Activity size={16} /> My Activity
            </NavLink>
          </nav>

          {/* Desktop actions */}
          <div className="navbar-actions">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/report/lost')}
            >
              I Lost Something
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/report/found')}
            >
              I Found Something
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="navbar-menu-btn"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(v => !v)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`navbar-mobile-drawer${menuOpen ? ' open' : ''}`} role="dialog" aria-label="Mobile navigation">
        <NavLink to="/" end className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`} onClick={closeMenu}>
          <Home size={18} /> Home
        </NavLink>
        <NavLink to="/activity" className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`} onClick={closeMenu}>
          <Activity size={18} /> My Activity
        </NavLink>
        <div style={{ height: 8 }} />
        <button
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => { navigate('/report/lost'); closeMenu() }}
        >
          I Lost Something
        </button>
        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => { navigate('/report/found'); closeMenu() }}
        >
          I Found Something
        </button>
      </div>
    </>
  )
}
