import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Practice = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [difficulty, setDifficulty] = useState('All');
  const [status, setStatus] = useState('All');

  // User solved data
  const [solvedIds, setSolvedIds] = useState([]);

  useEffect(() => {
    const fetchProblemsAndUser = async () => {
      try {
        const [probRes, userRes] = await Promise.all([
          axios.get('http://localhost:5000/problems'),
          user ? axios.get(`http://localhost:5000/user/profile?userId=${user.id}`) : Promise.resolve({ data: { solvedProblems: [] } })
        ]);

        setProblems(probRes.data);
        setFilteredProblems(probRes.data);
        if (userRes.data.solvedProblems) {
          setSolvedIds(userRes.data.solvedProblems.map(id => String(id))); // Ensure strings for comparison
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching practice data", err);
        setLoading(false);
      }
    };
    fetchProblemsAndUser();
  }, [user]);

  useEffect(() => {
    let result = problems;

    // Difficulty Filter
    if (difficulty !== 'All') {
      result = result.filter(p => p.difficulty === difficulty);
    }

    // Status Filter
    if (status !== 'All') {
      if (status === 'Solved') {
        result = result.filter(p => solvedIds.includes(String(p.id)));
      } else if (status === 'Unsolved') {
        result = result.filter(p => !solvedIds.includes(String(p.id)));
      }
    }

    setFilteredProblems(result);
  }, [difficulty, status, problems, solvedIds]);

  if (loading) return <div className="text-white text-center mt-20">Loading problems...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Practice Problems
        </h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="bg-gray-800 text-white border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-gray-800 text-white border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Solved">Solved</option>
            <option value="Unsolved">Unsolved</option>
          </select>
        </div>

        <div className="grid gap-4">
          {filteredProblems.length === 0 ? (
            <div className="text-center text-gray-400 py-10">No problems found matching filters.</div>
          ) : (
            filteredProblems.map((problem) => {
              const isSolved = solvedIds.includes(String(problem.id));
              return (
                <div key={problem.id} className={`bg-gray-800 p-6 rounded-lg shadow-md border ${isSolved ? 'border-green-500/50' : 'border-gray-700'} hover:border-blue-500 transition cursor-pointer flex justify-between items-center group`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold mb-1 group-hover:text-blue-400 transition">{problem.title}</h3>
                      {isSolved && <span className="text-green-500 text-sm">✅ Solved</span>}
                    </div>

                    <div className="flex gap-4 text-sm text-gray-400 mt-1">
                      <span className={`px-2 py-0.5 rounded ${problem.difficulty === 'Easy' ? 'bg-green-900 text-green-300' :
                        problem.difficulty === 'Medium' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-red-900 text-red-300'
                        }`}>
                        {problem.difficulty}
                      </span>
                      {/* Acceptance rate hidden if not in DB or handled later */}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/solve/${problem.id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition opacity-0 group-hover:opacity-100 focus:opacity-100">
                    Solve
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Practice;
