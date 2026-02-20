import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', bio: '', profilePicture: '', email: '',
    linkedIn: '', github: '', mobile: '',
    leetCode: '', codeForces: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/user/profile?userId=${user.id}`);
      setProfile(res.data);
      setFormData({
        fullName: res.data.fullName || '',
        email: res.data.email || '',
        bio: res.data.bio || '',
        profilePicture: res.data.profilePicture || '',
        linkedIn: res.data.linkedIn || '',
        github: res.data.github || '',
        mobile: res.data.mobile || '',
        leetCode: res.data.leetCode || '',
        codeForces: res.data.codeForces || ''
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    try {
      const res = await axios.post(`${API_URL}/upload`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, profilePicture: res.data.imageUrl }));
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${API_URL}/user/profile`, {
        userId: user.id,
        ...formData
      });
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      console.error("Error updating profile", err);
    }
  };

  if (!profile) return <div className="text-white p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex justify-center">
      <div className="w-full max-w-4xl bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-700">
        <div className="flex flex-col md:flex-row gap-8 items-start">

          {/* Profile Image */}
          <div className="flex flex-col items-center gap-4">
            <img
              src={formData.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
              alt="Profile"
              className="w-40 h-40 rounded-full border-4 border-blue-500 shadow-xl bg-gray-700 object-cover"
            />
            {isEditing && (
              <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white text-xs py-2 px-4 rounded transition">
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}

          </div>

          {/* Info */}
          <div className="flex-1 w-full">
            <div className="flex justify-between items-start mb-6">
              <div className="w-full">
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="bg-gray-700 text-lg font-bold rounded p-2 text-white outline-none focus:ring-2 focus:ring-blue-500 w-full"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-gray-700 text-sm rounded p-2 text-white outline-none focus:ring-2 focus:ring-blue-500 w-full"
                    />
                    <input
                      type="text"
                      placeholder="Mobile Number"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="bg-gray-700 text-sm rounded p-2 text-white outline-none focus:ring-2 focus:ring-blue-500 w-full"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-4xl font-bold">{profile.fullName}</h1>
                    {profile.mobile && <p className="text-gray-400 text-sm mt-1">📞 {profile.mobile}</p>}
                  </>
                )}
                <p className="text-gray-400 text-lg">@{profile.username}</p>
                <p className="text-gray-500 text-sm">{profile.email}</p>
              </div>
              <button
                onClick={() => isEditing ? handleUpdate() : setIsEditing(true)}
                className={`px-6 py-2 rounded font-bold transition flex-shrink-0 ${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isEditing ? 'Save Profile' : 'Edit Profile'}
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-4 mb-6">
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full h-24 bg-gray-700 rounded p-4 text-white outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about yourself..."
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="LinkedIn URL" value={formData.linkedIn} onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })} className="bg-gray-700 p-2 rounded text-white focus:ring-2 focus:ring-blue-500" />
                  <input type="text" placeholder="GitHub URL" value={formData.github} onChange={(e) => setFormData({ ...formData, github: e.target.value })} className="bg-gray-700 p-2 rounded text-white focus:ring-2 focus:ring-blue-500" />
                  <input type="text" placeholder="LeetCode Profile URL" value={formData.leetCode} onChange={(e) => setFormData({ ...formData, leetCode: e.target.value })} className="bg-gray-700 p-2 rounded text-white focus:ring-2 focus:ring-blue-500" />
                  <input type="text" placeholder="CodeForces Profile URL" value={formData.codeForces} onChange={(e) => setFormData({ ...formData, codeForces: e.target.value })} className="bg-gray-700 p-2 rounded text-white focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            ) : (
              <>
                <p className="text-gray-300 text-lg mb-6 italic">"{profile.bio || 'No bio yet.'}"</p>

                {/* Social & Coding Profiles */}
                <div className="flex flex-wrap gap-4 mb-8">
                  {profile.github && <a href={profile.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded hover:bg-gray-600 transition">GitHub ↗</a>}
                  {profile.linkedIn && <a href={profile.linkedIn} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-blue-700 px-4 py-2 rounded hover:bg-blue-600 transition">LinkedIn ↗</a>}
                </div>

                {(profile.leetCode || profile.codeForces) && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Coding Profiles</h3>
                    <div className="flex flex-wrap gap-4">
                      {profile.leetCode && <a href={profile.leetCode} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-yellow-600 px-4 py-2 rounded hover:bg-yellow-500 transition font-bold">LeetCode ↗</a>}
                      {profile.codeForces && <a href={profile.codeForces} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded hover:bg-red-500 transition font-bold">CodeForces ↗</a>}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Stats Grid */}
            <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 text-center">
                <span className="text-gray-400 text-sm block mb-1">Total Score</span>
                <span className="text-2xl font-bold text-blue-400">{profile.score}</span>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 text-center">
                <span className="text-gray-400 text-sm block mb-1">Coins</span>
                <span className="text-2xl font-bold text-yellow-400">🪙 {profile.coins}</span>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 text-center">
                <span className="text-gray-400 text-sm block mb-1">Streak</span>
                <span className="text-2xl font-bold text-orange-400">🔥 {profile.streak}</span>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 text-center">
                <span className="text-gray-400 text-sm block mb-1">Solved</span>
                <span className="text-2xl font-bold text-green-400">{profile.totalSolved}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
