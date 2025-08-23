const express = require('express');
const pool = require('../config/mysql');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');

// GET /api/settings - get all settings (admin only) or public settings (public)
router.get('/', async (req, res) => {
  try {
    let settings;
    if (req.query.public === 'true') {
      const [rows] = await pool.execute('SELECT * FROM system_settings WHERE is_public = TRUE ORDER BY setting_category, setting_key');
      settings = rows;
    } else {
      const [rows] = await pool.execute('SELECT * FROM system_settings ORDER BY setting_category, setting_key');
      settings = rows;
    }
    res.json({ settings });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch settings', error: err.message });
  }
});

// GET /api/settings/public - get only public settings
router.get('/public', async (req, res) => {
  try {
    const [settings] = await pool.execute('SELECT * FROM system_settings WHERE is_public = TRUE ORDER BY setting_category, setting_key');
    res.json({ settings });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch public settings', error: err.message });
  }
});

// PUT /api/settings/:key - update a setting (admin only)
router.put('/:key', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    if (value === undefined) return res.status(400).json({ message: 'Setting value is required' });

    const [result] = await pool.execute('UPDATE system_settings SET setting_value = ?, updated_at = NOW() WHERE setting_key = ?', [value, key]);
    
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Setting not found' });
    
    res.json({ message: 'Setting updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update setting', error: err.message });
  }
});

// POST /api/settings - create a new setting (admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { setting_key, setting_value, setting_category, is_public, description } = req.body;
    
    if (!setting_key || setting_value === undefined) return res.status(400).json({ message: 'Setting key and value are required' });

    const [result] = await pool.execute(`
      INSERT INTO system_settings (setting_key, setting_value, setting_category, is_public, description) 
      VALUES (?, ?, ?, ?, ?) 
      ON DUPLICATE KEY UPDATE 
        setting_value = VALUES(setting_value),
        setting_category = VALUES(setting_category),
        is_public = VALUES(is_public),
        description = VALUES(description)
    `, [setting_key, setting_value, setting_category || 'system_settings', is_public || false, description || '']);

    // Get the created/updated setting
    const [settings] = await pool.execute('SELECT * FROM system_settings WHERE setting_key = ?', [setting_key]);
    res.status(201).json({ setting: settings[0], message: 'Setting created/updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create/update setting', error: err.message });
  }
});

module.exports = router; 