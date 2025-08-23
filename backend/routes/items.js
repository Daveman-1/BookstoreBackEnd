const express = require('express');
const pool = require('../config/mysql');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');

// GET /api/items - list all items
router.get('/', async (req, res) => {
  try {
    const [items] = await pool.execute(`
      SELECT i.*, c.name as category_name 
      FROM items i 
      LEFT JOIN categories c ON i.category_id = c.id 
      WHERE i.is_active = TRUE 
      ORDER BY i.name ASC
    `);
    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch items', error: err.message });
  }
});

// POST /api/items - add a new item (admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { name, description, price, cost, stock, category, sku, image_url } = req.body;
    if (!name || !price || !cost || !stock || !category) return res.status(400).json({ message: 'Missing required fields' });

    // Get or create category
    let [catRows] = await pool.execute('SELECT id FROM categories WHERE name = ?', [category]);
    let categoryId;
    
    if (catRows.length === 0) {
      const [catResult] = await pool.execute('INSERT INTO categories (name) VALUES (?)', [category]);
      categoryId = catResult.insertId;
    } else {
      categoryId = catRows[0].id;
    }

    const [result] = await pool.execute(`
      INSERT INTO items (name, description, price, cost, stock, category_id, sku, image_url) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, description || '', price, cost, stock, categoryId, sku || '', image_url || '']);

    const [itemRows] = await pool.execute(`
      SELECT i.*, c.name as category_name 
      FROM items i 
      LEFT JOIN categories c ON i.category_id = c.id 
      WHERE i.id = ?
    `, [result.insertId]);

    res.status(201).json({ item: itemRows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add item', error: err.message });
  }
});

// PUT /api/items/:id - edit an item (admin only)
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, cost, stock, category, sku, image_url, is_active } = req.body;
    if (!name || !price || !cost || !stock || !category) return res.status(400).json({ message: 'Missing required fields' });

    // Get or create category
    let [catRows] = await pool.execute('SELECT id FROM categories WHERE name = ?', [category]);
    let categoryId;
    
    if (catRows.length === 0) {
      const [catResult] = await pool.execute('INSERT INTO categories (name) VALUES (?)', [category]);
      categoryId = catResult.insertId;
    } else {
      categoryId = catRows[0].id;
    }

    const [result] = await pool.execute(`
      UPDATE items SET name=?, description=?, price=?, cost=?, stock=?, category_id=?, sku=?, image_url=?, is_active=? 
      WHERE id=?
    `, [name, description || '', price, cost, stock, categoryId, sku || '', image_url || '', is_active == null ? true : is_active, id]);

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Item not found' });

    const [itemRows] = await pool.execute(`
      SELECT i.*, c.name as category_name 
      FROM items i 
      LEFT JOIN categories c ON i.category_id = c.id 
      WHERE i.id = ?
    `, [id]);

    res.json({ item: itemRows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update item', error: err.message });
  }
});

// DELETE /api/items/:id - delete an item (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute('DELETE FROM items WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete item', error: err.message });
  }
});

// GET /api/items/search - search items
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Search query is required' });

    const [items] = await pool.execute(`
      SELECT i.*, c.name as category_name 
      FROM items i 
      LEFT JOIN categories c ON i.category_id = c.id 
      WHERE i.is_active = TRUE 
      AND (i.name LIKE ? OR i.description LIKE ? OR i.sku LIKE ? OR c.name LIKE ?)
      ORDER BY i.name ASC
    `, [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`]);

    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: 'Search failed', error: err.message });
  }
});

module.exports = router; 