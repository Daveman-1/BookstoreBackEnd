const express = require('express');
const pool = require('../config/db');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');

// GET /api/reports/daily-sales - daily sales summary
router.get('/daily-sales', authenticateToken, authorizeRoles('admin', 'staff', 'manager'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM daily_sales_summary_view ORDER BY sale_date DESC LIMIT 30');
    res.json({ dailySales: rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch daily sales summary', error: err.message });
  }
});

// GET /api/reports/top-selling - top selling items
router.get('/top-selling', authenticateToken, authorizeRoles('admin', 'staff', 'manager'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM top_selling_items ORDER BY total_sold DESC LIMIT 20');
    res.json({ topSelling: rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch top selling items', error: err.message });
  }
});

// GET /api/reports/low-stock - low stock items
router.get('/low-stock', authenticateToken, async (req, res) => {
  console.log('DEBUG /low-stock req.user:', req.user);
  try {
    const [rows] = await pool.query('SELECT * FROM low_stock_items');
    res.json({ lowStock: rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch low stock items', error: err.message });
  }
});

module.exports = router; 