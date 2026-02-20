import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    if (token) {
      if (token === "mock-guest-token") {
        setUser({
          id: 'guest-local',
          username: 'Guest_explorer',
          role: 'guest',
          isGuest: true,
          token: "mock-guest-token"
        });
        setLoading(false);
        return;
      }
      try {
        const decoded = jwtDecode(token);
        // Check if token also has user info stored or fetch it? 
        // For now, rely on token payload.
        // If guest, we might need to verify with backend, but token verification is faster.
        setUser({ ...decoded, token });
      } catch (error) {
        console.error("Invalid token", error);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    }
    setLoading(false);
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const loginAsGuest = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/guest`);
      const { token, user } = res.data;
      login(token, { ...user, isGuest: true });
      return true;
    } catch (error) {
      console.error("Server guest login failed, falling back to local guest mode", error);
      // Fallback to local guest
      const mockUser = {
        _id: 'guest-local-' + Date.now(),
        id: 'guest-local-' + Date.now(),
        username: 'Guest_explorer',
        role: 'guest',
        isGuest: true,
        email: 'guest@local',
        score: 0,
        coins: 0,
        streak: 0
      };
      // Use a dummy token or no token. If ProtectedRoute checks for token, we need a dummy one.
      const mockToken = "mock-guest-token";
      login(mockToken, mockUser);
      return true;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loginAsGuest, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
