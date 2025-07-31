const express = require('express');
const pool = require('../config/db');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');

// GET /api/items - get all items
router.get('/', async (req, res) => {
  try {
    const [items] = await pool.query(`
      SELECT i.*, c.name as category 
      FROM items i 
      LEFT JOIN categories c ON i.category_id = c.id
      ORDER BY i.name
    `);
    console.log('Fetched items:', items);
    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch items', error: err.message });
  }
});

// POST /api/items - add a new item (admin or staff)
router.post('/', authenticateToken, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const { name, category, description, price, stock_quantity, min_stock_level, image_url, sku, barcode, supplier_id, cost_price } = req.body;
    if (!name || !category || price == null || stock_quantity == null) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Validate image_url size if present
    if (image_url && image_url.length > 10 * 1024 * 1024) { // 10MB limit for base64
      return res.status(400).json({ message: 'Image file is too large. Please use an image smaller than 5MB.' });
    }
    
    // Find category_id if category is a string (name)
    let category_id = category;
    if (typeof category === 'string') {
      const [catRows] = await pool.query('SELECT id FROM categories WHERE name = ?', [category]);
      if (!catRows.length) return res.status(400).json({ message: 'Invalid category' });
      category_id = catRows[0].id;
    }
    const [result] = await pool.query(
      `INSERT INTO items (name, category_id, description, price, stock_quantity, min_stock_level, image_url, sku, barcode, supplier_id, cost_price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, category_id, description || '', price, stock_quantity, min_stock_level || 10, image_url || '', sku || null, barcode || null, supplier_id || null, cost_price || null]
    );
    const [itemRows] = await pool.query(`
      SELECT i.*, c.name as category 
      FROM items i 
      LEFT JOIN categories c ON i.category_id = c.id 
      WHERE i.id = ?
    `, [result.insertId]);
    res.status(201).json({ item: itemRows[0] });
  } catch (err) {
    console.error('Error creating item:', err);
    res.status(500).json({ message: 'Failed to add item', error: err.message });
  }
});

// PUT /api/items/:id - update an item (admin or staff)
router.put('/:id', authenticateToken, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, price, stock_quantity, min_stock_level, image_url, sku, barcode, supplier_id, cost_price, is_active } = req.body;
    
    // Validate image_url size if present
    if (image_url && image_url.length > 10 * 1024 * 1024) { // 10MB limit for base64
      return res.status(400).json({ message: 'Image file is too large. Please use an image smaller than 5MB.' });
    }
    
    // Find category_id if category is a string (name)
    let category_id = category;
    if (typeof category === 'string') {
      const [catRows] = await pool.query('SELECT id FROM categories WHERE name = ?', [category]);
      if (!catRows.length) return res.status(400).json({ message: 'Invalid category' });
      category_id = catRows[0].id;
    }
    const [result] = await pool.query(
      `UPDATE items SET name=?, category_id=?, description=?, price=?, stock_quantity=?, min_stock_level=?, image_url=?, sku=?, barcode=?, supplier_id=?, cost_price=?, is_active=? WHERE id=?`,
      [name, category_id, description || '', price, stock_quantity, min_stock_level || 10, image_url || '', sku || null, barcode || null, supplier_id || null, cost_price || null, is_active == null ? 1 : is_active, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Item not found' });
    const [itemRows] = await pool.query(`
      SELECT i.*, c.name as category 
      FROM items i 
      LEFT JOIN categories c ON i.category_id = c.id 
      WHERE i.id = ?
    `, [id]);
    res.json({ item: itemRows[0] });
  } catch (err) {
    console.error('Error updating item:', err);
    res.status(500).json({ message: 'Failed to update item', error: err.message });
  }
});

// DELETE /api/items/:id - delete an item (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM items WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete item', error: err.message });
  }
});

// GET /api/items/low-stock - get low stock items
router.get('/low-stock', authenticateToken, async (req, res) => {
  try {
    const threshold = req.query.threshold || 10;
    const [items] = await pool.query(`
      SELECT i.*, c.name as category 
      FROM items i 
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.stock_quantity <= ? AND i.is_active = 1
      ORDER BY i.stock_quantity ASC, i.name ASC
    `, [threshold]);
    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch low stock items', error: err.message });
  }
});

module.exports = router; 