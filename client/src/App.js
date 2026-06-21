import React from 'react';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login        from './pages/Login';
import Register     from './pages/Register';
import Dashboard    from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets      from './pages/Budgets';
import Layout       from './components/Layout';
import Recurring from './pages/Recurring';

import './index.css';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
       <Routes>
  <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
  <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

  <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
    <Route index                element={<Dashboard />} />
    <Route path="transactions"  element={<Transactions />} />
    <Route path="budgets"       element={<Budgets />} />
    <Route path="reports"       element={<Reports />} />
    <Route path="profile" element={<Profile />} />
    <Route path="recurring" element={<Recurring />} />
  </Route>
</Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}