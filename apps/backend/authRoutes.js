const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getDB, saveDB } = require('./utils/jsonDb');

const router = express.Router();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const db = getDB();
    const existingUser = db.users.find(u => u.email === email);

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = {
      id: db.users.length + 1, // Simple ID generation
      username,
      email,
      password: hashedPassword
    };

    db.users.push(newUser);
    saveDB(db);

    res.status(201).json({
      _id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      token: generateToken(newUser.id),
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const db = getDB();
    const user = db.users.find(u => u.email === email);

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        username: user.username,
        email: user.email,
        token: generateToken(user.id),
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } else {
      res.status(400).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = router;
