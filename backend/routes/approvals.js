const express = require('express');
const pool = require('../config/mysql');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');

// GET /api/approvals - list all approvals
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const [approvals] = await pool.execute('SELECT * FROM approvals ORDER BY created_at DESC');
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

    const [result] = await pool.execute(
      'INSERT INTO approvals (type, data, notes, user_id, status) VALUES (?, ?, ?, ?, ?)',
      [type, JSON.stringify(data), notes || '', req.user.id, 'pending']
    );

    const [approvalRows] = await pool.execute('SELECT * FROM approvals WHERE id = ?', [result.insertId]);
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

    const [result] = await pool.execute(
      'UPDATE approvals SET status=?, admin_notes=?, updated_at=NOW() WHERE id=?',
      [status, admin_notes || '', id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Approval not found' });

    const [approvalRows] = await pool.execute('SELECT * FROM approvals WHERE id = ?', [id]);
    res.json({ approval: approvalRows[0], message: 'Approval updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update approval', error: err.message });
  }
});

// DELETE /api/approvals/:id - delete an approval
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute('DELETE FROM approvals WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Approval not found' });
    res.json({ message: 'Approval deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete approval', error: err.message });
  }
});

module.exports = router; 