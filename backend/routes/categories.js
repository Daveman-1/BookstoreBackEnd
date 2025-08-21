const express = require('express');
const pool = require('../config/db');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');

// GET /api/categories - list all active categories
router.get('/', async (req, res) => {
  try {
    const { rows: categories } = await pool.query('SELECT * FROM categories WHERE is_active = TRUE ORDER BY name ASC');
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch categories', error: err.message });
  }
});

// POST /api/categories - add a new category (admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });
    
    const result = await pool.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id',
      [name, description || '']
    );
    const { rows: catRows } = await pool.query('SELECT * FROM categories WHERE id = $1', [result.rows[0].id]);
    res.status(201).json({ category: catRows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add category', error: err.message });
  }
});

// PUT /api/categories/:id - edit a category (admin only)
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;
    const result = await pool.query(
      'UPDATE categories SET name=$1, description=$2, is_active=$3 WHERE id=$4',
      [name, description || '', is_active == null ? true : is_active, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Category not found' });
    const { rows: catRows } = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
    res.json({ category: catRows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update category', error: err.message });
  }
});

// DELETE /api/categories/:id - delete a category (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete category', error: err.message });
  }
});

module.exports = router; 