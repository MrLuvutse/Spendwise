const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Goal name is required'],
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: [1, 'Target must be at least 1'],
    },
    savedAmount: {
      type: Number,
      default: 0,
    },
    deadline: {
      type: Date,
      required: true,
    },
    icon: {
      type: String,
      default: '🎯',
    },
    color: {
      type: String,
      default: '#22c55e',
    },
    category: {
      type: String,
      enum: ['emergency_fund', 'vacation', 'education', 'home', 'car', 'business', 'retirement', 'other'],
      default: 'other',
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Goal', goalSchema);