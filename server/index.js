const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes        = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const budgetRoutes      = require('./routes/budgets');
const recurringRoutes = require('./routes/recurring');
const accountRoutes = require('./routes/accounts');
const goalRoutes = require('./routes/goals');
const { startBudgetChecker } = require('./utils/budgetChecker');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/auth',         authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets',      budgetRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/goals', goalRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'SpendWise API running ✅' }));

// Manual trigger for testing — visit http://localhost:5000/api/check-budgets
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