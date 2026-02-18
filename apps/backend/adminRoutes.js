const express = require('express');
const { fetchDailyProblem, fetchProblems, fetchProblemsBySlugs } = require('./utils/leetcodeFetcher');
const supabase = require('./utils/supabase');

const POPULAR_SLUGS = [
  "two-sum", "add-two-numbers", "longest-substring-without-repeating-characters",
  "median-of-two-sorted-arrays", "longest-palindromic-substring", "zigzag-conversion",
  "reverse-integer", "string-to-integer-atoi", "palindrome-number",
  "regular-expression-matching", "container-with-most-water", "roman-to-integer",
  "longest-common-prefix", "3sum", "3sum-closest", "letter-combinations-of-a-phone-number",
  "4sum", "remove-nth-node-from-end-of-list", "valid-parentheses", "merge-two-sorted-lists"
];

const router = express.Router();

// Fetch All Users (Admin Only)
router.get('/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Seed Route
router.post('/seed-leetcode', async (req, res) => {
  try {
    console.log("Seeding problems...");
    const problems = await fetchProblemsBySlugs(POPULAR_SLUGS);

    if (problems.length === 0) return res.status(500).json({ message: "Failed to fetch any problems" });

    const upserts = problems.map(p => ({
      id: parseInt(p.id),
      title: p.title,
      difficulty: p.difficulty,
      description: p.description,
      slug: p.slug,
      starter_code: JSON.stringify(p.starterCode), // Store as string if text, or use jsonb column
      test_cases: p.testCases,
      hidden_test_cases: p.hiddenTestCases,
      meta_data: p.metaData,
      is_daily: p.isDaily || false
    }));

    const { error } = await supabase.from('problems').upsert(upserts, { onConflict: 'id' });

    if (error) {
      console.error("Supabase Error:", error);
      throw error;
    }

    res.json({ message: `Seeded ${problems.length} problems successfully` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Seeding failed" });
  }
});

router.post('/fetch-daily', async (req, res) => {
  try {
    const problem = await fetchDailyProblem();
    if (!problem) return res.status(500).json({ message: "Failed to fetch daily problem" });

    // Reset previous daily flag
    // Update all problems: set is_daily = false
    await supabase.from('problems').update({ is_daily: false }).neq('id', 0); // Update all

    const upsert = {
      id: parseInt(problem.id),
      title: problem.title,
      difficulty: problem.difficulty,
      description: problem.description,
      slug: problem.slug,
      starter_code: JSON.stringify(problem.starterCode),
      test_cases: problem.testCases,
      hidden_test_cases: problem.hiddenTestCases,
      meta_data: problem.metaData,
      is_daily: true
    };

    const { error } = await supabase.from('problems').upsert(upsert, { onConflict: 'id' });
    if (error) throw error;

    res.json({ message: "Daily problem fetched", problem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post('/fetch-batch', async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const skip = parseInt(req.query.skip) || 0;

  try {
    const problems = await fetchProblems(limit, skip);

    if (problems.length === 0) return res.json({ message: "No problems found", count: 0 });

    const upserts = problems.map(p => ({
      id: parseInt(p.id),
      title: p.title,
      difficulty: p.difficulty,
      description: p.description,
      slug: p.slug,
      starter_code: JSON.stringify(p.starterCode),
      test_cases: p.testCases,
      hidden_test_cases: p.hiddenTestCases,
      meta_data: p.metaData,
      is_daily: false
    }));

    const { error } = await supabase.from('problems').upsert(upserts, { onConflict: 'id' });
    if (error) throw error;

    res.json({ message: `Fetched and upserted ${problems.length} problems.`, count: problems.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
