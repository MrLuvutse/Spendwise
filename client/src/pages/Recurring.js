import React, { useEffect, useState, useCallback } from 'react';
import { getRecurring, createRecurring, updateRecurring, deleteRecurring, processRecurring } from '../utils/api';

const CATEGORIES = ['Food & Dining','Transport','Housing & Rent','Entertainment','Healthcare','Shopping','Education','Utilities','Salary','Freelance','Investment','Other'];
const EMPTY_FORM = { type: 'expense', amount: '', category: 'Food & Dining', description: '', frequency: 'monthly', startDate: new Date().toISOString().split('T')[0] };

const FREQUENCY_LABELS = { daily: '📅 Daily', weekly: '📅 Weekly', monthly: '📅 Monthly', yearly: '📅 Yearly' };
// const FREQUENCY_COLORS = { daily: '#3b82f6', weekly: '#8b5cf6', monthly: '#22c55e', yearly: '#f59e0b' };

export default function Recurring() {
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const [msg,      setMsg]      = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchRecurring = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getRecurring();
      setItems(data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRecurring(); }, [fetchRecurring]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await createRecurring(form);
      setShowForm(false);
      setForm(EMPTY_FORM);
      fetchRecurring();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleToggle = async (item) => {
    await updateRecurring(item._id, { isActive: !item.isActive });
    fetchRecurring();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this recurring transaction?')) return;
    await deleteRecurring(id);
    fetchRecurring();
  };

  const handleProcess = async () => {
    setProcessing(true); setMsg('');
    try {
      const { data } = await processRecurring();
      setMsg(`✅ Processed ${data.processed} transaction${data.processed !== 1 ? 's' : ''}!`);
      fetchRecurring();
    } catch (err) {
      setMsg('❌ Failed to process transactions');
    } finally { setProcessing(false); }
  };

  const totalMonthly = items
    .filter((i) => i.isActive && i.frequency === 'monthly')
    .reduce((s, i) => i.type === 'income' ? s + i.amount : s - i.amount, 0);

  return (
    <div>
      <div className="page-header">
        <h1>🔄 Recurring</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-ghost" onClick={handleProcess} disabled={processing}>
            {processing ? 'Processing...' : '⚡ Process Due'}
          </button>
          <button className="btn btn-primary" onClick={() => { setShowForm(true); setError(''); }}>
            + Add Recurring
          </button>
        </div>
      </div>

      {msg && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', background: msg.startsWith('✅') ? '#dcfce7' : '#fee2e2', color: msg.startsWith('✅') ? '#15803d' : '#991b1b', marginBottom: '20px', fontSize: '14px' }}>
          {msg}
        </div>
      )}

      {/* Summary card */}
      <div className="grid-3 mb-4">
        <div className="card stat-card">
          <div className="stat-card__label">Monthly Income</div>
          <div className="stat-card__value green">
            ${items.filter((i) => i.isActive && i.frequency === 'monthly' && i.type === 'income').reduce((s, i) => s + i.amount, 0).toLocaleString()}
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-card__label">Monthly Expenses</div>
          <div className="stat-card__value red">
            ${items.filter((i) => i.isActive && i.frequency === 'monthly' && i.type === 'expense').reduce((s, i) => s + i.amount, 0).toLocaleString()}
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-card__label">Monthly Net</div>
          <div className={`stat-card__value ${totalMonthly >= 0 ? 'blue' : 'red'}`}>
            ${totalMonthly.toLocaleString()}
          </div>
        </div>
      </div>

      {/* List */}
      {loading
        ? <p className="text-muted">Loading...</p>
        : items.length === 0
        ? <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>🔄</p>
            <p style={{ fontWeight: 600, marginBottom: '6px' }}>No recurring transactions yet</p>
            <p className="text-muted" style={{ fontSize: '14px' }}>Add your salary, rent, or subscriptions to track them automatically</p>
          </div>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {items.map((item) => (
              <div key={item._id} className="card" style={{ opacity: item.isActive ? 1 : 0.5 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ fontSize: '28px' }}>
                      {item.type === 'income' ? '💰' : '💸'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '15px' }}>{item.description || item.category}</div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '99px', background: item.type === 'income' ? '#dcfce7' : '#fee2e2', color: item.type === 'income' ? '#15803d' : '#991b1b', fontWeight: 500 }}>
                          {item.type}
                        </span>
                        <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '99px', background: '#f1f5f9', color: '#64748b' }}>
                          {item.category}
                        </span>
                        <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '99px', background: '#ede9fe', color: '#6d28d9', fontWeight: 500 }}>
                          {FREQUENCY_LABELS[item.frequency]}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Next due: {new Date(item.nextDue).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: item.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
                      {item.type === 'income' ? '+' : '-'}${item.amount.toLocaleString()}
                    </div>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: '5px 12px', fontSize: '12px' }}
                      onClick={() => handleToggle(item)}
                    >
                      {item.isActive ? '⏸ Pause' : '▶ Resume'}
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '5px 12px', fontSize: '12px' }}
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
      }

      {/* Modal form */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '20px' }}>Add Recurring Transaction</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Type</label>
                <select name="type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="form-group">
                <label>Amount ($)</label>
                <input type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Monthly Rent, Netflix, Salary" />
              </div>
              <div className="form-group">
                <label>Frequency</label>
                <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
              </div>
              {error && <p className="error-msg">{error}</p>}
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button className="btn btn-primary" type="submit" disabled={saving} style={{ flex: 1 }}>
                  {saving ? 'Saving...' : 'Add'}
                </button>
                <button className="btn btn-ghost" type="button" onClick={() => setShowForm(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}