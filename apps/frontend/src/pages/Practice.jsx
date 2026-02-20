import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const difficultyColor = (d) => {
  if (d === 'Easy') return 'text-green-400 bg-green-400/10 border-green-400/30';
  if (d === 'Medium') return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
  return 'text-red-400 bg-red-400/10 border-red-400/30';
};

const Practice = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [status, setStatus] = useState('All');
  const [solvedIds, setSolvedIds] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [probRes, userRes] = await Promise.all([
          axios.get(`${API_URL}/problems`),
          user ? axios.get(`${API_URL}/user/profile?userId=${user.id}`) : Promise.resolve({ data: { solvedProblems: [] } })
        ]);
        setProblems(probRes.data);
        setFilteredProblems(probRes.data);
        if (userRes.data.solvedProblems) {
          setSolvedIds(userRes.data.solvedProblems.map(id => String(id)));
        }
      } catch (err) {
        console.error('Error fetching practice data', err);
        setError('Failed to load problems. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    let result = problems;
    if (difficulty !== 'All') result = result.filter(p => p.difficulty === difficulty);
    if (status === 'Solved') result = result.filter(p => solvedIds.includes(String(p.id)));
    if (status === 'Unsolved') result = result.filter(p => !solvedIds.includes(String(p.id)));
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }
    setFilteredProblems(result);
  }, [difficulty, status, problems, solvedIds, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Practice Problems
          </h1>
          <p className="text-gray-400 text-sm">Problems sourced live from LeetCode</p>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap gap-3 mb-6">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by title or tag..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px] bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 placeholder-gray-500 text-sm"
          />
          {/* Difficulty */}
          <select
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
            className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-sm"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          {/* Status */}
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-sm"
          >
            <option value="All">All Status</option>
            <option value="Solved">Solved</option>
            <option value="Unsolved">Unsolved</option>
          </select>
        </div>

        {/* Stats Bar */}
        {!loading && (
          <div className="flex gap-4 mb-6 text-sm text-gray-400">
            <span className="bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
              Total: <strong className="text-white">{filteredProblems.length}</strong>
            </span>
            <span className="bg-gray-800 px-3 py-1 rounded-full border border-green-700/40 text-green-400">
              Easy: <strong>{filteredProblems.filter(p => p.difficulty === 'Easy').length}</strong>
            </span>
            <span className="bg-gray-800 px-3 py-1 rounded-full border border-yellow-700/40 text-yellow-400">
              Medium: <strong>{filteredProblems.filter(p => p.difficulty === 'Medium').length}</strong>
            </span>
            <span className="bg-gray-800 px-3 py-1 rounded-full border border-red-700/40 text-red-400">
              Hard: <strong>{filteredProblems.filter(p => p.difficulty === 'Hard').length}</strong>
            </span>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-5 animate-pulse flex justify-between items-center">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                </div>
                <div className="h-8 w-20 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition"
            >
              Retry
            </button>
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg">No problems found matching your filters.</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 text-xs text-gray-500 uppercase tracking-wider px-6 py-2 mb-1">
              <span className="col-span-1">#</span>
              <span className="col-span-5">Title</span>
              <span className="col-span-2">Difficulty</span>
              <span className="col-span-2">Acceptance</span>
              <span className="col-span-2">Action</span>
            </div>

            {/* Problem Rows */}
            <div className="space-y-2">
              {filteredProblems.map((problem, idx) => {
                const isSolved = solvedIds.includes(String(problem.id));
                return (
                  <div
                    key={problem.id || idx}
                    className={`
                      bg-gray-800/80 rounded-lg border transition-all duration-200 cursor-pointer group
                      hover:bg-gray-750 hover:border-blue-500/60 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]
                      ${isSolved ? 'border-green-500/30' : 'border-gray-700/50'}
                    `}
                    onClick={() => problem.slug
                      ? navigate(`/solve/${problem.slug}`)
                      : navigate(`/solve/${problem.id}`)
                    }
                  >
                    <div className="grid grid-cols-12 items-center px-6 py-4">
                      {/* Number */}
                      <div className="col-span-1 text-gray-500 text-sm font-mono">
                        {isSolved ? <span className="text-green-500">✓</span> : problem.id}
                      </div>

                      {/* Title + Tags */}
                      <div className="col-span-5 md:col-span-5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white group-hover:text-blue-400 transition text-sm md:text-base">
                            {problem.title}
                          </span>
                          {problem.source === 'leetcode' && (
                            <span className="text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-1.5 py-0.5 rounded hidden md:inline">
                              LC
                            </span>
                          )}
                        </div>
                        {/* Tags */}
                        {problem.tags && problem.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 hidden md:flex">
                            {problem.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-[10px] bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">
                                {tag}
                              </span>
                            ))}
                            {problem.tags.length > 3 && (
                              <span className="text-[10px] text-gray-500">+{problem.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Difficulty */}
                      <div className="col-span-3 md:col-span-2">
                        <span className={`text-xs px-2 py-1 rounded-full border font-medium ${difficultyColor(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                      </div>

                      {/* Acceptance */}
                      <div className="col-span-2 text-sm text-gray-400 hidden md:block">
                        {problem.acRate != null ? `${problem.acRate}%` : '—'}
                      </div>

                      {/* Solve Button */}
                      <div className="col-span-3 md:col-span-2 flex justify-end">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            problem.slug
                              ? navigate(`/solve/${problem.slug}`)
                              : navigate(`/solve/${problem.id}`);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-1.5 px-4 rounded-lg transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          Solve
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Practice;
