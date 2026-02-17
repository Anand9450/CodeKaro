import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const UserProfileWidget = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '', bio: '', profilePicture: '', email: '',
    linkedIn: '', github: '', mobile: '',
    leetCode: '', codeForces: '', username: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/user/profile?userId=${user.id}`);
      setProfile(res.data);
      setFormData({
        fullName: res.data.fullName || '',
        bio: res.data.bio || '',
        email: res.data.email || '',
        profilePicture: res.data.profilePicture || '',
        linkedIn: res.data.linkedIn || '',
        github: res.data.github || '',
        mobile: res.data.mobile || '',
        leetCode: res.data.leetCode || '',
        codeForces: res.data.codeForces || '',
        username: res.data.username || ''
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    try {
      setError('');
      await axios.put('http://localhost:5000/user/profile', {
        userId: user.id,
        ...formData
      });
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      console.error("Error updating profile", err);
      setError(err.response?.data?.message || 'Error updating profile');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    try {
      const res = await axios.post('http://localhost:5000/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData({ ...formData, profilePicture: res.data.imageUrl });
    } catch (err) {
      console.error("Upload failed", err);
      setError("Image upload failed");
    }
  };

  if (!profile) return <div className="text-gray-400">Loading Profile...</div>;

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 w-full mb-8">
      {error && <div className="bg-red-900/50 text-red-200 p-2 rounded mb-4 text-xs text-center border border-red-700">{error}</div>}
      <div className="flex flex-col items-center gap-4 mb-6">
        <div className="relative group">
          <img
            src={formData.profilePicture || profile.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
            alt="Profile"
            className="w-24 h-24 rounded-full border-2 border-blue-500 shadow-md bg-gray-700 object-cover transform group-hover:scale-105 transition duration-300"
          />
          {isEditing && (
            <div className="absolute -bottom-2 w-full flex justify-center">
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-2 py-1 rounded shadow transition">
                Upload
                <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
              </label>
            </div>
          )}
        </div>

        <div className="text-center w-full">
          {isEditing ? (
            <>
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="bg-gray-700 text-sm font-bold rounded p-1 text-white outline-none focus:ring-1 focus:ring-blue-500 w-full mb-1 text-center border border-gray-600"
              />
              <input
                type="text"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="bg-gray-700 text-lg font-bold rounded p-1 text-white outline-none focus:ring-1 focus:ring-blue-500 w-full mb-1 text-center"
              />
              <input
                type="text"
                placeholder="Mobile"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="bg-gray-700 text-xs rounded p-1 text-gray-300 outline-none focus:ring-1 focus:ring-blue-500 w-full mb-1 text-center"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-gray-700 text-xs rounded p-1 text-gray-300 outline-none focus:ring-1 focus:ring-blue-500 w-full text-center"
              />
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-white">{profile.fullName}</h2>
              <p className="text-gray-400 text-sm">@{profile.username}</p>
              {profile.mobile && <p className="text-gray-500 text-xs mt-1">{profile.mobile}</p>}
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3 mb-4">
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full h-20 bg-gray-700 rounded p-2 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            placeholder="Bio..."
          />
          <div className="grid grid-cols-1 gap-2">
            <input type="text" placeholder="LinkedIn" value={formData.linkedIn} onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })} className="bg-gray-700 p-1 rounded text-xs text-white" />
            <input type="text" placeholder="GitHub" value={formData.github} onChange={(e) => setFormData({ ...formData, github: e.target.value })} className="bg-gray-700 p-1 rounded text-xs text-white" />
            <input type="text" placeholder="LeetCode" value={formData.leetCode} onChange={(e) => setFormData({ ...formData, leetCode: e.target.value })} className="bg-gray-700 p-1 rounded text-xs text-white" />
            <input type="text" placeholder="CodeForces" value={formData.codeForces} onChange={(e) => setFormData({ ...formData, codeForces: e.target.value })} className="bg-gray-700 p-1 rounded text-xs text-white" />
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <p className="text-gray-300 text-sm italic mb-4 text-center line-clamp-3">"{profile.bio || 'Hello World!'}"</p>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-gray-900 p-2 rounded border border-gray-700 text-center">
              <span className="text-gray-500 text-[10px] block">Score</span>
              <span className="text-lg font-bold text-blue-400">{profile.score}</span>
            </div>
            <div className="bg-gray-900 p-2 rounded border border-gray-700 text-center">
              <span className="text-gray-500 text-[10px] block">Solved</span>
              <span className="text-lg font-bold text-green-400">{profile.totalSolved}</span>
            </div>
            <div className="bg-gray-900 p-2 rounded border border-gray-700 text-center">
              <span className="text-gray-500 text-[10px] block">Coins</span>
              <span className="text-lg font-bold text-yellow-400">🪙 {profile.coins}</span>
            </div>
            <div className="bg-gray-900 p-2 rounded border border-gray-700 text-center">
              <span className="text-gray-500 text-[10px] block">Streak</span>
              <span className="text-lg font-bold text-orange-400">🔥 {profile.streak}</span>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            {profile.github && <a href={profile.github} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition"><i className="fab fa-github"></i> GH</a>}
            {profile.linkedIn && <a href={profile.linkedIn} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 transition"><i className="fab fa-linkedin"></i> LI</a>}
            {profile.leetCode && <a href={profile.leetCode} target="_blank" rel="noreferrer" className="text-yellow-500 hover:text-yellow-400 transition font-bold text-xs">LC</a>}
            {profile.codeForces && <a href={profile.codeForces} target="_blank" rel="noreferrer" className="text-red-500 hover:text-red-400 transition font-bold text-xs">CF</a>}
          </div>
        </div>
      )}

      <button
        onClick={() => isEditing ? handleUpdate() : setIsEditing(true)}
        className={`w-full py-2 rounded font-bold text-sm transition ${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {isEditing ? 'Save Profile' : 'Edit Profile'}
      </button>
    </div>
  );
};

export default UserProfileWidget;
