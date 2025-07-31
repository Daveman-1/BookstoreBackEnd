const express = require('express');
const pool = require('../config/db');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');

// GET /api/approvals - list all approvals (admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const [approvals] = await pool.query('SELECT * FROM approvals ORDER BY created_at DESC');
    res.json({ approvals });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch approvals', error: err.message });
  }
});

// POST /api/approvals - submit a new approval (staff)
router.post('/', authenticateToken, authorizeRoles('staff'), async (req, res) => {
  try {
    const { type, title, description, changes } = req.body;
    const submitted_by = req.user.id;
    if (!type || !title || !changes) return res.status(400).json({ message: 'Missing required fields' });
    const [result] = await pool.query(
      'INSERT INTO approvals (type, title, description, changes, submitted_by) VALUES (?, ?, ?, ?, ?)',
      [type, title, description || '', JSON.stringify(changes), submitted_by]
    );
    const [approvalRows] = await pool.query('SELECT * FROM approvals WHERE id = ?', [result.insertId]);
    res.status(201).json({ approval: approvalRows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit approval', error: err.message });
  }
});

// PUT /api/approvals/:id/approve - approve an approval (admin)
router.put('/:id/approve', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const approved_by = req.user.id;
    const [result] = await pool.query(
      'UPDATE approvals SET status="approved", approved_by=?, approved_at=NOW() WHERE id=?',
      [approved_by, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Approval not found' });
    const [approvalRows] = await pool.query('SELECT * FROM approvals WHERE id = ?', [id]);
    res.json({ approval: approvalRows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve', error: err.message });
  }
});

// PUT /api/approvals/:id/reject - reject an approval (admin)
router.put('/:id/reject', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;
    const approved_by = req.user.id;
    const [result] = await pool.query(
      'UPDATE approvals SET status="rejected", approved_by=?, approved_at=NOW(), rejection_reason=? WHERE id=?',
      [approved_by, rejection_reason || '', id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Approval not found' });
    const [approvalRows] = await pool.query('SELECT * FROM approvals WHERE id = ?', [id]);
    res.json({ approval: approvalRows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reject', error: err.message });
  }
});

module.exports = router; 