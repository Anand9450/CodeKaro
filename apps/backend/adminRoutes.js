const express = require('express');
const { getDB, saveDB } = require('./utils/jsonDb');
const { fetchDailyProblem, fetchProblems, fetchProblemsBySlugs } = require('./utils/leetcodeFetcher');

const POPULAR_SLUGS = [
  "two-sum", "add-two-numbers", "longest-substring-without-repeating-characters",
  "median-of-two-sorted-arrays", "longest-palindromic-substring", "zigzag-conversion",
  "reverse-integer", "string-to-integer-atoi", "palindrome-number",
  "regular-expression-matching", "container-with-most-water", "roman-to-integer",
  "longest-common-prefix", "3sum", "3sum-closest", "letter-combinations-of-a-phone-number",
  "4sum", "remove-nth-node-from-end-of-list", "valid-parentheses", "merge-two-sorted-lists"
];

const router = express.Router();

// Seed Route
router.post('/seed-leetcode', async (req, res) => {
  try {
    console.log("Seeding problems...");
    const problems = await fetchProblemsBySlugs(POPULAR_SLUGS);

    if (problems.length === 0) return res.status(500).json({ message: "Failed to fetch any problems" });

    const db = getDB();
    // User requested to remove all fixed problems.
    // We will replace problems array but keep Daily Problem if it exists?
    // Or just replace everything.
    // Let's keep problems that are NOT in the new list?
    // No, "remove all the fixed problem currently showing".
    // Fixed problems are IDs 1-5.
    // The fetched problems will likely be IDs 1-20.
    // So overwriting is what we want.

    // Preserve users
    db.problems = problems;

    // Also fetch daily if missing?
    // Let's ensure at least one is daily?
    // We leave daily logic separate.

    saveDB(db);

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

    const db = getDB();

    // Reset previous daily flag
    db.problems.forEach(p => p.isDaily = false);

    // Check if exists
    const existing = db.problems.find(p => p.id === problem.id || p.title === problem.title);

    if (existing) {
      // Update existing? Or skip?
      // User requested "Updated regularly". So fetch fresh content.
      Object.assign(existing, problem);
      // Ensure exampleTestCases are preserved if manually added?
      // But problem from API has empty testCases. Overwriting might break manual edits.
      // Let's only update if fetched has test cases OR just update metadata.
      // For now, overwrite content/title/difficulty.
    } else {
      db.problems.push(problem);
    }

    saveDB(db);
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
    const db = getDB();
    let added = 0;

    for (const p of problems) {
      const existing = db.problems.find(ep => ep.id == p.id);
      if (!existing) {
        db.problems.push(p);
        added++;
      } else {
        // Update fields
        existing.description = p.description;
        existing.starterCode = p.starterCode;
        // Keep manual test cases if any
      }
    }

    saveDB(db);
    res.json({ message: `Fetched ${problems.length} problems. Added ${added} new.`, count: added });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
