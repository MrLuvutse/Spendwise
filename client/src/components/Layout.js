import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="layout">
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
        </nav>
        <div className="sidebar__logout">
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