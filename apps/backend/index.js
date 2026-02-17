const express = require('express');
const cors = require('cors');
const { getDB, saveDB } = require('./utils/jsonDb');
require('dotenv').config();
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const authRoutes = require('./authRoutes');
const submissionRoutes = require('./submissionRoutes');
const problemRoutes = require('./problemRoutes');
const adminRoutes = require('./adminRoutes');

// Helper to update user stats
const updateUserStats = (userId, problemId) => {
  const db = getDB();
  const user = db.users.find(u => u.id === userId);

  if (!user) return;

  // Update Streak
  const today = new Date().toISOString().split('T')[0];
  const lastDate = user.lastSolvedDate;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (lastDate === today) {
    // Already solved today
  } else if (lastDate === yesterday) {
    user.streak++;
  } else {
    user.streak = 1;
  }

  user.lastSolvedDate = today;

  // Add to solved problems if new
  if (!user.solvedProblems.includes(problemId)) {
    user.solvedProblems.push(problemId);
  }

  // Handle Coins for Daily Problem
  const dailyId = getDailyProblemId(db.problems);
  if (problemId == dailyId && !user.dailyCoinCollected) {
    user.coins += 1;
    user.dailyCoinCollected = true;
  }
  // Let's simplify: 1 coin per unique problem solved.
  if (!user.solvedProblems.includes(problemId)) {
    user.coins += 1;
  }

  saveDB(db);
};

// Helper for daily ID
const getDailyProblemId = (problems) => {
  const today = new Date().toDateString();
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = ((hash << 5) - hash) + today.charCodeAt(i);
    hash |= 0;
  }
  const total = problems.length;
  if (total === 0) return -1;
  return problems[Math.abs(hash) % total].id;
};

// Multer Storage
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    // Unique name
    cb(null, 'profile-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Serve Uploads
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/submit', submissionRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('CodeKaro Backend Running (Updated)');
});

// User Profile Endpoint
app.get('/api/user/profile', (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ message: "UserId required" });

  const db = getDB();
  const user = db.users.find(u => u.id == userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({
    username: user.username,
    email: user.email,
    fullName: user.fullName || user.username,
    bio: user.bio || '',
    profilePicture: user.profilePicture || '',
    linkedIn: user.linkedIn || '',
    github: user.github || '',
    mobile: user.mobile || '',
    leetCode: user.leetCode || '',
    codeForces: user.codeForces || '',
    score: user.score || 0,
    coins: user.coins || 0,
    streak: user.streak || 0,
    solvedProblems: user.solvedProblems || [],
    totalSolved: user.solvedProblems ? user.solvedProblems.length : 0
  });
});

app.put('/api/user/profile', (req, res) => {
  const { userId, fullName, bio, profilePicture, linkedIn, github, mobile, leetCode, codeForces, username } = req.body;

  if (!userId) return res.status(400).json({ message: "UserId required" });

  const db = getDB();
  const user = db.users.find(u => u.id == userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  // Handle Username update
  if (username && username !== user.username) {
    const exists = db.users.find(u => u.username === username);
    if (exists) return res.status(400).json({ message: "Username already taken" });
    user.username = username;
  }

  if (fullName !== undefined) user.fullName = fullName;
  if (bio !== undefined) user.bio = bio;
  if (profilePicture !== undefined) user.profilePicture = profilePicture;
  if (linkedIn !== undefined) user.linkedIn = linkedIn;
  if (github !== undefined) user.github = github;
  if (mobile !== undefined) user.mobile = mobile;
  if (leetCode !== undefined) user.leetCode = leetCode;
  if (codeForces !== undefined) user.codeForces = codeForces;

  saveDB(db);
  res.json({ message: "Profile updated", user: { ...user, password: "" } });
});

// Upload Endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  const imageUrl = `/api/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// Search Users Endpoint
app.get('/api/users/search', (req, res) => {
  const query = req.query.q ? req.query.q.toLowerCase() : '';
  if (!query) return res.json([]);

  const db = getDB();
  const users = db.users.filter(u => u.username.toLowerCase().includes(query))
    .map(u => ({
      username: u.username,
      profilePicture: u.profilePicture,
      fullName: u.fullName
    }));

  res.json(users);
});

// Get Public Profile by Username
app.get('/api/u/:username', (req, res) => {
  const username = req.params.username;
  const db = getDB();
  const user = db.users.find(u => u.username === username);
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({
    username: user.username,
    fullName: user.fullName || user.username,
    bio: user.bio || '',
    profilePicture: user.profilePicture || '',
    score: user.score || 0,
    coins: user.coins || 0,
    streak: user.streak || 0,
    solvedProblems: user.solvedProblems || [],
    totalSolved: user.solvedProblems ? user.solvedProblems.length : 0,
    linkedIn: user.linkedIn || '',
    github: user.github || '',
    mobile: user.mobile || null,
    leetCode: user.leetCode || '',
    codeForces: user.codeForces || ''
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
