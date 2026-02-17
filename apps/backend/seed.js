const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Problem = require('./models/Problem');
const connectDB = require('./config/db');

dotenv.config();

const problems = [
  {
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    difficulty: 'Easy',
    testCases: [
      { input: JSON.stringify({ nums: [2, 7, 11, 15], target: 9 }), output: '[0, 1]' },
      { input: JSON.stringify({ nums: [3, 2, 4], target: 6 }), output: '[1, 2]' },
      { input: JSON.stringify({ nums: [3, 3], target: 6 }), output: '[0, 1]' }
    ]
  },
  {
    title: 'Add Two Numbers',
    description: 'You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.',
    difficulty: 'Medium',
    testCases: [
      { input: JSON.stringify({ l1: [2, 4, 3], l2: [5, 6, 4] }), output: '[7,0,8]' },
      { input: JSON.stringify({ l1: [0], l2: [0] }), output: '[0]' }
    ]
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    difficulty: 'Medium',
    testCases: [
      { input: '"abcabcbb"', output: '3' },
      { input: '"bbbbb"', output: '1' },
      { input: '"pwwkew"', output: '3' }
    ]
  }
];

const seedData = async () => {
  try {
    await connectDB();

    await Problem.deleteMany();
    console.log('Problems cleared');

    await Problem.insertMany(problems);
    console.log('Problems seeded');

    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

seedData();
