const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes        = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const budgetRoutes      = require('./routes/budgets');
const recurringRoutes   = require('./routes/recurring');
const accountRoutes     = require('./routes/accounts');
const goalRoutes        = require('./routes/goals');
const { startBudgetChecker } = require('./utils/budgetChecker');

const app = express();

// Middleware — must come before routes
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://spendwise-one-steel.vercel.app',
    process.env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth',         authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets',      budgetRoutes);
app.use('/api/recurring',    recurringRoutes);
app.use('/api/accounts',     accountRoutes);
app.use('/api/goals',        goalRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'SpendWise API running ✅' }));

// Manual budget check trigger
app.get('/api/check-budgets', async (req, res) => {
  const { checkBudgets } = require('./utils/budgetChecker');
  await checkBudgets();
  res.json({ message: 'Budget check triggered ✅' });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    startBudgetChecker();
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));