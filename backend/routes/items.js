const express = require('express');
const pool = require('../config/db');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');

// GET /api/items - list all items
router.get('/', async (req, res) => {
  try {
    const { rows: items } = await pool.query(`
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
    let { rows: catRows } = await pool.query('SELECT id FROM categories WHERE name = $1', [category]);
    let categoryId;
    
    if (catRows.length === 0) {
      const catResult = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING id', [category]);
      categoryId = catResult.rows[0].id;
    } else {
      categoryId = catRows[0].id;
    }

    const result = await pool.query(`
      INSERT INTO items (name, description, price, cost, stock, category_id, sku, image_url) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id
    `, [name, description || '', price, cost, stock, categoryId, sku || '', image_url || '']);

    const { rows: itemRows } = await pool.query(`
      SELECT i.*, c.name as category_name 
      FROM items i 
      LEFT JOIN categories c ON i.category_id = c.id 
      WHERE i.id = $1
    `, [result.rows[0].id]);

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
    let { rows: catRows } = await pool.query('SELECT id FROM categories WHERE name = $1', [category]);
    let categoryId;
    
    if (catRows.length === 0) {
      const catResult = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING id', [category]);
      categoryId = catResult.rows[0].id;
    } else {
      categoryId = catRows[0].id;
    }

    const result = await pool.query(`
      UPDATE items SET name=$1, description=$2, price=$3, cost=$4, stock=$5, category_id=$6, sku=$7, image_url=$8, is_active=$9 
      WHERE id=$10
    `, [name, description || '', price, cost, stock, categoryId, sku || '', image_url || '', is_active == null ? true : is_active, id]);

    if (result.rowCount === 0) return res.status(404).json({ message: 'Item not found' });

    const { rows: itemRows } = await pool.query(`
      SELECT i.*, c.name as category_name 
      FROM items i 
      LEFT JOIN categories c ON i.category_id = c.id 
      WHERE i.id = $1
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
    const result = await pool.query('DELETE FROM items WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Item not found' });
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

    const { rows: items } = await pool.query(`
      SELECT i.*, c.name as category_name 
      FROM items i 
      LEFT JOIN categories c ON i.category_id = c.id 
      WHERE i.is_active = TRUE 
      AND (i.name ILIKE $1 OR i.description ILIKE $1 OR i.sku ILIKE $1 OR c.name ILIKE $1)
      ORDER BY i.name ASC
    `, [`%${q}%`]);

    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: 'Search failed', error: err.message });
  }
});

module.exports = router; 