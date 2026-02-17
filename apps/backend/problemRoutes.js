const express = require('express');
const { getDB } = require('./utils/jsonDb');

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDB();
  // Return summary (exclude test cases for list view to save bandwidth)
  const problems = db.problems.map(p => ({
    id: p.id,
    title: p.title,
    difficulty: p.difficulty,
    description: p.description
  }));
  res.json(problems);
});

router.get('/daily', (req, res) => {
  const db = getDB();

  // 1. Check for explicitly marked Daily Problem
  const dailySpecific = db.problems.find(p => p.isDaily === true);
  if (dailySpecific) {
    const { testCases, hiddenTestCases, ...safe } = dailySpecific;
    return res.json(safe);
  }

  // 2. Fallback to hash logic
  const today = new Date().toDateString();
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = ((hash << 5) - hash) + today.charCodeAt(i);
    hash |= 0;
  }

  const total = db.problems.length;
  if (total === 0) return res.status(404).json({ message: 'No problems available' });

  const index = Math.abs(hash) % total;
  const problem = db.problems[index];

  const { testCases, hiddenTestCases, ...safeProblem } = problem;
  res.json(safeProblem);
});

router.get('/:id', (req, res) => {
  const db = getDB();
  const problem = db.problems.find(p => p.id == req.params.id);

  if (!problem) {
    return res.status(404).json({ message: 'Problem not found' });
  }

  // Exclude hidden test cases if needed, but for now we might need them for running locally?
  // No, checking is done on backend. Frontend only needs examples.
  // Let's remove testCases from response to hide them from user inspection.
  const { testCases, ...safeProblem } = problem;

  res.json(safeProblem);
});

module.exports = router;
