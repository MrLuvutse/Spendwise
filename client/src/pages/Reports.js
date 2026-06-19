import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { getTransactions } from '../utils/api';

function generateInsights(categoryData, totalIncome, totalExpense) {
  const insights = [];
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
  const topCategory = categoryData[0];

  if (savingsRate >= 20) {
    insights.push({ type: 'success', icon: '🎉', message: `Great job! You're saving ${savingsRate.toFixed(0)}% of your income this year.` });
  } else if (savingsRate >= 0) {
    insights.push({ type: 'warning', icon: '⚠️', message: `Your savings rate is ${savingsRate.toFixed(0)}%. Try to aim for at least 20%.` });
  } else {
    insights.push({ type: 'danger', icon: '🚨', message: `You're spending more than you earn! Cut expenses to get back on track.` });
  }

  if (topCategory) {
    const pct = totalExpense > 0 ? ((topCategory.total / totalExpense) * 100).toFixed(0) : 0;
    if (pct > 40) {
      insights.push({ type: 'warning', icon: '📊', message: `${topCategory.name} takes up ${pct}% of your spending. Consider reducing it.` });
    } else {
      insights.push({ type: 'success', icon: '✅', message: `Your spending is well distributed. Biggest category is ${topCategory.name} at ${pct}%.` });
    }
  }

  if (totalIncome === 0) {
    insights.push({ type: 'warning', icon: '💡', message: `No income recorded yet. Add your salary or freelance income to get better insights.` });
  }

  if (categoryData.length >= 5) {
    insights.push({ type: 'success', icon: '📈', message: `You're tracking ${categoryData.length} spending categories. Great financial awareness!` });
  }

  return insights;
}

export default function Reports() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    getTransactions({ limit: 500 })
      .then((res) => setTransactions(res.data.transactions))
      .finally(() => setLoading(false));
  }, []);

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const monthlyData = monthNames.map((name, i) => {
    const month = i + 1;
    const filtered = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === selectedYear && d.getMonth() + 1 === month;
    });
    const income  = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { name, income, expense, balance: income - expense };
  });

  const categoryTotals = {};
  transactions
    .filter((t) => t.type === 'expense' && new Date(t.date).getFullYear() === selectedYear)
    .forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

  const categoryData = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, total]) => ({ name, total }));

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
    const rows = transactions.map((t) => [
      new Date(t.date).toLocaleDateString(),
      t.type,
      t.category,
      t.description || '',
      t.amount,
    ]);
    const csv  = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `spendwise-${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="loading-screen">Loading reports...</div>;

  const totalIncome  = monthlyData.reduce((s, m) => s + m.income, 0);
  const totalExpense = monthlyData.reduce((s, m) => s + m.expense, 0);
  const totalBalance = totalIncome - totalExpense;

  return (
    <div>
      <div className="page-header">
        <h1>📈 Reports</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} style={{ padding: '8px 12px', borderRadius: '8px' }}>
            {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn btn-primary" onClick={exportCSV}>📤 Export CSV</button>
        </div>
      </div>

      <div className="grid-3 mb-4">
        <div className="card stat-card">
          <div className="stat-card__label">Total Income {selectedYear}</div>
          <div className="stat-card__value green">${totalIncome.toLocaleString()}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-card__label">Total Expenses {selectedYear}</div>
          <div className="stat-card__value red">${totalExpense.toLocaleString()}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-card__label">Net Balance {selectedYear}</div>
          <div className={`stat-card__value ${totalBalance >= 0 ? 'blue' : 'red'}`}>
            ${totalBalance.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <h2 style={{ fontSize: '16px', marginBottom: '16px' }}>Monthly Income vs Expenses</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthlyData} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
            <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="income"  name="Income"  fill="#22c55e" radius={[4,4,0,0]} />
            <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card mb-4">
        <h2 style={{ fontSize: '16px', marginBottom: '16px' }}>Balance Trend</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
            <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
            <Line type="monotone" dataKey="balance" name="Balance" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '16px', marginBottom: '16px' }}>Top Spending Categories</h2>
        {categoryData.length === 0
          ? <p className="text-muted">No expense data for {selectedYear}</p>
          : <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData} layout="vertical" barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={110} />
                <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
                <Bar dataKey="total" name="Spent" fill="#8b5cf6" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
        }
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h2 style={{ fontSize: '16px', marginBottom: '16px' }}>🤖 AI Spending Insights</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {categoryData.length === 0
            ? <p className="text-muted">Add some transactions to get AI insights.</p>
            : generateInsights(categoryData, totalIncome, totalExpense).map((insight, i) => (
                <div key={i} style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: insight.type === 'warning' ? '#fef3c7' : insight.type === 'danger' ? '#fee2e2' : '#dcfce7',
                  color: insight.type === 'warning' ? '#92400e' : insight.type === 'danger' ? '#991b1b' : '#166534',
                  fontSize: '14px',
                }}>
                  {insight.icon} {insight.message}
                </div>
              ))
          }
        </div>
      </div>
    </div>
  );
}