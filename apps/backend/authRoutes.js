const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('./utils/supabase');

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

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        username,
        email,
        password: hashedPassword,
        score: 0,
        streak: 0,
        coins: 0,
        solved_problems: []
      })
      .select() // Return the created user
      .single();

    if (error) {
      console.error("Supabase Register Error:", error);
      return res.status(500).json({ message: error.message || 'Registration failed' });
    }

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

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (await bcrypt.compare(password, user.password)) {
      res.json({
        _id: user.id,
        username: user.username,
        email: user.email,
        token: generateToken(user.id),
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          score: user.score,
          coins: user.coins
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

const { v4: uuidv4 } = require('uuid');

router.post('/guest', async (req, res) => {
  try {
    const guestId = uuidv4().slice(0, 8);
    const username = `guest_${guestId}`;
    const email = `${username}@temp.codekaro.com`;
    const password = `guest_${uuidv4()}`;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create guest user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        username,
        email,
        password: hashedPassword,
        score: 0,
        streak: 0,
        coins: 0,
        solved_problems: [],
        role: 'guest'
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase Guest Error:", error);
      return res.status(500).json({ message: 'Failed to create guest session' });
    }

    res.status(201).json({
      _id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: 'guest',
      token: generateToken(newUser.id),
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        score: 0,
        coins: 0,
        role: 'guest' // Important flag
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
