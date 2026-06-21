const express = require('express');
const Goal    = require('../models/Goal');
const protect = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/goals
router.get('/', async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ deadline: 1 });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/goals
router.post('/', async (req, res) => {
  try {
    const goal = await Goal.create({ user: req.user._id, ...req.body });
    res.status(201).json(goal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/goals/:id — update or add savings
router.put('/:id', async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    // Auto mark completed
    if (goal.savedAmount >= goal.targetAmount) {
      goal.isCompleted = true;
      await goal.save();
    }

    res.json(goal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/goals/:id/deposit — add money to goal
router.post('/:id/deposit', async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0)
      return res.status(400).json({ message: 'Amount must be positive' });

    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    goal.savedAmount = Math.min(goal.savedAmount + Number(amount), goal.targetAmount);
    if (goal.savedAmount >= goal.targetAmount) goal.isCompleted = true;
    await goal.save();

    res.json(goal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/goals/:id
router.delete('/:id', async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json({ message: 'Goal deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;