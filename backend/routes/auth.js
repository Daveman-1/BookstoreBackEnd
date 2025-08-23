const express = require('express');
const pool = require('../config/mysql');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password are required' });

    // Query MySQL for user
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE username = ? AND is_active = ?',
      [username, true]
    );
    
    if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) return res.status(401).json({ message: 'Invalid credentials' });

    // Update last login
    await pool.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// GET /api/auth/me - get current user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    
    const user = rows[0];
    res.json({ user });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Failed to fetch user info', error: err.message });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Current and new password are required' });

    // Get current user
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = rows[0];
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) return res.status(400).json({ message: 'Current password is incorrect' });

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.execute(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [newHash, user.id]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Failed to change password', error: err.message });
  }
});

module.exports = router; 