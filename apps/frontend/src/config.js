// Central API configuration
// VITE_API_URL is set in Vercel environment variables for production
// For local dev: set VITE_API_URL=http://localhost:5000 in .env.local
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default API_URL;
