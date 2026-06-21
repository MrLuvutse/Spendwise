import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => localStorage.getItem('sw_theme') === 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('sw_theme', dark ? 'dark' : 'light');
  }, [dark]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLinks = [
    { to: '/',            icon: '📊', label: 'Dashboard',    end: true },
    { to: '/transactions',icon: '💸', label: 'Transactions'  },
    { to: '/budgets',     icon: '🎯', label: 'Budgets'       },
    { to: '/accounts',    icon: '🏦', label: 'Accounts'      },
    { to: '/reports',     icon: '📈', label: 'Reports'       },
    { to: '/recurring',   icon: '🔄', label: 'Recurring'     },
    { to: '/profile',     icon: '👤', label: 'Profile'       },
  ];

  return (
    <div className="layout">
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <div className="mobile-topbar__logo">💰 SpendWise</div>
        <div className="mobile-topbar__actions">
          <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: '16px' }} onClick={() => setDark(!dark)}>
            {dark ? '☀️' : '🌙'}
          </button>
          <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: '13px' }} onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="sidebar">
        <div className="sidebar__logo">💰 SpendWise</div>
        <nav className="sidebar__nav">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}
            >
              <span className="icon">{link.icon}</span> {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__logout">
          <button
            className="btn btn-ghost"
            style={{ width: '100%', marginBottom: '8px' }}
            onClick={() => setDark(!dark)}
          >
            {dark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <div style={{ padding: '12px', fontSize: '13px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', marginBottom: '8px' }}>
            👤 {user?.name}
          </div>
          <button className="btn btn-ghost" style={{ width: '100%' }} onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav — show first 5 most important */}
      <nav className="mobile-bottom-nav">
        {navLinks.slice(0, 5).map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `mobile-bottom-nav__link ${isActive ? 'active' : ''}`}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}