import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getSummary, getTransactions } from '../utils/api';

const COLORS = ['#22c55e','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899'];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recent,  setRecent]  = useState([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();
  useEffect(() => {
  Promise.all([getSummary({ month, year }), getTransactions({ limit: 5 })])
    .then(([s, t]) => { setSummary(s.data); setRecent(t.data.transactions); })
    .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

 if (loading) return <div className="loading-screen">Loading dashboard...</div>;

  const pieData = Object.entries(summary?.byCategory || {}).map(([name, val]) => ({ name, value: val.total }));
  const barData = [
    { name: 'Income',  amount: summary?.totalIncome  || 0 },
    { name: 'Expense', amount: summary?.totalExpense || 0 },
    { name: 'Balance', amount: summary?.balance      || 0 },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <span className="text-muted" style={{ fontSize: '14px' }}>
          {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
      </div>

      <div className="grid-3 mb-4">
        <div className="card stat-card">
          <div className="stat-card__label">Total Income</div>
          <div className="stat-card__value green">${(summary?.totalIncome || 0).toLocaleString()}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-card__label">Total Expenses</div>
          <div className="stat-card__value red">${(summary?.totalExpense || 0).toLocaleString()}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-card__label">Balance</div>
          <div className={`stat-card__value ${(summary?.balance || 0) >= 0 ? 'blue' : 'red'}`}>
            ${(summary?.balance || 0).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid-2 mb-4">
        <div className="card">
          <h2 style={{ fontSize: '16px', marginBottom: '16px' }}>Spending by Category</h2>
          {pieData.length === 0
            ? <p className="text-muted" style={{ fontSize: '14px' }}>No expense data yet</p>
            : <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
          }
        </div>
        <div className="card">
          <h2 style={{ fontSize: '16px', marginBottom: '16px' }}>Income vs Expenses</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barSize={40}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
              <Bar dataKey="amount" radius={[6,6,0,0]}>
                {barData.map((_, i) => <Cell key={i} fill={i === 0 ? '#22c55e' : i === 1 ? '#ef4444' : '#3b82f6'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '16px', marginBottom: '16px' }}>Recent Transactions</h2>
        {recent.length === 0
          ? <p className="text-muted" style={{ fontSize: '14px' }}>No transactions yet. Add your first one!</p>
          : <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Description</th><th>Category</th><th>Date</th><th>Amount</th><th>Type</th></tr>
                </thead>
                <tbody>
                  {recent.map((t) => (
                    <tr key={t._id}>
                      <td>{t.description || '—'}</td>
                      <td>{t.category}</td>
                      <td>{new Date(t.date).toLocaleDateString()}</td>
                      <td style={{ fontWeight: 600 }}>${t.amount.toLocaleString()}</td>
                      <td><span className={`badge badge-${t.type}`}>{t.type}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        }
      </div>
    </div>
  );
}