import React, { useEffect, useState, useCallback } from 'react';
import { getGoals, createGoal, deleteGoal, depositGoal } from '../utils/api';

const GOAL_CATEGORIES = [
  { value: 'emergency_fund', label: 'Emergency Fund', icon: '🆘' },
  { value: 'vacation',       label: 'Vacation',       icon: '✈️' },
  { value: 'education',      label: 'Education',      icon: '🎓' },
  { value: 'home',           label: 'Home',           icon: '🏠' },
  { value: 'car',            label: 'Car',            icon: '🚗' },
  { value: 'business',       label: 'Business',       icon: '💼' },
  { value: 'retirement',     label: 'Retirement',     icon: '👴' },
  { value: 'other',          label: 'Other',          icon: '🎯' },
];

const COLORS = ['#22c55e','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899'];

const EMPTY_FORM = {
  name: '', targetAmount: '', savedAmount: 0,
  category: 'other', icon: '🎯', color: '#22c55e',
  deadline: '',
};

export default function Goals() {
  const [goals,    setGoals]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [depositModal, setDepositModal] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getGoals();
      setGoals(data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const handleCategoryChange = (category) => {
    const found = GOAL_CATEGORIES.find((c) => c.value === category);
    setForm({ ...form, category, icon: found ? found.icon : '🎯' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await createGoal({
        ...form,
        targetAmount: Number(form.targetAmount),
        savedAmount:  Number(form.savedAmount),
      });
      setShowForm(false);
      setForm(EMPTY_FORM);
      fetchGoals();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save goal');
    } finally { setSaving(false); }
  };

  const handleDeposit = async () => {
    if (!depositAmount || Number(depositAmount) <= 0) return;
    try {
      await depositGoal(depositModal._id, { amount: Number(depositAmount) });
      setDepositModal(null);
      setDepositAmount('');
      fetchGoals();
    } catch (err) {
      setError('Failed to add savings');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    await deleteGoal(id);
    fetchGoals();
  };

  const getDaysLeft = (deadline) => {
    const diff = new Date(deadline) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getMonthlyNeeded = (goal) => {
    const daysLeft = getDaysLeft(goal.deadline);
    const monthsLeft = daysLeft / 30;
    const remaining = goal.targetAmount - goal.savedAmount;
    if (monthsLeft <= 0) return 0;
    return (remaining / monthsLeft).toFixed(0);
  };

  const totalSaved  = goals.reduce((s, g) => s + g.savedAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const completed   = goals.filter((g) => g.isCompleted).length;

  return (
    <div>
      <div className="page-header">
        <h1>📊 Financial Goals</h1>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setError(''); }}>
          + Add Goal
        </button>
      </div>

      {/* Summary */}
      <div className="grid-3 mb-4">
        <div className="card stat-card">
          <div className="stat-card__label">Total Saved</div>
          <div className="stat-card__value green">${totalSaved.toLocaleString()}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-card__label">Total Target</div>
          <div className="stat-card__value blue">${totalTarget.toLocaleString()}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-card__label">Goals Completed</div>
          <div className="stat-card__value" style={{ color: 'var(--yellow)' }}>
            {completed} / {goals.length}
          </div>
        </div>
      </div>

      {/* Goals list */}
      {loading
        ? <p className="text-muted">Loading...</p>
        : goals.length === 0
        ? <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>🎯</p>
            <p style={{ fontWeight: 600, marginBottom: '6px' }}>No goals yet</p>
            <p className="text-muted" style={{ fontSize: '14px' }}>Set a savings goal to start tracking your progress</p>
          </div>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {goals.map((goal) => {
              const pct      = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
              const daysLeft = getDaysLeft(goal.deadline);
              const monthly  = getMonthlyNeeded(goal);

              return (
                <div key={goal._id} className="card" style={{ borderLeft: `4px solid ${goal.color}` }}>
                  {goal.isCompleted && (
                    <div style={{ background: '#dcfce7', color: '#15803d', fontSize: '13px', fontWeight: 600, padding: '6px 12px', borderRadius: '8px', marginBottom: '12px', display: 'inline-block' }}>
                      🎉 Goal Completed!
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <div style={{ fontSize: '40px' }}>{goal.icon}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '17px' }}>{goal.name}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {GOAL_CATEGORIES.find((c) => c.value === goal.category)?.label}
                          {' · '}
                          {daysLeft > 0 ? `${daysLeft} days left` : '⚠️ Deadline passed'}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: goal.color }}>
                        ${goal.savedAmount.toLocaleString()}
                        <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 400 }}>
                          {' '}/ ${goal.targetAmount.toLocaleString()}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Save ~${monthly}/month to reach goal
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ background: 'var(--border)', borderRadius: '99px', height: '10px', overflow: 'hidden', marginBottom: '8px' }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: goal.color,
                      borderRadius: '99px',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                    <span>{pct.toFixed(0)}% saved</span>
                    <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {!goal.isCompleted && (
                      <button className="btn btn-primary" style={{ fontSize: '12px', padding: '5px 14px' }} onClick={() => { setDepositModal(goal); setDepositAmount(''); }}>
                        💰 Add Savings
                      </button>
                    )}
                    <button className="btn btn-danger" style={{ fontSize: '12px', padding: '5px 14px' }} onClick={() => handleDelete(goal._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
      }

      {/* Add Goal Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '460px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '20px' }}>Add Financial Goal</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Goal Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Emergency Fund, Dream Vacation" required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={(e) => handleCategoryChange(e.target.value)}>
                  {GOAL_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Target Amount ($)</label>
                <input type="number" min="1" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} placeholder="e.g. 5000" required />
              </div>
              <div className="form-group">
                <label>Already Saved ($)</label>
                <input type="number" min="0" value={form.savedAmount} onChange={(e) => setForm({ ...form, savedAmount: e.target.value })} placeholder="0" />
              </div>
              <div className="form-group">
                <label>Deadline</label>
                <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Color</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {COLORS.map((c) => (
                    <div key={c} onClick={() => setForm({ ...form, color: c })} style={{ width: '28px', height: '28px', borderRadius: '50%', background: c, cursor: 'pointer', border: form.color === c ? '3px solid var(--text)' : '3px solid transparent' }} />
                  ))}
                </div>
              </div>
              {error && <p className="error-msg">{error}</p>}
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button className="btn btn-primary" type="submit" disabled={saving} style={{ flex: 1 }}>
                  {saving ? 'Saving...' : 'Add Goal'}
                </button>
                <button className="btn btn-ghost" type="button" onClick={() => setShowForm(false)} style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {depositModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '360px' }}>
            <h2 style={{ marginBottom: '8px' }}>💰 Add Savings</h2>
            <p className="text-muted" style={{ fontSize: '14px', marginBottom: '20px' }}>
              Adding to: <strong>{depositModal.name}</strong><br />
              Remaining: <strong>${(depositModal.targetAmount - depositModal.savedAmount).toLocaleString()}</strong>
            </p>
            <div className="form-group">
              <label>Amount to Add ($)</label>
              <input type="number" min="1" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="e.g. 500" autoFocus />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button className="btn btn-primary" onClick={handleDeposit} style={{ flex: 1 }}>Add Savings</button>
              <button className="btn btn-ghost" onClick={() => setDepositModal(null)} style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}