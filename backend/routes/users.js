const express = require('express');
const pool = require('../config/db');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');
const bcrypt = require('bcrypt');

// GET /api/users - list all users (admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { rows: users } = await pool.query('SELECT id, username, name, email, role, is_active, created_at FROM users');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
});

// POST /api/users - add a new user (admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { username, password, name, email, role } = req.body;
    if (!username || !password || !name || !email || !role) return res.status(400).json({ message: 'Missing required fields' });
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password_hash, name, email, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [username, password_hash, name, email, role]
    );
    const { rows: userRows } = await pool.query('SELECT id, username, name, email, role, is_active, created_at FROM users WHERE id = $1', [result.rows[0].id]);
    res.status(201).json({ user: userRows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add user', error: err.message });
  }
});

// PUT /api/users/:id - edit a user (admin only)
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, is_active } = req.body;
    const result = await pool.query(
      'UPDATE users SET name=$1, email=$2, role=$3, is_active=$4 WHERE id=$5',
      [name, email, role, is_active == null ? 1 : is_active, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'User not found' });
    const { rows: userRows } = await pool.query('SELECT id, username, name, email, role, is_active, created_at FROM users WHERE id = $1', [id]);
    res.json({ user: userRows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
});

// DELETE /api/users/:id - delete a user (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
});

module.exports = router; 