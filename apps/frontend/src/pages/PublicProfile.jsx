import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PublicProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/u/${username}`);
        setProfile(res.data);
      } catch (err) {
        console.error("Error fetching public profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading) return <div className="text-white text-center mt-20">Loading Profile...</div>;
  if (!profile) return <div className="text-white text-center mt-20">User Not Found</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8">
      <button onClick={() => navigate(-1)} className="self-start mb-8 text-gray-400 hover:text-white">← Back</button>

      <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700 w-full max-w-2xl">
        <div className="flex flex-col items-center gap-6 mb-8">
          <img
            src={profile.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-lg bg-gray-700 object-cover"
          />
          <div className="text-center">
            <h1 className="text-3xl font-bold">{profile.fullName}</h1>
            <p className="text-gray-400">@{profile.username}</p>
            <p className="text-gray-300 mt-2 italic">"{profile.bio || 'No bio yet.'}"</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 p-4 rounded border border-gray-700 text-center">
            <span className="text-gray-500 text-xs block uppercase">Score</span>
            <span className="text-2xl font-bold text-blue-400">{profile.score}</span>
          </div>
          <div className="bg-gray-900 p-4 rounded border border-gray-700 text-center">
            <span className="text-gray-500 text-xs block uppercase">Solved</span>
            <span className="text-2xl font-bold text-green-400">{profile.totalSolved}</span>
          </div>
          <div className="bg-gray-900 p-4 rounded border border-gray-700 text-center">
            <span className="text-gray-500 text-xs block uppercase">Coins</span>
            <span className="text-2xl font-bold text-yellow-400">🪙 {profile.coins}</span>
          </div>
          <div className="bg-gray-900 p-4 rounded border border-gray-700 text-center">
            <span className="text-gray-500 text-xs block uppercase">Streak</span>
            <span className="text-2xl font-bold text-orange-400">🔥 {profile.streak}</span>
          </div>
        </div>

        {/* Links */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">Social & Coding Profiles</h3>
          <div className="flex flex-wrap gap-4">
            {profile.github && <a href={profile.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded hover:bg-gray-600 transition"><i className="fab fa-github"></i> GitHub</a>}
            {profile.linkedIn && <a href={profile.linkedIn} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-blue-900/50 text-blue-300 px-4 py-2 rounded hover:bg-blue-900 transition"><i className="fab fa-linkedin"></i> LinkedIn</a>}
            {profile.leetCode && <a href={profile.leetCode} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-yellow-900/50 text-yellow-300 px-4 py-2 rounded hover:bg-yellow-900 transition">LeetCode</a>}
            {profile.codeForces && <a href={profile.codeForces} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-red-900/50 text-red-300 px-4 py-2 rounded hover:bg-red-900 transition">CodeForces</a>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
