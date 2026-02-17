import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Editor from '@monaco-editor/react';

const Solve = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  // Hardcoded for now, ideally fetch from backend
  // Since we don't have a specific endpoint to fetch just one problem by ID yet
  // we can either add it or just hardcode for demo. 
  // Let's add fetch logic assuming we'll add the endpoint or just list match.
  // Wait, we don't have GET /problems/:id yet. 
  // I'll quickly implement finding it from a hardcoded list or fetch from backend if I add the route.
  // For now, let's use the same hardcoded list as in Practice.jsx for display purposes 
  // or better, fetch from backend.

  // I will add a GET /problems endpoint to backend first? 
  // No, let's just make this functional.

  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('// Write your code here');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [verdict, setVerdict] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCoin, setShowCoin] = useState(false);
  const [rewards, setRewards] = useState(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/problems/${id}`);
        setProblem(response.data);
        // Set default boilerplate based on language
        if (response.data.starterCode) {
          setCode(response.data.starterCode[language] || '// Write your code here');
        }
      } catch (err) {
        console.error("Error fetching problem", err);
      }
    };
    fetchProblem();
  }, [id]);

  useEffect(() => {
    if (problem && problem.starterCode) {
      setCode(problem.starterCode[language] || '// Write your code here');
    }
  }, [language, problem]);

  const handleRun = async () => {
    submitCode('run');
  };

  const handleSubmit = async () => {
    submitCode('submit');
  };

  const submitCode = async (type) => {
    setLoading(true);
    if (type === 'run') setOutput('Running public test cases...');
    else setOutput('Submitting... Running all test cases...');

    setVerdict('');
    setRewards(null);

    try {
      const apiBase = 'http://localhost:5000';
      const endpoint = type === 'run' ? '/submit/run' : '/submit';

      const response = await axios.post(`${apiBase}${endpoint}`, {
        problemId: id,
        code,
        language
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const submissionId = response.data.submissionId;
      pollResult(submissionId, type);

    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Error processing code';
      setOutput(msg);
      setLoading(false);
    }
  };

  const pollResult = async (submissionId, type) => {
    const apiBase = 'http://localhost:5000';
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${apiBase}/submit/${submissionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.status === 200 && res.data.verdict) {
          clearInterval(interval);
          setVerdict(res.data.verdict);

          let out = res.data.details || res.data.output || '';
          const stats = res.data.stats ? `\nTime: ${res.data.stats.time}` : '';

          if (type === 'submit' && res.data.rewards) {
            setRewards(res.data.rewards);
            if (res.data.rewards.dailySolved) {
              triggerCoinAnimation();
            }
            const earned = res.data.rewards.points > 0 ? `\nPoints Earned: +${res.data.rewards.points}` : '';
            const coins = res.data.rewards.coins > 0 ? `\nCoins Earned: +${res.data.rewards.coins}` : '';
            out += `\n\n--- SUBMISSION COMPLETE ---${earned}${coins}\nTotal Streak: ${res.data.rewards.streak}`;
          }

          setOutput(out + stats);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        clearInterval(interval);
        setOutput('Error fetching result');
        setLoading(false);
      }
    }, 1000);
  };

  const triggerCoinAnimation = () => {
    setShowCoin(true);
    setTimeout(() => setShowCoin(false), 3000);
  };

  if (!problem) return <div className="text-white p-8">Loading problem...</div>;

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden relative">
      {/* Coin Animation Overlay */}
      {showCoin && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 animate-fade-in">
          <div className="animate-spin-slow text-9xl">
            🪙
          </div>
          <h1 className="absolute mt-40 text-4xl font-bold text-yellow-400 animate-pulse">Daily Challenge Solved!</h1>
        </div>
      )}
      {/* Left Panel: Problem Description */}
      <div className="w-1/3 p-6 border-r border-gray-700 overflow-y-auto">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 h-[calc(100vh-12rem)] overflow-y-auto w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{problem.title}</h2>
            <span className={`px-2 py-1 rounded text-sm ${problem.difficulty === 'Easy' ? 'bg-green-900 text-green-300' :
              problem.difficulty === 'Medium' ? 'bg-yellow-900 text-yellow-300' :
                'bg-red-900 text-red-300'
              }`}>
              {problem.difficulty}
            </span>
          </div>
          <div
            className="prose prose-invert max-w-none text-gray-300"
            dangerouslySetInnerHTML={{ __html: problem.description }}
          />
          {problem.examples && problem.examples.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold text-white mb-2">Examples</h3>
              {problem.examples.map((ex, idx) => (
                <div key={idx} className="bg-gray-800 p-4 rounded mb-4">
                  <p className="text-sm font-semibold text-gray-400">Input:</p>
                  <code className="block bg-gray-900 p-2 rounded mb-2 font-mono text-sm">{ex.input}</code>
                  <p className="text-sm font-semibold text-gray-400">Output:</p>
                  <code className="block bg-gray-900 p-2 rounded mb-2 font-mono text-sm">{ex.output}</code>
                  {ex.explanation && (
                    <>
                      <p className="text-sm font-semibold text-gray-400">Explanation:</p>
                      <p className="text-gray-300 text-sm">{ex.explanation}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Code Editor */}
      <div className="w-2/3 flex flex-col">
        {/* Toolbar */}
        <div className="h-12 border-b border-gray-700 flex items-center justify-between px-4 bg-gray-800">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-700 text-white rounded px-2 py-1 outline-none"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={handleRun}
              disabled={loading}
              className={`px-4 py-1.5 rounded font-bold transition ${loading ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              Run
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`px-4 py-1.5 rounded font-bold transition ${loading ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'}`}
            >
              Submit
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 bg-gray-900 overflow-hidden">
          <Editor
            height="100%"
            theme="vs-dark"
            language={language === 'c' || language === 'cpp' ? 'cpp' : language}
            value={code}
            onChange={(value) => setCode(value)}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
            }}
          />
        </div>

        {/* Output Area */}
        <div className="h-1/3 border-t border-gray-700 bg-gray-800 p-4 overflow-y-auto">
          <h3 className="font-bold text-gray-400 mb-2">Output</h3>
          {verdict && (
            <div className={`mb-2 font-bold ${verdict === 'Accepted' ? 'text-green-400' : 'text-red-400'
              }`}>
              Verdict: {verdict}
            </div>
          )}
          <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap">
            {output || 'Run your code to see output here...'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Solve;
