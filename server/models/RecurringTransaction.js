const mongoose = require('mongoose');
const { CATEGORIES } = require('./Transaction');

const recurringSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be positive'],
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      default: 'monthly',
    },
    startDate: {
      type: Date,
      required: true,
    },
    lastProcessed: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    nextDue: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RecurringTransaction', recurringSchema);