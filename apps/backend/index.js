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

const supabase = require('./utils/supabase');

// User Profile Endpoint
app.get('/api/user/profile', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ message: "UserId required" });

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) return res.status(404).json({ message: "User not found" });

    res.json({
      username: user.username,
      email: user.email,
      fullName: user.full_name || user.username,
      bio: user.bio || '',
      profilePicture: user.profile_picture || '',
      linkedIn: user.linkedin || '',
      github: user.github || '',
      mobile: user.mobile || null,
      leetCode: user.leetcode || '',
      codeForces: user.codeforces || '',
      score: user.score || 0,
      coins: user.coins || 0,
      streak: user.streak || 0,
      solvedProblems: user.solved_problems || [],
      totalSolved: user.solved_problems ? user.solved_problems.length : 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.put('/api/user/profile', async (req, res) => {
  const { userId, fullName, bio, profilePicture, linkedIn, github, mobile, leetCode, codeForces, username } = req.body;

  if (!userId) return res.status(400).json({ message: "UserId required" });

  try {
    // Check username uniqueness if changing
    if (username) {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .neq('id', userId)
        .single();

      if (existing) return res.status(400).json({ message: "Username already taken" });
    }

    const updates = {};
    if (username !== undefined) updates.username = username;
    if (fullName !== undefined) updates.full_name = fullName;
    if (bio !== undefined) updates.bio = bio;
    if (profilePicture !== undefined) updates.profile_picture = profilePicture;
    if (linkedIn !== undefined) updates.linkedin = linkedIn;
    if (github !== undefined) updates.github = github;
    if (mobile !== undefined) updates.mobile = mobile;
    if (leetCode !== undefined) updates.leetcode = leetCode;
    if (codeForces !== undefined) updates.codeforces = codeForces;

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: "Profile updated", user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
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
app.get('/api/users/search', async (req, res) => {
  const query = req.query.q ? req.query.q.toLowerCase() : '';
  if (!query) return res.json([]);

  try {
    const { data: users } = await supabase
      .from('users')
      .select('username, full_name, profile_picture')
      .ilike('username', `%${query}%`)
      .limit(10);

    const mapped = (users || []).map(u => ({
      username: u.username,
      fullName: u.full_name,
      profilePicture: u.profile_picture
    }));

    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.json([]);
  }
});

// Get Public Profile by Username
app.get('/api/u/:username', async (req, res) => {
  const username = req.params.username;
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) return res.status(404).json({ message: "User not found" });

    res.json({
      username: user.username,
      fullName: user.full_name || user.username,
      bio: user.bio || '',
      profilePicture: user.profile_picture || '',
      score: user.score || 0,
      coins: user.coins || 0,
      streak: user.streak || 0,
      solvedProblems: user.solved_problems || [],
      totalSolved: user.solved_problems ? user.solved_problems.length : 0,
      linkedIn: user.linkedin || '',
      github: user.github || '',
      mobile: user.mobile || null,
      leetCode: user.leetcode || '',
      codeForces: user.codeforces || ''
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
