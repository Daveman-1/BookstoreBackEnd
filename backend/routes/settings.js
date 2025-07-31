const express = require('express');
const pool = require('../config/db');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');

// GET /api/settings - get all system settings (admin: all, others: public only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let settings;
    if (req.user && req.user.role === 'admin') {
      [settings] = await pool.query('SELECT * FROM system_settings ORDER BY setting_category, setting_key');
    } else {
      [settings] = await pool.query('SELECT * FROM system_settings WHERE is_public = TRUE ORDER BY setting_category, setting_key');
    }
    res.json({ settings });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch settings', error: err.message });
  }
});

// GET /api/settings/categories - get settings grouped by category
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    let settings;
    if (req.user && req.user.role === 'admin') {
      [settings] = await pool.query('SELECT * FROM system_settings ORDER BY setting_category, setting_key');
    } else {
      [settings] = await pool.query('SELECT * FROM system_settings WHERE is_public = TRUE ORDER BY setting_category, setting_key');
    }
    
    // Group settings by category
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.setting_category]) {
        acc[setting.setting_category] = [];
      }
      acc[setting.setting_category].push(setting);
      return acc;
    }, {});
    
    res.json({ settings: groupedSettings });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch settings', error: err.message });
  }
});

// PUT /api/settings - update system settings (admin only)
router.put('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const updates = req.body; // { setting_key: setting_value, ... }
    if (!updates || typeof updates !== 'object') return res.status(400).json({ message: 'Invalid settings update' });
    for (const [key, value] of Object.entries(updates)) {
      await pool.query('UPDATE system_settings SET setting_value = ?, updated_at = NOW() WHERE setting_key = ?', [value, key]);
    }
    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update settings', error: err.message });
  }
});

module.exports = router; 