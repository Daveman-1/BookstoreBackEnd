const express = require('express');
const pool = require('../config/db');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');

// GET /api/store-details - get store details (public, no auth required for receipts)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM store_details LIMIT 1');
    if (rows.length === 0) {
      // Create default store details if none exist
      await pool.query(`
        INSERT INTO store_details (name, contact, website, address, fax, email, tax_number, receipt_footer, logo) 
        VALUES ('Bookstore', '', '', '', '', '', '', '', '')
      `);
      const [newRows] = await pool.query('SELECT * FROM store_details LIMIT 1');
      res.json({ storeDetails: newRows[0] });
    } else {
      res.json({ storeDetails: rows[0] });
    }
  } catch (err) {
    console.error('Error fetching store details:', err);
    res.status(500).json({ message: 'Failed to fetch store details', error: err.message });
  }
});

// PUT /api/store-details - update store details (admin only)
router.put('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const {
      name,
      contact,
      website,
      address,
      fax,
      email,
      tax_number,
      receipt_footer,
      logo
    } = req.body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Store name is required' });
    }

    // Update store details
    const [result] = await pool.query(`
      UPDATE store_details 
      SET name = ?, contact = ?, website = ?, address = ?, fax = ?, 
          email = ?, tax_number = ?, receipt_footer = ?, logo = ?, updated_at = NOW()
      WHERE id = 1
    `, [name, contact, website, address, fax, email, tax_number, receipt_footer, logo]);

    if (result.affectedRows === 0) {
      // If no rows were updated, create the first record
      await pool.query(`
        INSERT INTO store_details (name, contact, website, address, fax, email, tax_number, receipt_footer, logo) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [name, contact, website, address, fax, email, tax_number, receipt_footer, logo]);
    }

    // Return updated store details
    const [updatedRows] = await pool.query('SELECT * FROM store_details LIMIT 1');
    res.json({ 
      message: 'Store details updated successfully',
      storeDetails: updatedRows[0]
    });
  } catch (err) {
    console.error('Error updating store details:', err);
    res.status(500).json({ message: 'Failed to update store details', error: err.message });
  }
});

module.exports = router; 