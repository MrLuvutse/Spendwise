import React, { useEffect, useState, useCallback } from 'react';
import { getBudgets, saveBudget, deleteBudget, getSummary } from '../utils/api';

const EXPENSE_CATEGORIES = ['Food & Dining','Transport','Housing & Rent','Entertainment','Healthcare','Shopping','Education','Utilities','Other'];

export default function Budgets() {
  const [budgets,  setBudgets]  = useState([]);
  const [spending, setSpending] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState({ category: 'Food & Dining', limit: '' });
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  const now = new Date();
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();

  const fetchData = useCallback(async () => {
    const [b, s] = await Promise.all([getBudgets({ month, year }), getSummary({ month, year })]);
    setBudgets(b.data); setSpending(s.data.byCategory || {});
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await saveBudget({ ...form, limit: Number(form.limit), month, year });
      setShowForm(false); setForm({ category: 'Food & Dining', limit: '' }); fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save budget');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this budget?')) return;
    await deleteBudget(id); fetchData();
  };

  const getProgressColor = (pct) => pct >= 100 ? 'danger' : pct >= 75 ? 'warning' : 'safe';

  return (
    <div>
      <div className="page-header">
        <h1>Budgets</h1>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setError(''); }}>+ Set Budget</button>
      </div>

      <p className="text-muted mb-4" style={{ fontSize: '14px' }}>
        {now.toLocaleString('default', { month: 'long', year: 'numeric' })} — set spending limits per category
      </p>

      {budgets.length === 0
        ? <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>🎯</p>
            <p style={{ fontWeight: 600, marginBottom: '6px' }}>No budgets set yet</p>
            <p className="text-muted" style={{ fontSize: '14px' }}>Set a monthly budget to track your spending limits</p>
          </div>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {budgets.map((b) => {
              const spent = spending[b.category]?.total || 0;
              const pct   = Math.min((spent / b.limit) * 100, 100);
              const color = getProgressColor((spent / b.limit) * 100);
              return (
                <div className="card" key={b._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{b.category}</div>
                      <div className="text-muted" style={{ fontSize: '13px' }}>${spent.toLocaleString()} spent of ${b.limit.toLocaleString()} limit</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, color: color === 'danger' ? 'var(--red)' : color === 'warning' ? 'var(--yellow)' : 'var(--green)' }}>{pct.toFixed(0)}%</span>
                      <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => handleDelete(b._id)}>Remove</button>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress-bar__fill ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                  {(spent / b.limit) >= 0.9 && (
                    <p style={{ fontSize: '12px', color: color === 'danger' ? 'var(--red)' : 'var(--yellow)', marginTop: '6px' }}>
                      {color === 'danger' ? '⚠️ Budget exceeded!' : '⚡ Approaching limit'}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
      }

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '20px' }}>Set Budget</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Monthly Limit ($)</label>
                <input type="number" min="1" value={form.limit} onChange={(e) => setForm({ ...form, limit: e.target.value })} placeholder="e.g. 500" required />
              </div>
              {error && <p className="error-msg">{error}</p>}
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button className="btn btn-primary" type="submit" disabled={saving} style={{ flex: 1 }}>{saving ? 'Saving...' : 'Save Budget'}</button>
                <button className="btn btn-ghost"   type="button" onClick={() => setShowForm(false)} style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}