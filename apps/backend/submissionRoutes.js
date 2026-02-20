const express = require('express');
const redis = require('redis');
const { v4: uuidv4 } = require('uuid');
const supabase = require('./utils/supabase');
const jwt = require('jsonwebtoken');
const { updateUserStats } = require('./utils/userStats');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

const getDailyProblemId = async () => {
  const { data } = await supabase.from('problems').select('id').eq('is_daily', true).single();
  if (data) return data.id;
  // Fallback
  const { data: fallback } = await supabase.from('problems').select('id').limit(1).single();
  return fallback ? fallback.id : -1;
};

const router = express.Router();

let redisClient;

let isRedisConnected = false;

(async () => {
  redisClient = redis.createClient();
  redisClient.on('error', (err) => {
    console.log('Redis Client Error', err);
    isRedisConnected = false;
  });
  try {
    await redisClient.connect();
    isRedisConnected = true;
    console.log('Redis connected');
  } catch (err) {
    console.log('Failed to connect to Redis:', err.message);
  }
})();

const memoryResults = new Map();
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const os = require('os');

const executeLocally = async (submissionId, problem, code, language, testCases) => {
  const problemId = problem.id;
  const ext = language === 'python' ? 'py' : 'cjs';
  const tmpDir = os.tmpdir();
  const filePath = path.join(tmpDir, `${submissionId}.${ext}`);

  const meta = problem.meta_data || problem.metaData;

  // Driver Code Generation
  let driverCode = "";

  if (language === 'javascript') {
    if (meta) {
      // Dynamic JS Driver
      const params = JSON.stringify(meta.params);
      driverCode = `
const fs = require('fs');

// Helpers
function ListNode(val, next) { this.val = (val===undefined ? 0 : val); this.next = (next===undefined ? null : next); }
function toList(node) { const res = []; while(node) { res.push(node.val); node = node.next; } return res; }
function toLinkedList(arr) { const dummy = new ListNode(0); let curr = dummy; for(const x of arr) { curr.next = new ListNode(x); curr = curr.next; } return dummy.next; }

try {
    const inputStr = fs.readFileSync(0, 'utf-8').trim();
    // Parse Input
    // We expect newline separated JSONs or "param = val"
    // Use heuristic: Try split newline, then try eval (dangerous but ok locally)
    
    let args = [];
    const params = ${params};
    
    try {
        const lines = inputStr.split('\\n');
        if (lines.length >= params.length) {
            args = lines.slice(0, params.length).map(l => JSON.parse(l));
        }
    } catch (e) {}
    
    if (args.length === 0) {
        // Try eval to get vars
        // "nums = [...]; target = 9"
        // Replace , with ; ?
        // Input: "nums = [...], target = 9"
        // Clean: "var nums = [...]; var target = 9;"
        // We can try to construct a function
        const cleanInput = "var " + inputStr.replace(/, /g, "; var ");
        eval(cleanInput);
        args = params.map(p => eval(p.name));
    }
    
    ${getJsDriver(problemId, meta)}
    console.log(JSON.stringify(result));
} catch(e) { console.error(e); }
`;
    } else {
      driverCode = `
const fs = require('fs');
try {
    const input = JSON.parse(fs.readFileSync(0, 'utf-8'));
    let result;
    ${getJsDriver(problemId)}
    console.log(JSON.stringify(result));
} catch(e) { console.error(e); }
`;
    }
  } else if (language === 'python') {
    if (meta) {
      driverCode = `
import json
import sys
import re

# Helpers
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
def to_list(node):
    res = []
    while node:
        res.append(node.val)
        node = node.next
    return res
def to_linked_list(lst):
    dummy = ListNode(0)
    curr = dummy
    for x in lst:
        curr.next = ListNode(x)
        curr = curr.next
    return dummy.next

try:
    input_str = sys.stdin.read().strip()
    meta_name = "${meta.name}"
    meta_params = ${JSON.stringify(meta.params)}
    
    args = []
    
    # Strategy 1: Newline split (Standardized)
    # If input has correct number of lines matching params
    lines = [l for l in input_str.split('\\n') if l.strip()]
    if len(lines) == len(meta_params):
        try:
            for l in lines:
                args.append(json.loads(l))
        except:
            args = []
    


    if len(args) != len(meta_params):
        # Last resort: if 1 param, try load whole string

            try:
                args = [json.loads(input_str)]
            except:
                pass

    if len(args) != len(meta_params):
        raise Exception("Failed to parse input arguments")

    # Type Conversion
    for i, p in enumerate(meta_params):
        if p['type'] == 'ListNode' and isinstance(args[i], list):
            args[i] = to_linked_list(args[i])
        elif p['type'] == 'string' and not isinstance(args[i], str):
            args[i] = str(args[i])

    sol = Solution()
    method = getattr(sol, meta_name)
    result = method(*args)

    if isinstance(result, ListNode):
        print(json.dumps(to_list(result)))
    else:
        print(json.dumps(result))
except Exception as e:
    print(str(e), file=sys.stderr)
`;
    } else {
      driverCode = `
import json
import sys

# Helpers for Linked List
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def to_list(node):
    res = []
    while node:
        res.append(node.val)
        node = node.next
    return res

def to_linked_list(lst):
    dummy = ListNode(0)
    curr = dummy
    for x in lst:
        curr.next = ListNode(x)
        curr = curr.next
    return dummy.next

try:
    input_data = json.load(sys.stdin)
    ${getPythonDriver(problemId)}
    # Print result
    if isinstance(result, ListNode):
        print(json.dumps(to_list(result)))
    else:
        print(json.dumps(result))
except Exception as e:
    print(str(e), file=sys.stderr)
    sys.exit(1)
`;
    }
  }

  const fullCode = code + "\n" + driverCode;

  try {
    fs.writeFileSync(filePath, fullCode);

    let totalTime = 0;
    let details = "";
    let verdict = "Accepted";

    if (!testCases || testCases.length === 0) {
      return { verdict: "No Tests", details: "No test cases available for this problem. Code not verified." };
    }

    for (let i = 0; i < testCases.length; i++) {
      // ... (existing test loop logic)
      const tc = testCases[i];
      const startTime = Date.now();

      // Prepare input
      const inputJSON = typeof tc.input === 'string' ? tc.input : JSON.stringify(tc.input);

      try {
        const output = await runScript(language, filePath, inputJSON);
        const timeTaken = Date.now() - startTime;
        totalTime += timeTaken;

        // Compare (trim whitespace)
        // Normalize output (JSON parse if possible)
        let actual = output.trim();
        let expected = typeof tc.output === 'string' ? tc.output.trim() : JSON.stringify(tc.output);

        // Try JSON comparison
        try {
          const actObj = JSON.parse(actual);
          const expObj = JSON.parse(expected);

          // Loose comparison for arrays/sets (order support?)
          // LeetCode says "return ... in any order".
          // Deep compare assuming order matters for now unless set.
          if (JSON.stringify(actObj) !== JSON.stringify(expObj)) {
            // Special case for sets/unordered? (Not implemented yet)

            verdict = "Wrong Answer";
            details = `Test Case ${i + 1} Failed.\nInput: ${inputJSON}\nExpected: ${expected}\nActual: ${actual}`;
            break;
          }
        } catch (e) {
          if (actual !== expected) {
            verdict = "Wrong Answer";
            details = `Test Case ${i + 1} Failed.\nInput: ${inputJSON}\nExpected: ${expected}\nActual: ${actual}`;
            break;
          }
        }
      } catch (err) {
        verdict = "Runtime Error";
        details = err.toString();
        break;
      }
    }

    if (verdict === "Accepted") details = "All test cases passed locally.";

    return {
      verdict,
      details,
      stats: { time: `${totalTime}ms`, memory: "N/A" }
    };

  } catch (e) {
    return { verdict: "Internal Error", details: e.message };
  }
};



const runScript = (language, filePath, input) => {
  return new Promise((resolve, reject) => {
    const cmd = language === 'python' ? `python "${filePath}"` : `node "${filePath}"`;
    const child = exec(cmd, (error, stdout, stderr) => {
      if (error) reject(stderr || error.message);
      else resolve(stdout);
    });
    child.stdin.write(input);
    child.stdin.end();
  });
};

const getJsDriver = (id, meta) => {
  if (meta) {
    // args is array of values prepared in executeLocally
    return `result = ${meta.name}(...args);`;
  }
  // Linked List Helper for JS
  const llHelper = `
    function ListNode(val, next) { this.val = (val===undefined ? 0 : val); this.next = (next===undefined ? null : next); }
    function toList(node) { const res = []; while(node) { res.push(node.val); node = node.next; } return res; }
    function toLinkedList(arr) { const dummy = new ListNode(0); let curr = dummy; for(const x of arr) { curr.next = new ListNode(x); curr = curr.next; } return dummy.next; }
    `;

  switch (parseInt(id)) {
    case 1: return `result = twoSum(input.nums, input.target);`;
    case 2: return `${llHelper} result = toList(addTwoNumbers(toLinkedList(input.l1), toLinkedList(input.l2)));`;
    case 3: return `result = lengthOfLongestSubstring(input);`; // input is string? db.json has string input for this?
    // Wait, for P3 input is "abc..." string.
    // If input is string, JSON.parse("abc") is "abc".
    // So input variable is "abc".
    // But logic might expect input.s?
    // Re-check db.json for P3.
    case 4: return `result = findMedianSortedArrays(input.nums1, input.nums2);`;
    case 5: return `result = longestPalindrome(input);`;
    default: return `result = null;`;
  }
};

const getPythonDriver = (id) => {
  switch (parseInt(id)) {
    case 1: return `result = Solution().twoSum(input_data['nums'], input_data['target'])`;
    case 2: return `result = Solution().addTwoNumbers(to_linked_list(input_data['l1']), to_linked_list(input_data['l2']))`;
    case 3: return `result = Solution().lengthOfLongestSubstring(input_data)`;
    case 4: return `result = Solution().findMedianSortedArrays(input_data['nums1'], input_data['nums2'])`;
    case 5: return `result = Solution().longestPalindrome(input_data)`;
    default: return `result = None`;
  }
};

const SUBMISSION_QUEUE = 'submission_queue';

// POST /submit (Hidden Test Cases)
router.post('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

    const token = authHeader.split(' ')[1];
    let userId;
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
    } catch (err) {
      return res.status(401).json({ message: "Invalid Token" });
    }

    const { problemId, code, language } = req.body;
    if (!problemId || !code || !language) return res.status(400).json({ message: 'Missing fields' });

    const { data: problem, error } = await supabase
      .from('problems')
      .select('*')
      .eq('id', problemId)
      .single();

    if (error || !problem) return res.status(404).json({ message: 'Problem not found' });

    const submissionId = uuidv4();
    // Prefer hidden_test_cases, fallback to test_cases
    const sourceTestCases = problem.hidden_test_cases || problem.test_cases || [];

    const testCases = sourceTestCases.map(tc => {
      const inputStr = typeof tc.input === 'object' ? JSON.stringify(tc.input) : tc.input;
      const outputStr = typeof tc.output === 'object' ? JSON.stringify(tc.output) : tc.output;
      return { input: inputStr, output: outputStr };
    });

    if (!isRedisConnected) {
      if (language === 'javascript' || language === 'python') {
        console.log(`Running locally (Redis down) for submission ${submissionId}`);
        const result = await executeLocally(submissionId, problem, code, language, testCases);

        if (result.verdict === 'Accepted') {
          const dailyId = await getDailyProblemId();
          const score = problem.score || (problem.difficulty === 'Easy' ? 10 : (problem.difficulty === 'Medium' ? 30 : 50));

          const stats = await updateUserStats(userId, problemId, score, dailyId);
          result.rewards = stats;
        }
        memoryResults.set(submissionId, result);
        return res.json({ message: 'Submission processed (Local Mode)', submissionId });
      }
      return res.status(503).json({ message: 'Service unavailable (Redis down) & Language not supported locally' });
    }

    // Redis path
    const task = { submissionId, code, language, testCases };
    await redisClient.set(`submission_meta:${submissionId}`, JSON.stringify({
      userId,
      problemId,
      processed: false,
      type: 'submit',
      score: problem.score || 10
    }));
    await redisClient.rPush(SUBMISSION_QUEUE, JSON.stringify(task));

    res.json({ message: 'Submission queued', submissionId });

  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isRedisConnected) {
      if (memoryResults.has(id)) {
        return res.json(memoryResults.get(id));
      }
      return res.status(503).json({ message: 'Service unavailable (Redis down)' });
    }

    const resultStr = await redisClient.get(`submission:${id}`);
    if (resultStr) {
      const result = JSON.parse(resultStr);
      if (result.verdict === 'Accepted') {
        const metaStr = await redisClient.get(`submission_meta:${id}`);
        if (metaStr) {
          const meta = JSON.parse(metaStr);
          if (meta.type === 'submit' && !meta.processed) {
            const dailyId = await getDailyProblemId();
            const stats = await updateUserStats(meta.userId, meta.problemId, meta.score, dailyId);
            meta.processed = true;
            await redisClient.set(`submission_meta:${id}`, JSON.stringify(meta));
            result.rewards = stats;
          }
        }
      }
      res.json(result);
    } else {
      res.status(202).json({ status: 'Processing' });
    }
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// RUN Endpoint (Public Cases)
router.post('/run', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

    const { problemId, code, language } = req.body;
    if (!problemId || !code || !language) return res.status(400).json({ message: 'Missing fields' });

    const { data: problem, error } = await supabase
      .from('problems')
      .select('*')
      .eq('id', problemId)
      .single();

    if (error || !problem) return res.status(404).json({ message: 'Problem not found' });

    const submissionId = uuidv4();
    // Use test_cases (examples) for Run
    const sourceTestCases = problem.test_cases || [];

    const testCases = sourceTestCases.map(tc => {
      const inputStr = typeof tc.input === 'object' ? JSON.stringify(tc.input) : tc.input;
      const outputStr = typeof tc.output === 'object' ? JSON.stringify(tc.output) : tc.output;
      return { input: inputStr, output: outputStr };
    });

    if (!isRedisConnected) {
      if (language === 'javascript' || language === 'python') {
        console.log(`Running locally (Redis down) for run ${submissionId}`);
        const result = await executeLocally(submissionId, problem, code, language, testCases);
        memoryResults.set(submissionId, result);
        return res.json({ message: 'Run processed (Local Mode)', submissionId });
      }
      return res.status(503).json({ message: 'Service unavailable' });
    }

    const task = { submissionId, code, language, testCases };
    await redisClient.set(`submission_meta:${submissionId}`, JSON.stringify({ type: 'run' }));
    await redisClient.rPush(SUBMISSION_QUEUE, JSON.stringify(task));

    res.json({ message: 'Run queued', submissionId });

  } catch (error) {
    console.error('Run error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
