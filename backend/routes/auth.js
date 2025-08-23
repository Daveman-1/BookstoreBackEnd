const express = require('express');
const pool = require('../config/mysql');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    console.log('🔍 Login attempt:', { username: req.body.username, hasPassword: !!req.body.password });
    
    const { username, password } = req.body;
    if (!username || !password) {
      console.log('🔍 Login failed - Missing credentials');
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('🔍 Login failed - JWT_SECRET not configured');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Query MySQL for user
    console.log('🔍 Querying database for user:', username);
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE username = ? AND is_active = ?',
      [username, true]
    );
    
    if (rows.length === 0) {
      console.log('🔍 Login failed - User not found or inactive:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    console.log('🔍 User found:', { id: user.id, username: user.username, role: user.role });
    
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      console.log('🔍 Login failed - Invalid password for user:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    await pool.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Generate JWT token
    const tokenPayload = { id: user.id, username: user.username, role: user.role };
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('🔍 Login successful - Token generated for user:', { 
      id: user.id, 
      username: user.username, 
      tokenLength: token.length 
    });

    const response = {
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };

    res.json(response);
  } catch (err) {
    console.error('🔍 Login error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// GET /api/auth/verify - verify token validity
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, username, name, email, role, is_active FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (rows.length === 0 || !rows[0].is_active) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }
    
    const user = rows[0];
    res.json({ 
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(500).json({ message: 'Token verification failed', error: err.message });
  }
});

// GET /api/auth/me - get current user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, username, name, email, role, created_at, last_login FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    
    const user = rows[0];
    res.json({ 
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        last_login: user.last_login
      }
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Failed to fetch user info', error: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a more sophisticated setup, you might want to blacklist the token
    // For now, we'll just return success and let the frontend handle token removal
    res.json({ message: 'Logout successful' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Logout failed', error: err.message });
  }
});

// POST /api/auth/refresh - refresh token
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, username, role, is_active FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (rows.length === 0 || !rows[0].is_active) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }
    
    const user = rows[0];
    
    // Generate new JWT token
    const newToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Token refreshed successfully',
      token: newToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Token refresh error:', err);
    res.status(500).json({ message: 'Token refresh failed', error: err.message });
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