const express = require('express');
const pool = require('../config/db');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');

// GET /api/sales - get all sales (with basic info)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [sales] = await pool.query('SELECT * FROM sales ORDER BY created_at DESC');
    res.json({ sales });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sales', error: err.message });
  }
});

// POST /api/sales - process a new sale (admin/staff)
router.post('/', authenticateToken, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const { customer_name, customer_phone, payment_method, items, notes } = req.body;
    const staff_id = req.user.id;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items provided for sale' });
    }
    // Call stored procedure ProcessSale
    const [resultSets] = await pool.query(
      `CALL ProcessSale(?, ?, ?, ?, ?, ?)`,
      [customer_name || '', customer_phone || '', payment_method, staff_id, JSON.stringify(items), notes || '']
    );
    // The stored procedure returns sale_id, sale_number, total_amount
    const saleResult = resultSets[0]?.[0];
    res.status(201).json({ sale: saleResult });
  } catch (err) {
    res.status(500).json({ message: 'Failed to process sale', error: err.message });
  }
});

// GET /api/sales/:id - get sale details (with items)
router.get('/:id', authenticateToken, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const { id } = req.params;
    const [sales] = await pool.query('SELECT * FROM sales WHERE id = ?', [id]);
    if (!sales.length) return res.status(404).json({ message: 'Sale not found' });
    const [saleItems] = await pool.query('SELECT * FROM sale_items WHERE sale_id = ?', [id]);
    res.json({ sale: sales[0], items: saleItems });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sale details', error: err.message });
  }
});

module.exports = router; 