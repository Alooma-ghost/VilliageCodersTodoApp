const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../services/store');
const { protect } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};


// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, title } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const cleanEmail = (email || '').trim().toLowerCase();

    // Strict email regex: requires standard characters, valid domain, and at least a 2-char TLD
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail) || cleanEmail.includes('..')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address (e.g. name@company.com)',
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const userExists = await store.findUserByEmail(cleanEmail);
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await store.createUser({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: role === 'Boss' ? 'Boss' : 'Member',
      title: title ? title.trim() : (role === 'Boss' ? 'Technical Lead' : 'Developer'),
    });

    const token = generateToken(user._id || user.id);

    res.status(201).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server registration error' });
  }
});

// @route   ALL /api/auth/reset-database
// Allows wiping test data from both MongoDB and local storage to start completely afresh
router.all('/reset-database', async (req, res) => {
  try {
    const result = await store.clearAllData();
    res.json({
      success: true,
      message: 'Database wiped clean successfully. All test accounts and tasks have been removed.',
      ...result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter your email and password' });
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const user = await store.findUserByEmail(cleanEmail);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email. Please create an account first.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please verify and try again.',
      });
    }

    const { password: _, ...safeUser } = user;
    const token = generateToken(user._id || user.id);

    res.json({
      success: true,
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server login error' });
  }
});

// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// @route   GET /api/auth/users
router.get('/users', protect, async (req, res) => {
  try {
    const users = await store.getAllUsers();
    res.json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve team members' });
  }
});

module.exports = router;
