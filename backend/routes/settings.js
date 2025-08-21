const express = require('express');
const pool = require('../config/db');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');

// GET /api/settings - get all settings (admin only) or public settings (public)
router.get('/', async (req, res) => {
  try {
    let settings;
    if (req.query.public === 'true') {
      const { rows } = await pool.query('SELECT * FROM system_settings WHERE is_public = TRUE ORDER BY setting_category, setting_key');
      settings = rows;
    } else {
      const { rows } = await pool.query('SELECT * FROM system_settings ORDER BY setting_category, setting_key');
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
    const { rows: settings } = await pool.query('SELECT * FROM system_settings WHERE is_public = TRUE ORDER BY setting_category, setting_key');
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

    const result = await pool.query('UPDATE system_settings SET setting_value = $1, updated_at = NOW() WHERE setting_key = $2', [value, key]);
    
    if (result.rowCount === 0) return res.status(404).json({ message: 'Setting not found' });
    
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

    const result = await pool.query(`
      INSERT INTO system_settings (setting_key, setting_value, setting_category, is_public, description) 
      VALUES ($1, $2, $3, $4, $5) 
      ON CONFLICT (setting_key) DO UPDATE SET 
        setting_value = EXCLUDED.setting_value,
        setting_category = EXCLUDED.setting_category,
        is_public = EXCLUDED.is_public,
        description = EXCLUDED.description
      RETURNING *
    `, [setting_key, setting_value, setting_category || 'system_settings', is_public || false, description || '']);

    res.status(201).json({ setting: result.rows[0], message: 'Setting created/updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create/update setting', error: err.message });
  }
});

module.exports = router; 