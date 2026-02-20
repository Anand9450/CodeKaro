const express = require('express');
const supabase = require('./utils/supabase');
const axios = require('axios');

const router = express.Router();

const LEETCODE_API = 'https://leetcode.com/graphql';
const LC_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Content-Type': 'application/json',
  'Referer': 'https://leetcode.com/',
  'Origin': 'https://leetcode.com'
};

// ─── LeetCode GraphQL Queries ───────────────────────────────────────────────

const DAILY_QUERY = `
query questionOfToday {
  activeDailyCodingChallengeQuestion {
    date
    question {
      questionFrontendId
      title
      titleSlug
      difficulty
      content
      acRate
      topicTags { name }
      codeSnippets { lang langSlug code }
      metaData
      sampleTestCase
    }
  }
}`;

const LIST_QUERY = `
query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
  problemsetQuestionList: problemsetQuestionList(
    categorySlug: $categorySlug, limit: $limit, skip: $skip, filters: $filters
  ) {
    total: totalNum
    questions: data {
      questionFrontendId
      title
      titleSlug
      difficulty
      acRate
      isPaidOnly
      topicTags { name slug }
      status
    }
  }
}`;

const DETAIL_QUERY = `
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionFrontendId
    title
    titleSlug
    difficulty
    content
    acRate
    topicTags { name }
    codeSnippets { lang langSlug code }
    metaData
    sampleTestCase
  }
}`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const parseStarterCode = (starter_code) => {
  if (!starter_code) return {};
  if (typeof starter_code === 'object') return starter_code;
  try { return JSON.parse(starter_code); } catch (e) { return {}; }
};

const transformLC = (q, isDaily = false) => {
  const starterCode = {};
  if (q.codeSnippets) {
    q.codeSnippets.forEach(s => {
      if (s.langSlug === 'cpp') starterCode.cpp = s.code;
      if (s.langSlug === 'java') starterCode.java = s.code;
      if (s.langSlug === 'python3') starterCode.python = s.code;
      if (s.langSlug === 'javascript') starterCode.javascript = s.code;
      if (s.langSlug === 'c') starterCode.c = s.code;
    });
  }
  let meta = {};
  try { meta = JSON.parse(q.metaData || '{}'); } catch (e) { }
  return {
    id: parseInt(q.questionFrontendId),
    title: q.title,
    slug: q.titleSlug,
    difficulty: q.difficulty,
    description: q.content,
    acRate: q.acRate ? Math.round(q.acRate) : null,
    tags: (q.topicTags || []).map(t => t.name),
    starterCode,
    testCases: [],
    metaData: meta,
    isDaily,
    source: 'leetcode'
  };
};

const mapProblem = (p) => {
  if (!p) return null;
  return {
    id: p.id,
    title: p.title,
    difficulty: p.difficulty,
    description: p.description,
    slug: p.slug,
    acRate: p.ac_rate || null,
    tags: p.tags || [],
    starterCode: parseStarterCode(p.starter_code),
    testCases: p.test_cases,
    metaData: p.meta_data,
    isDaily: p.is_daily,
    source: 'db'
  };
};

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/problems  — list problems (Supabase first, then fallback to live LC)
router.get('/', async (req, res) => {
  try {
    // 1. Try Supabase
    const { data: problems, error } = await supabase
      .from('problems')
      .select('id, title, difficulty, description, slug, is_daily, starter_code, tags, ac_rate')
      .order('id');

    if (!error && problems && problems.length > 0) {
      return res.json(problems.map(p => ({ ...mapProblem(p), testCases: undefined })));
    }

    // 2. Fallback: fetch live from LeetCode
    console.log('DB empty, fetching live from LeetCode...');
    const lcRes = await axios.post(LEETCODE_API, {
      query: LIST_QUERY,
      variables: { categorySlug: '', limit: 50, skip: 0, filters: {} }
    }, { headers: LC_HEADERS, timeout: 15000 });

    const questions = lcRes.data?.data?.problemsetQuestionList?.questions || [];
    const publicProblems = questions.filter(q => !q.isPaidOnly);

    const result = publicProblems.map(q => ({
      id: parseInt(q.questionFrontendId),
      title: q.title,
      slug: q.titleSlug,
      difficulty: q.difficulty,
      acRate: q.acRate ? Math.round(q.acRate) : null,
      tags: (q.topicTags || []).map(t => t.name),
      source: 'leetcode'
    }));

    return res.json(result);
  } catch (err) {
    console.error('GET /problems error:', err.message);
    res.status(500).json({ message: 'Failed to fetch problems', detail: err.message });
  }
});

// GET /api/problems/daily
router.get('/daily', async (req, res) => {
  try {
    // 1. Try Supabase for today's daily
    const { data: problem } = await supabase
      .from('problems')
      .select('*')
      .eq('is_daily', true)
      .single();

    if (problem) return res.json(mapProblem(problem));

    // 2. Fetch live from LeetCode
    console.log('Fetching daily problem live from LeetCode...');
    const lcRes = await axios.post(LEETCODE_API, {
      query: DAILY_QUERY
    }, { headers: LC_HEADERS, timeout: 15000 });

    const daily = lcRes.data?.data?.activeDailyCodingChallengeQuestion;
    if (!daily?.question) return res.status(404).json({ message: 'No daily problem found' });

    const transformed = transformLC(daily.question, true);
    return res.json(transformed);
  } catch (err) {
    console.error('GET /problems/daily error:', err.message);
    res.status(500).json({ message: 'Failed to fetch daily problem', detail: err.message });
  }
});

// GET /api/problems/:id  — get single problem detail
router.get('/:id', async (req, res) => {
  try {
    // 1. Try Supabase by numeric ID
    const numId = parseInt(req.params.id);
    if (!isNaN(numId)) {
      const { data: problem, error } = await supabase
        .from('problems')
        .select('*')
        .eq('id', numId)
        .single();

      if (!error && problem) return res.json(mapProblem(problem));
    }

    // 2. Try by slug string
    const { data: bySlug } = await supabase
      .from('problems')
      .select('*')
      .eq('slug', req.params.id)
      .single();

    if (bySlug) return res.json(mapProblem(bySlug));

    // 3. Fallback: fetch live from LeetCode by slug
    console.log(`Fetching problem ${req.params.id} live from LeetCode...`);
    const lcRes = await axios.post(LEETCODE_API, {
      query: DETAIL_QUERY,
      variables: { titleSlug: req.params.id.toString() }
    }, { headers: LC_HEADERS, timeout: 15000 });

    const q = lcRes.data?.data?.question;
    if (!q) return res.status(404).json({ message: 'Problem not found' });

    return res.json(transformLC(q));
  } catch (err) {
    console.error(`GET /problems/${req.params.id} error:`, err.message);
    res.status(500).json({ message: 'Problem not found', detail: err.message });
  }
});

module.exports = router;
