const express = require('express');
const pool = require('../config/mysql');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');

// GET /api/sales - list all sales
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [sales] = await pool.execute('SELECT * FROM sales ORDER BY created_at DESC');
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
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Create sale record
      const [saleResult] = await connection.execute(`
        INSERT INTO sales (customer_name, customer_phone, payment_method, total_amount, tax_amount, discount_amount, user_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [customer_name || '', customer_phone || '', payment_method || 'cash', total_amount, tax_amount || 0, discount_amount || 0, req.user.id]);

      const saleId = saleResult.insertId;

      // Create sale items and update stock
      for (const item of items) {
        await connection.execute(`
          INSERT INTO sale_items (sale_id, item_id, quantity, unit_price, total_price) 
          VALUES (?, ?, ?, ?, ?)
        `, [saleId, item.id, item.quantity, item.price, item.total_price]);

        // Update item stock
        await connection.execute('UPDATE items SET stock = stock - ? WHERE id = ?', [item.quantity, item.id]);
      }

      await connection.commit();

      // Get the created sale with items
      const [sales] = await pool.execute('SELECT * FROM sales WHERE id = ?', [saleId]);
      const [saleItems] = await pool.execute('SELECT * FROM sale_items WHERE sale_id = ?', [saleId]);

      res.status(201).json({ 
        sale: sales[0], 
        items: saleItems,
        message: 'Sale created successfully' 
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to create sale', error: err.message });
  }
});

// GET /api/sales/:id - get a specific sale
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [sales] = await pool.execute('SELECT * FROM sales WHERE id = ?', [id]);
    if (sales.length === 0) return res.status(404).json({ message: 'Sale not found' });

    const [saleItems] = await pool.execute('SELECT * FROM sale_items WHERE sale_id = ?', [id]);
    res.json({ sale: sales[0], items: saleItems });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sale', error: err.message });
  }
});

module.exports = router; 