const express = require('express');
const Account = require('../models/Account');
const protect = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/accounts
router.get('/', async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user._id }).sort({ createdAt: 1 });
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/accounts
router.post('/', async (req, res) => {
  try {
    const { name, type, balance, currency, color, icon, isDefault } = req.body;

    // If new account is default, unset others
    if (isDefault) {
      await Account.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const account = await Account.create({
      user: req.user._id,
      name, type, balance, currency, color, icon, isDefault,
    });
    res.status(201).json(account);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/accounts/:id
router.put('/:id', async (req, res) => {
  try {
    if (req.body.isDefault) {
      await Account.updateMany({ user: req.user._id }, { isDefault: false });
    }
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!account) return res.status(404).json({ message: 'Account not found' });
    res.json(account);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/accounts/:id
router.delete('/:id', async (req, res) => {
  try {
    const account = await Account.findOneAndDelete({
      _id: req.params.id, user: req.user._id,
    });
    if (!account) return res.status(404).json({ message: 'Account not found' });
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;