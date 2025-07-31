const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const authenticateToken = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE username = ? AND is_active = 1', [username]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    // Permissions logic
    let permissions = [];
    if (user.role === 'admin') {
      permissions = [
        'manage_inventory',
        'process_sales',
        'view_sales_history',
        'view_daily_sales',
        'upload_excel',
        'approve_uploads',
        'manage_system',
        'view_inventory'
      ];
    } else if (user.role === 'staff') {
      permissions = ['process_sales', 'upload_excel', 'view_inventory'];
    } else if (user.role === 'manager') {
      permissions = ['process_sales', 'view_sales_history', 'view_daily_sales', 'view_inventory'];
    }
    // JWT payload
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      email: user.email,
      permissions
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
    // Update last_login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
    res.json({ data: { token, user: payload } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, username, name, email, role, is_active, last_login, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    const user = users[0];
    // Permissions logic
    let permissions = [];
    if (user.role === 'admin') {
      permissions = [
        'manage_inventory',
        'process_sales',
        'view_sales_history',
        'view_daily_sales',
        'upload_excel',
        'approve_uploads',
        'manage_system',
        'view_inventory'
      ];
    } else if (user.role === 'staff') {
      permissions = ['process_sales', 'upload_excel', 'view_inventory'];
    } else if (user.role === 'manager') {
      permissions = ['process_sales', 'view_sales_history', 'view_daily_sales', 'view_inventory'];
    }
    res.json({ data: { ...user, permissions } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Change password
router.post('/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    const user = users[0];
    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) return res.status(401).json({ message: 'Current password is incorrect' });
    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, user.id]);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 