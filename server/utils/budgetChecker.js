const cron = require('node-cron');
const Budget      = require('../models/Budget');
const Transaction = require('../models/Transaction');
const User        = require('../models/User');
const { sendBudgetAlert } = require('./emailService');

const checkBudgets = async () => {
  try {
    const now   = new Date();
    const month = now.getMonth() + 1;
    const year  = now.getFullYear();

    console.log(`🔍 Checking budgets for ${month}/${year}...`);

    const budgets = await Budget.find({ month, year });

    console.log(`Found ${budgets.length} budgets`);

    for (const budget of budgets) {
      const user = await User.findById(budget.user);
      if (!user) {
        console.log(`❌ User not found for budget ${budget._id}`);
        continue;
      }

      console.log(`Checking budget for ${user.email} — ${budget.category}`);

      const startDate = new Date(year, month - 1, 1);
      const endDate   = new Date(year, month, 0, 23, 59, 59);

      const transactions = await Transaction.find({
        user:     user._id,
        type:     'expense',
        category: budget.category,
        date:     { $gte: startDate, $lte: endDate },
      });

      const spent   = transactions.reduce((s, t) => s + t.amount, 0);
      const percent = (spent / budget.limit) * 100;

      console.log(`💰 ${budget.category}: spent $${spent} of $${budget.limit} (${percent.toFixed(0)}%)`);

      if (percent >= 90) {
        await sendBudgetAlert({
          to:       user.email,
          name:     user.name,
          category: budget.category,
          spent,
          limit:    budget.limit,
          percent,
        });
        console.log(`📧 Alert sent to ${user.email} for ${budget.category} at ${percent.toFixed(0)}%`);
      }
    }

    console.log('✅ Budget check complete');
  } catch (err) {
    console.error('Budget check error:', err.message);
  }
};

const startBudgetChecker = () => {
  cron.schedule('0 8 * * *', checkBudgets);
  console.log('⏰ Budget checker scheduled — runs daily at 8AM');
};

module.exports = { startBudgetChecker, checkBudgets };