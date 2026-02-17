import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    // Basic Admin Check (Client Side Only - Secure it on Backend too)
    if (!user || user.username !== 'admin') { // Or check role field
      // But for this demo, let's assume 'admin' username is the admin
      // or backend handles the check.
      // We will stick to the plan: Backend endpoint checks role.
    }

    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users or Unauthorized");
      setLoading(false);
    }
  };

  if (loading) return <div className="text-white p-8">Loading Admin Dashboard...</div>;
  if (error) return <div className="text-red-500 p-8">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-blue-400">Admin Dashboard</h1>

        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-700 text-gray-300 text-sm uppercase">
                <th className="p-4 border-b border-gray-600">ID</th>
                <th className="p-4 border-b border-gray-600">Email / Username</th>
                <th className="p-4 border-b border-gray-600">Role</th>
                <th className="p-4 border-b border-gray-600">Created At</th>
                <th className="p-4 border-b border-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-750 transition border-b border-gray-700 last:border-none">
                  <td className="p-4 font-mono text-xs text-gray-400 truncate max-w-[100px]">{u.id}</td>
                  <td className="p-4 font-medium">{u.email || u.username}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-purple-900 text-purple-200' : 'bg-green-900 text-green-200'}`}>
                      {u.role || 'user'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-400">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-4">
                    <button className="text-blue-400 hover:text-white text-sm">Edit</button>
                    <button className="text-red-400 hover:text-white text-sm ml-4">Delete</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
