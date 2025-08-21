const express = require('express');
const pool = require('../config/db');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');

// GET /api/reports/daily-sales - get daily sales summary
router.get('/daily-sales', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM daily_sales_summary_view ORDER BY sale_date DESC LIMIT 30');
    res.json({ dailySales: rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch daily sales report', error: err.message });
  }
});

// GET /api/reports/top-selling - get top selling items
router.get('/top-selling', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM top_selling_items ORDER BY total_sold DESC LIMIT 20');
    res.json({ topSellingItems: rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch top selling items report', error: err.message });
  }
});

// GET /api/reports/low-stock - get low stock items
router.get('/low-stock', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM low_stock_items');
    res.json({ lowStockItems: rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch low stock report', error: err.message });
  }
});

module.exports = router; 