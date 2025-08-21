const express = require('express');
const pool = require('../config/db');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');

// GET /api/store-details - get store details
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM store_details LIMIT 1');
    if (rows.length === 0) {
      // Create default store details if none exist
      await pool.query(`
        INSERT INTO store_details (name, contact, website, address, fax, email, tax_number, receipt_footer, logo) 
        VALUES ('Bookstore', '', '', '', '', '', '', '', '')
      `);
      const { rows: newRows } = await pool.query('SELECT * FROM store_details LIMIT 1');
      return res.json({ store: newRows[0] });
    }
    res.json({ store: rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch store details', error: err.message });
  }
});

// PUT /api/store-details - update store details (admin only)
router.put('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { name, contact, website, address, fax, email, tax_number, receipt_footer, logo } = req.body;
    if (!name) return res.status(400).json({ message: 'Store name is required' });

    const result = await pool.query(`
      UPDATE store_details SET 
        name=$1, contact=$2, website=$3, address=$4, fax=$5, 
        email=$6, tax_number=$7, receipt_footer=$8, logo=$9
      WHERE id = (SELECT id FROM store_details LIMIT 1)
    `, [name, contact || '', website || '', address || '', fax || '', email || '', tax_number || '', receipt_footer || '', logo || '']);

    if (result.rowCount === 0) {
      // Create if doesn't exist
      await pool.query(`
        INSERT INTO store_details (name, contact, website, address, fax, email, tax_number, receipt_footer, logo) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [name, contact || '', website || '', address || '', fax || '', email || '', tax_number || '', receipt_footer || '', logo || '']);
    }

    const { rows: updatedRows } = await pool.query('SELECT * FROM store_details LIMIT 1');
    res.json({ store: updatedRows[0], message: 'Store details updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update store details', error: err.message });
  }
});

module.exports = router; 