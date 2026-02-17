import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import UserProfileWidget from '../components/UserProfileWidget';

const Home = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dailyProblem, setDailyProblem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const probRes = await axios.get(`${API_URL}/problems/daily`);
        setDailyProblem(probRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      }
    };
    fetchData();
  }, []);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const res = await axios.get(`${API_URL}/users/search?q=${query}`);
        setSearchResults(res.data);
      } catch (err) {
        console.error(err);
      }
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative p-8">
      {/* Navigation */}
      <nav className="w-full flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
        <div className="flex items-center gap-6">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">CodeKaro</h1>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleSearch}
              className="bg-gray-800 text-white text-sm px-4 py-2 rounded-full border border-gray-600 focus:border-blue-500 outline-none w-64"
            />
            {searchResults.length > 0 && (
              <div className="absolute top-12 left-0 w-64 bg-gray-800 border border-gray-700 rounded shadow-xl z-50">
                {searchResults.map(u => (
                  <div
                    key={u.username}
                    onClick={() => navigate(`/u/${u.username}`)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-700 cursor-pointer"
                  >
                    <img src={u.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} className="w-8 h-8 rounded-full" />
                    <div>
                      <p className="text-sm font-bold text-white">{u.fullName || u.username}</p>
                      <p className="text-[10px] text-gray-400">@{u.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 ml-4">
            <span onClick={() => navigate('/profile')} className="font-semibold text-lg cursor-pointer hover:text-blue-400 transition">{user?.username}</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition font-bold cursor-pointer text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">

        {/* Left Sidebar - Profile Widget */}
        <div className="w-full md:w-1/4">
          <UserProfileWidget />

          {/* Quick Links or Ads could go here */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 mt-6 hidden md:block">
            <h3 className="font-bold mb-2 text-gray-400">Pro Tip</h3>
            <p className="text-sm text-gray-500">Consistency is key! Solve one problem every day to keep your streak alive.</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-3/4">
          <h1 className="text-4xl font-bold mb-8 text-white">
            Dashboard
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 w-full">

            {/* Daily Problem Card - Full Width on Mobile, Half on Desktop? Or Full Width? */}
            <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-indigo-900 to-purple-900 p-8 rounded-xl shadow-lg border border-purple-500/30 transform hover:-translate-y-1 transition duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                <span className="text-9xl">📅</span>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white relative z-10">Problem of the Day</h2>
              <p className="text-purple-200 mb-6 relative z-10">Solve today's challenge and earn a golden coin!</p>

              {dailyProblem ? (
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-2">{dailyProblem.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs inline-block mb-4 ${dailyProblem.difficulty === 'Easy' ? 'bg-green-900 text-green-300' :
                    dailyProblem.difficulty === 'Medium' ? 'bg-yellow-900 text-yellow-300' :
                      'bg-red-900 text-red-300'
                    }`}>
                    {dailyProblem.difficulty}
                  </span>
                  <button
                    onClick={() => navigate(`/solve/${dailyProblem.id}`)}
                    className="w-full py-2 px-4 bg-white text-purple-900 hover:bg-gray-100 rounded font-bold transition mt-4"
                  >
                    Solve Now
                  </button>
                </div>
              ) : (
                <p>Loading daily problem...</p>
              )}
            </div>

            {/* Practice Card */}
            <div
              onClick={() => navigate('/practice')}
              className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <h2 className="text-3xl font-bold mb-4 text-white">Practice</h2>
                <p className="text-gray-400 mb-6">Master algorithms and data structures with our curated problem set.</p>
              </div>
              <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold transition">Start Coding</button>
            </div>

            {/* Contest Card */}
            <div
              onClick={() => navigate('/contest')}
              className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700 hover:border-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <h2 className="text-3xl font-bold mb-4 text-white">Contest</h2>
                <p className="text-gray-400 mb-6">Compete against the best developers in real-time programming contests.</p>
              </div>
              <button className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded text-white font-bold transition">Join Contest</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
