const express = require('express');
const pool = require('../config/db');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');

// GET /api/sales - list all sales
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { rows: sales } = await pool.query('SELECT * FROM sales ORDER BY created_at DESC');
    res.json({ sales });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sales', error: err.message });
  }
});

// POST /api/sales - create a new sale
router.post('/', authenticateToken, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const { items, customer_name, customer_phone, payment_method, total_amount, tax_amount, discount_amount } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'Items are required' });

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create sale record
      const saleResult = await client.query(`
        INSERT INTO sales (customer_name, customer_phone, payment_method, total_amount, tax_amount, discount_amount, user_id) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
      `, [customer_name || '', customer_phone || '', payment_method || 'cash', total_amount, tax_amount || 0, discount_amount || 0, req.user.id]);

      const saleId = saleResult.rows[0].id;

      // Create sale items and update stock
      for (const item of items) {
        await client.query(`
          INSERT INTO sale_items (sale_id, item_id, quantity, unit_price, total_price) 
          VALUES ($1, $2, $3, $4, $5)
        `, [saleId, item.id, item.quantity, item.price, item.total_price]);

        // Update item stock
        await client.query('UPDATE items SET stock = stock - $1 WHERE id = $2', [item.quantity, item.id]);
      }

      await client.query('COMMIT');

      // Get the created sale with items
      const { rows: sales } = await pool.query('SELECT * FROM sales WHERE id = $1', [saleId]);
      const { rows: saleItems } = await pool.query('SELECT * FROM sale_items WHERE sale_id = $1', [saleId]);

      res.status(201).json({ 
        sale: sales[0], 
        items: saleItems,
        message: 'Sale created successfully' 
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to create sale', error: err.message });
  }
});

// GET /api/sales/:id - get a specific sale
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rows: sales } = await pool.query('SELECT * FROM sales WHERE id = $1', [id]);
    if (sales.length === 0) return res.status(404).json({ message: 'Sale not found' });

    const { rows: saleItems } = await pool.query('SELECT * FROM sale_items WHERE sale_id = $1', [id]);
    res.json({ sale: sales[0], items: saleItems });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sale', error: err.message });
  }
});

module.exports = router; 