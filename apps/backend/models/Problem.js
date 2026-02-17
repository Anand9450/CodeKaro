const mongoose = require('mongoose');

const problemSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    testCases: [
      {
        input: {
          type: String,
          required: true,
        },
        output: {
          type: String,
          required: true,
        },
      },
    ],
    // Optional fields for better UI/UX
    slug: {
      type: String,
      unique: true,
    },
    examples: [
      {
        input: String,
        output: String,
        explanation: String
      }
    ],
    constraints: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true,
  }
);

// Simple slug generator before saving
problemSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title.toLowerCase().split(' ').join('-');
  }
  next();
});

module.exports = mongoose.model('Problem', problemSchema);
