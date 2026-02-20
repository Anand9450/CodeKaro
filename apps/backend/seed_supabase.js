const { createClient } = require('@supabase/supabase-js');
const { fetchProblemsBySlugs, fetchDailyProblem } = require('./utils/leetcodeFetcher');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL || "https://akmfcahygdcakplimryl.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const POPULAR_SLUGS = [
  "two-sum", "add-two-numbers", "longest-substring-without-repeating-characters",
  "median-of-two-sorted-arrays", "longest-palindromic-substring", "zigzag-conversion",
  "reverse-integer", "string-to-integer-atoi", "palindrome-number",
  "regular-expression-matching", "container-with-most-water", "roman-to-integer",
  "longest-common-prefix", "3sum", "3sum-closest", "letter-combinations-of-a-phone-number",
  "4sum", "remove-nth-node-from-end-of-list", "valid-parentheses", "merge-two-sorted-lists"
];

async function seed() {
  try {
    console.log("Fetching problems from LeetCode...");

    // 1. Fetch Popular Problems
    const problems = await fetchProblemsBySlugs(POPULAR_SLUGS);

    // 2. Fetch Daily Problem
    const dailyProblem = await fetchDailyProblem();
    if (dailyProblem) {
      console.log(`Daily Problem fetched: ${dailyProblem.title}`);
      // Check if daily problem is already in problems list
      const exists = problems.find(p => p.slug === dailyProblem.slug);
      if (!exists) {
        problems.push(dailyProblem);
      } else {
        // Update the existing one to be daily
        exists.isDaily = true;
      }
    } else {
      console.warn("Failed to fetch daily problem.");
    }

    if (problems.length === 0) {
      console.error("Failed to fetch any problems.");
      return;
    }

    console.log(`Fetched ${problems.length} problems. Upserting to Supabase...`);

    const upserts = problems.map(p => ({
      id: parseInt(p.id),
      title: p.title,
      difficulty: p.difficulty,
      description: p.description,
      slug: p.slug,
      starter_code: JSON.stringify(p.starterCode),
      // Ensure test cases are arrays
      test_cases: p.testCases || [],
      hidden_test_cases: p.hiddenTestCases || [],
      meta_data: p.metaData || {},
      is_daily: p.isDaily || (dailyProblem && p.slug === dailyProblem.slug) || false
    }));

    // Before upserting daily, reset old daily problems to false
    if (dailyProblem) {
      await supabase.from('problems').update({ is_daily: false }).eq('is_daily', true);
    }

    const { error } = await supabase.from('problems').upsert(upserts, { onConflict: 'id' });

    if (error) {
      console.error("Supabase Error:", error);
      throw error;
    }

    console.log("Seeding complete successfully!");
  } catch (e) {
    console.error("Seeding failed:", e);
  }
}

seed();
