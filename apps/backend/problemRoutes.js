const express = require('express');
const supabase = require('./utils/supabase');

const router = express.Router();

// Helper to map DB snake_case to Frontend camelCase
const mapProblem = (p) => {
  if (!p) return null;
  return {
    id: p.id,
    title: p.title,
    difficulty: p.difficulty,
    description: p.description,
    slug: p.slug,
    // Parse starter_code if it's a string
    starterCode: typeof p.starter_code === 'string' ? JSON.parse(p.starter_code) : p.starter_code,
    testCases: p.test_cases,
    // hiddenTestCases: p.hidden_test_cases, // Usually exclude
    metaData: p.meta_data,
    isDaily: p.is_daily
  };
};

router.get('/', async (req, res) => {
  try {
    const { data: problems, error } = await supabase
      .from('problems')
      .select('id, title, difficulty, description, slug, is_daily, starter_code')
      .order('id');

    if (error) throw error;

    const safeProblems = problems.map(p => ({
      ...mapProblem(p),
      testCases: undefined // Exclude for list view
    }));

    res.json(safeProblems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/daily', async (req, res) => {
  try {
    // 1. Try to fetch explicitly marked daily problem
    let { data: problem, error } = await supabase
      .from('problems')
      .select('*')
      .eq('is_daily', true)
      .single();

    if (!problem) {
      // 2. Fallback: random or based on date hash
      // Just list all IDs and pick one? Or just pick ID 1.
      const { data: all } = await supabase.from('problems').select('id');
      if (all && all.length > 0) {
        const today = new Date().toDateString();
        let hash = 0;
        for (let i = 0; i < today.length; i++) {
          hash = ((hash << 5) - hash) + today.charCodeAt(i);
          hash |= 0;
        }
        const index = Math.abs(hash) % all.length;
        const { data: fallback } = await supabase
          .from('problems')
          .select('*')
          .eq('id', all[index].id)
          .single();
        problem = fallback;
      }
    }

    if (!problem) return res.status(404).json({ message: 'No problems available' });

    // Remove hidden test cases
    const mapped = mapProblem(problem);
    delete mapped.hiddenTestCases; // Ensure hidden are gone

    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { data: problem, error } = await supabase
      .from('problems')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const mapped = mapProblem(problem);
    // Remove hidden 
    delete mapped.hiddenTestCases;

    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
