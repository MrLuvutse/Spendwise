import React, { useEffect, useState, useCallback } from 'react';
import { getAccounts, createAccount, updateAccount, deleteAccount } from '../utils/api';

const ACCOUNT_TYPES = [
  { value: 'cash',         label: 'Cash',         icon: '💵' },
  { value: 'bank',         label: 'Bank Account',  icon: '🏦' },
  { value: 'mobile_money', label: 'Mobile Money',  icon: '📱' },
  { value: 'savings',      label: 'Savings',       icon: '🐷' },
  { value: 'credit_card',  label: 'Credit Card',   icon: '💳' },
  { value: 'other',        label: 'Other',         icon: '💰' },
];

const COLORS = ['#22c55e','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899'];

const EMPTY_FORM = {
  name: '', type: 'bank', balance: '', currency: 'USD',
  color: '#22c55e', icon: '🏦', isDefault: false,
};

const CURRENCIES = ['USD','EUR','GBP','KES','ZAR','NGN','GHS','TZS','UGX','INR','AED'];

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAccounts();
      setAccounts(data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError('');
  };

  const openEdit = (account) => {
    setEditing(account._id);
    setForm({
      name:      account.name,
      type:      account.type,
      balance:   account.balance,
      currency:  account.currency,
      color:     account.color,
      icon:      account.icon,
      isDefault: account.isDefault,
    });
    setShowForm(true);
    setError('');
  };

  const handleTypeChange = (type) => {
    const found = ACCOUNT_TYPES.find((t) => t.value === type);
    setForm({ ...form, type, icon: found ? found.icon : '💰' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (editing) {
        await updateAccount(editing, form);
      } else {
        await createAccount({ ...form, balance: Number(form.balance) });
      }
      setShowForm(false);
      setEditing(null);
      fetchAccounts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save account');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this account?')) return;
    await deleteAccount(id);
    fetchAccounts();
  };

  const handleSetDefault = async (account) => {
    await updateAccount(account._id, { isDefault: true });
    fetchAccounts();
  };

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  return (
    <div>
      <div className="page-header">
        <h1>🏦 Accounts</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Account</button>
      </div>

      {/* Total balance */}
      <div className="card mb-4" style={{ textAlign: 'center', padding: '32px' }}>
        <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>
          Total Balance across all accounts
        </div>
        <div style={{ fontSize: '42px', fontWeight: 800, color: totalBalance >= 0 ? 'var(--green)' : 'var(--red)' }}>
          ${totalBalance.toLocaleString()}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
          {accounts.length} account{accounts.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Accounts grid */}
      {loading
        ? <p className="text-muted">Loading...</p>
        : accounts.length === 0
        ? <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>🏦</p>
            <p style={{ fontWeight: 600, marginBottom: '6px' }}>No accounts yet</p>
            <p className="text-muted" style={{ fontSize: '14px' }}>Add your cash, bank, or mobile money accounts</p>
          </div>
        : <div className="grid-2">
            {accounts.map((account) => (
              <div key={account._id} className="card" style={{ borderLeft: `4px solid ${account.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div style={{ fontSize: '36px' }}>{account.icon}</div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontWeight: 700, fontSize: '16px' }}>{account.name}</div>
                        {account.isDefault && (
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '99px', background: '#dcfce7', color: '#15803d', fontWeight: 500 }}>
                            Default
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {ACCOUNT_TYPES.find((t) => t.value === account.type)?.label} · {account.currency}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: account.balance >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      ${account.balance.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                  {!account.isDefault && (
                    <button className="btn btn-ghost" style={{ fontSize: '12px', padding: '4px 12px' }} onClick={() => handleSetDefault(account)}>
                      ⭐ Set Default
                    </button>
                  )}
                  <button className="btn btn-ghost" style={{ fontSize: '12px', padding: '4px 12px' }} onClick={() => openEdit(account)}>
                    Edit
                  </button>
                  <button className="btn btn-danger" style={{ fontSize: '12px', padding: '4px 12px' }} onClick={() => handleDelete(account._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
      }

      {/* Modal form */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '460px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '20px' }}>{editing ? 'Edit' : 'Add'} Account</h2>
            <form onSubmit={handleSubmit}>

              <div className="form-group">
                <label>Account Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. KCB Bank, M-Pesa, Cash Wallet" required />
              </div>

              <div className="form-group">
                <label>Account Type</label>
                <select value={form.type} onChange={(e) => handleTypeChange(e.target.value)}>
                  {ACCOUNT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Current Balance ($)</label>
                <input type="number" step="0.01" value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} placeholder="0.00" required />
              </div>

              <div className="form-group">
                <label>Currency</label>
                <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Color</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {COLORS.map((c) => (
                    <div
                      key={c}
                      onClick={() => setForm({ ...form, color: c })}
                      style={{
                        width: '28px', height: '28px',
                        borderRadius: '50%',
                        background: c,
                        cursor: 'pointer',
                        border: form.color === c ? '3px solid var(--text)' : '3px solid transparent',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                    style={{ width: 'auto', margin: 0 }}
                  />
                  Set as default account
                </label>
              </div>

              {error && <p className="error-msg">{error}</p>}

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button className="btn btn-primary" type="submit" disabled={saving} style={{ flex: 1 }}>
                  {saving ? 'Saving...' : editing ? 'Update' : 'Add Account'}
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