const express   = require('express');
const Recurring = require('../models/RecurringTransaction');
const Transaction = require('../models/Transaction');
const protect   = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// Helper: calculate next due date
const getNextDue = (date, frequency) => {
  const next = new Date(date);
  switch (frequency) {
    case 'daily':   next.setDate(next.getDate() + 1);       break;
    case 'weekly':  next.setDate(next.getDate() + 7);       break;
    case 'monthly': next.setMonth(next.getMonth() + 1);     break;
    case 'yearly':  next.setFullYear(next.getFullYear() + 1); break;
  }
  return next;
};

// GET /api/recurring
router.get('/', async (req, res) => {
  try {
    const recurring = await Recurring.find({ user: req.user._id }).sort({ nextDue: 1 });
    res.json(recurring);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/recurring
router.post('/', async (req, res) => {
  try {
    const { type, amount, category, description, frequency, startDate } = req.body;
    const recurring = await Recurring.create({
      user: req.user._id,
      type, amount, category, description, frequency,
      startDate: new Date(startDate),
      nextDue:   new Date(startDate),
    });
    res.status(201).json(recurring);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/recurring/:id — toggle active
router.put('/:id', async (req, res) => {
  try {
    const recurring = await Recurring.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!recurring) return res.status(404).json({ message: 'Not found' });
    res.json(recurring);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/recurring/:id
router.delete('/:id', async (req, res) => {
  try {
    const recurring = await Recurring.findOneAndDelete({
      _id: req.params.id, user: req.user._id,
    });
    if (!recurring) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/recurring/process — manually process due transactions
router.post('/process', async (req, res) => {
  try {
    const now = new Date();
    const due = await Recurring.find({
      user:     req.user._id,
      isActive: true,
      nextDue:  { $lte: now },
    });

    const created = [];

    for (const r of due) {
      // Create the actual transaction
      const transaction = await Transaction.create({
        user:        r.user,
        type:        r.type,
        amount:      r.amount,
        category:    r.category,
        description: r.description || `Recurring: ${r.description}`,
        date:        now,
      });

      created.push(transaction);

      // Update next due date
      r.lastProcessed = now;
      r.nextDue = getNextDue(r.nextDue, r.frequency);
      await r.save();
    }

    res.json({ processed: created.length, transactions: created });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;