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
          <NavLink to="/" end className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
            <span className="icon">📊</span> Dashboard
          </NavLink>
          <NavLink to="/transactions" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
            <span className="icon">💸</span> Transactions
          </NavLink>
          <NavLink to="/budgets" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
            <span className="icon">🎯</span> Budgets
          </NavLink>
          <NavLink to="/reports" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
            <span className="icon">📈</span> Reports
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
            <span className="icon">👤</span> Profile
          </NavLink>
          <NavLink to="/recurring" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
  <span className="icon">🔄</span> Recurring
</NavLink>
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

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}