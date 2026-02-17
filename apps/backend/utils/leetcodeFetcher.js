const axios = require('axios');

const LEETCODE_API_ENDPOINT = 'https://leetcode.com/graphql';

const DAILY_QUERY = `
query questionOfToday {
  activeDailyCodingChallengeQuestion {
    date
    question {
      questionFrontendId
      title
      titleSlug
      content
      difficulty
      sampleTestCase
      codeSnippets {
        lang
        langSlug
        code
      }
      metaData
    }
  }
}
`;

const PROBLEM_LIST_QUERY = `
query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
  problemsetQuestionList: problemsetQuestionList(categorySlug: $categorySlug, limit: $limit, skip: $skip, filters: $filters) {
    questions: data {
      questionFrontendId
      title
      titleSlug
      difficulty
      isPaidOnly
    }
  }
}
`;

const QUESTION_DETAIL_QUERY = `
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionFrontendId
    title
    titleSlug
    content
    difficulty
    sampleTestCase
    codeSnippets {
      lang
      langSlug
      code
    }
    metaData
  }
}
`;

// Helper to parse content for examples
// LeetCode examples are usually in <pre> tags or distinct blocks in HTML.
// Format: <strong>Input:</strong> ... <strong>Output:</strong> ...
const parseExamples = (htmlContent, meta) => {
  const examples = [];
  if (!htmlContent) return examples;

  const regex = /<pre>[\s\S]*?<strong>Input:<\/strong>([\s\S]*?)<strong>Output:<\/strong>([\s\S]*?)<\/pre>/g;
  let match;

  while ((match = regex.exec(htmlContent)) !== null) {
    let inputRaw = match[1].replace(/<[^>]*>/g, '').trim(); // Strip tags, clean
    let outputRaw = match[2].replace(/<[^>]*>/g, '').trim();

    // Clean output
    const expIndex = outputRaw.indexOf('<strong>Explanation:</strong>');
    if (expIndex !== -1) {
      outputRaw = outputRaw.substring(0, expIndex).trim();
    }

    // Attempt to normalize input using meta params
    let standardizedInput = inputRaw;
    if (meta && meta.params && Array.isArray(meta.params)) {
      try {
        const paramValues = [];
        let currentStr = inputRaw;

        // Heuristic: Split by param names "param ="
        // Ensure we handle order.
        // Example: "nums = [...], target = 9"
        // We can replace ", param =" with "\n" to split? 
        // But commas exist in JSON.
        // Better: Regex for each param in order.

        let failed = false;
        // Strategy: Find position of each param name
        // "nums =" at 0. "target =" at 20.
        // Value of nums is substring(0 + len, 20).

        const indices = [];
        for (const param of meta.params) {
          const pName = param.name;
          const idx = currentStr.lastIndexOf(pName + " ="); // Use lastIndexOf? No, strict order? Usually strict order.
          // Actually Input often uses ", " separator between params.
          // Let's simplified Regex: param.name + "\\s*=\\s*"
          // We need to parse strictly.
          // Let's fallback to "smart split".

          // Hacky implementation for common cases:
          const re = new RegExp(`${param.name}\\s*=\\s*`, 'g');
          // We need to capture the value until the next param or end.
        }

        // Simpler: Just try to convert "param = val, param2 = val" -> "val\nval"
        // Binary Watch: "turnedOn = 1" -> "1"
        // Two Sum: "nums = [..], target = 9" -> "[..]\n9"

        // We can assume params are listed in order and separated by ", " (comma space). 
        // But JSON arrays have ", ". 

        // Let's use the fact that we know param names.
        // We can split the string by param names.

        // If single param, just remove "name ="
        if (meta.params.length === 1) {
          standardizedInput = inputRaw.replace(new RegExp(`^${meta.params[0].name}\\s*=\\s*`), '');
        } else {
          // Multiple params: extract values using regex based on param names
          // Construct regex: "name1\s*=\s*(.*?)(?:,\s*name2\s*=|$)?"
          // This is tricky because comma might be in value.
          // But typically args are separated by ", name2 =".

          const values = [];
          let currentText = inputRaw;

          for (let i = 0; i < meta.params.length; i++) {
            const param = meta.params[i];
            const nextParam = meta.params[i + 1];

            // Regex to capture value of current param
            // Value starts after "paramName ="
            // Ends before ", nextParam =" OR End of string

            const startPattern = `${param.name}\\s*=\\s*`;
            const endPattern = nextParam ? `,\\s*${nextParam.name}\\s*=` : '$';

            const matcher = new RegExp(`${startPattern}([\\s\\S]*?)(?=${endPattern})`);
            const m = matcher.exec(currentText);
            if (m) {
              values.push(m[1].trim());
            } else {
              // Fallback: try taking everything if last?
              values.push("null");
            }
          }

          if (values.length === meta.params.length) {
            standardizedInput = values.join('\n');
          }
        }
      } catch (e) { }
    }

    examples.push({
      input: standardizedInput,
      output: outputRaw
    });
  }
  return examples;
};

const fetchDailyProblem = async () => {
  try {
    const response = await axios.post(LEETCODE_API_ENDPOINT, {
      query: DAILY_QUERY
    });

    const data = response.data.data.activeDailyCodingChallengeQuestion;
    if (!data) return null;
    return transformProblem(data.question, true);
  } catch (error) {
    console.error('Error fetching daily problem:', error.message);
    return null;
  }
};

const fetchProblems = async (limit = 20, skip = 0) => {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Content-Type': 'application/json',
      'Referer': 'https://leetcode.com/'
    };

    const listRes = await axios.post(LEETCODE_API_ENDPOINT, {
      query: PROBLEM_LIST_QUERY,
      variables: { categorySlug: "", limit, skip, filters: {} }
    }, { headers });

    if (!listRes.data.data || !listRes.data.data.problemsetQuestionList) {
      console.error("Invalid list response:", JSON.stringify(listRes.data));
      return [];
    }

    const requestQuestions = listRes.data.data.problemsetQuestionList.questions;
    const problems = [];

    for (const q of requestQuestions) {
      if (q.isPaidOnly) continue;

      try {
        // Add delay to avoid rate limit
        await new Promise(r => setTimeout(r, 500));

        // Fetch validation details for each
        const detailRes = await axios.post(LEETCODE_API_ENDPOINT, {
          query: QUESTION_DETAIL_QUERY,
          variables: { titleSlug: q.titleSlug }
        }, { headers });

        const detail = detailRes.data.data.question;
        if (detail) {
          problems.push(transformProblem(detail));
        }
      } catch (innerErr) {
        console.error(`Failed to fetch details for ${q.titleSlug}:`, innerErr.message);
      }
    }
    return problems;
  } catch (error) {
    console.error('Error fetching problems list:', error.message);
    return [];
  }
};

const transformProblem = (lcProblem, isDaily = false) => {
  // Transform code snippets to map
  const starterCode = {};
  if (lcProblem.codeSnippets) {
    lcProblem.codeSnippets.forEach(snip => {
      if (snip.langSlug === 'cpp') starterCode.cpp = snip.code;
      if (snip.langSlug === 'java') starterCode.java = snip.code;
      if (snip.langSlug === 'python3') starterCode.python = snip.code;
      if (snip.langSlug === 'javascript') starterCode.javascript = snip.code;
      if (snip.langSlug === 'c') starterCode.c = snip.code;
    });
  }

  // Construct meta object (function name)
  let meta = {};
  try {
    meta = JSON.parse(lcProblem.metaData);
  } catch (e) { }

  // Attempt to extract structured test cases
  const extractedExamples = parseExamples(lcProblem.content, meta);
  let testCases = [];

  if (extractedExamples.length > 0) {
    testCases = extractedExamples.map(ex => ({
      input: ex.input,
      output: ex.output
    }));
  }

  // Attempt to extract structured test cases from metaData if available
  // metaData string often contains param names and return type.
  // sampleTestCase is just string "param1 = ... \n param2 = ..."
  // It is hard to construct full structured test case from this without robust parser.
  // For now, we will create a "dummy" test case if sample is present, so the UI doesn't crash,
  // but the runner might fail if expected output is missing.

  // We will leave testCases empty if we can't parse output.
  // Users can read the description.

  return {
    id: lcProblem.questionFrontendId, // Use frontend ID (1, 2, ...)
    title: lcProblem.title,
    description: lcProblem.content, // HTML content
    difficulty: lcProblem.difficulty,
    slug: lcProblem.titleSlug,
    starterCode,
    testCases: testCases,
    exampleTestCases: testCases,
    hiddenTestCases: testCases, // We only have examples
    score: lcProblem.difficulty === 'Easy' ? 10 : (lcProblem.difficulty === 'Medium' ? 30 : 50),
    isDaily,
    metaData: meta
  };
};

const fetchProblemsBySlugs = async (slugs) => {
  const problems = [];
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Content-Type': 'application/json',
    'Referer': 'https://leetcode.com/'
  };

  for (const slug of slugs) {
    try {
      await new Promise(r => setTimeout(r, 600)); // Delay
      const detailRes = await axios.post(LEETCODE_API_ENDPOINT, {
        query: QUESTION_DETAIL_QUERY,
        variables: { titleSlug: slug }
      }, { headers });

      const detail = detailRes.data.data.question;
      if (detail) {
        problems.push(transformProblem(detail));
      }
    } catch (error) {
      console.error(`Failed to fetch ${slug}:`, error.message);
    }
  }
  return problems;
};

module.exports = { fetchDailyProblem, fetchProblems, fetchProblemsBySlugs };
