import React, { useEffect, useState, useCallback } from 'react';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../utils/api';

const CATEGORIES = ['Food & Dining','Transport','Housing & Rent','Entertainment','Healthcare','Shopping','Education','Utilities','Salary','Freelance','Investment','Other'];
const EMPTY_FORM = { type: 'expense', amount: '', category: 'Food & Dining', description: '', date: new Date().toISOString().split('T')[0] };

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [filter,   setFilter]   = useState({ type: '', category: '' });
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.type)     params.type     = filter.type;
      if (filter.category) params.category = filter.category;
      const { data } = await getTransactions(params);
      setTransactions(data.transactions);
    } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const openAdd  = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); setError(''); };
  const openEdit = (t) => { setEditing(t._id); setForm({ type: t.type, amount: t.amount, category: t.category, description: t.description || '', date: t.date.split('T')[0] }); setShowForm(true); setError(''); };
  const closeForm = () => { setShowForm(false); setEditing(null); };
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (editing) { await updateTransaction(editing, form); } else { await createTransaction(form); }
      closeForm(); fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    await deleteTransaction(id); fetchTransactions();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Transactions</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Transaction</button>
      </div>

      <div className="card mb-4" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })} style={{ flex: 1, minWidth: '120px' }}>
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })} style={{ flex: 2, minWidth: '160px' }}>
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="btn btn-ghost" onClick={() => setFilter({ type: '', category: '' })}>Clear</button>
        </div>
      </div>

      <div className="card">
        {loading ? <p className="text-muted">Loading...</p>
          : transactions.length === 0 ? <p className="text-muted">No transactions found.</p>
          : <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Description</th><th>Category</th><th>Date</th><th>Amount</th><th>Type</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t._id}>
                      <td>{t.description || '—'}</td>
                      <td>{t.category}</td>
                      <td>{new Date(t.date).toLocaleDateString()}</td>
                      <td style={{ fontWeight: 600 }}>${Number(t.amount).toLocaleString()}</td>
                      <td><span className={`badge badge-${t.type}`}>{t.type}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn btn-ghost"  style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => openEdit(t)}>Edit</button>
                          <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => handleDelete(t._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        }
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '20px' }}>{editing ? 'Edit' : 'Add'} Transaction</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Type</label>
                <select name="type" value={form.type} onChange={handleChange}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="form-group">
                <label>Amount ($)</label>
                <input name="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={handleChange} placeholder="0.00" required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={form.category} onChange={handleChange}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <input name="description" value={form.description} onChange={handleChange} placeholder="e.g. Lunch at restaurant" />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input name="date" type="date" value={form.date} onChange={handleChange} required />
              </div>
              {error && <p className="error-msg">{error}</p>}
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button className="btn btn-primary" type="submit" disabled={saving} style={{ flex: 1 }}>{saving ? 'Saving...' : editing ? 'Update' : 'Add'}</button>
                <button className="btn btn-ghost"   type="button" onClick={closeForm}  style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}