const express = require('express');
const pool = require('../config/db');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');

// GET /api/approvals - list all approvals
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { rows: approvals } = await pool.query('SELECT * FROM approvals ORDER BY created_at DESC');
    res.json({ approvals });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch approvals', error: err.message });
  }
});

// POST /api/approvals - create a new approval
router.post('/', authenticateToken, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const { type, data, notes } = req.body;
    if (!type || !data) return res.status(400).json({ message: 'Type and data are required' });

    const result = await pool.query(
      'INSERT INTO approvals (type, data, notes, user_id, status) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [type, JSON.stringify(data), notes || '', req.user.id, 'pending']
    );

    const { rows: approvalRows } = await pool.query('SELECT * FROM approvals WHERE id = $1', [result.rows[0].id]);
    res.status(201).json({ approval: approvalRows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create approval', error: err.message });
  }
});

// PUT /api/approvals/:id - update approval status
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;
    if (!status) return res.status(400).json({ message: 'Status is required' });

    const result = await pool.query(
      'UPDATE approvals SET status=$1, admin_notes=$2, updated_at=NOW() WHERE id=$3',
      [status, admin_notes || '', id]
    );

    if (result.rowCount === 0) return res.status(404).json({ message: 'Approval not found' });

    const { rows: approvalRows } = await pool.query('SELECT * FROM approvals WHERE id = $1', [id]);
    res.json({ approval: approvalRows[0], message: 'Approval updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update approval', error: err.message });
  }
});

// DELETE /api/approvals/:id - delete an approval
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM approvals WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Approval not found' });
    res.json({ message: 'Approval deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete approval', error: err.message });
  }
});

module.exports = router; 