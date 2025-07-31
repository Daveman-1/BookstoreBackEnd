const express = require('express');
const authRoutes = require('./auth');
const itemsRoutes = require('./items');
const salesRoutes = require('./sales');
const categoriesRoutes = require('./categories');
const approvalsRoutes = require('./approvals');
const usersRoutes = require('./users');
const reportsRoutes = require('./reports');
const settingsRoutes = require('./settings');
const storeDetailsRoutes = require('./storeDetails');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/items', itemsRoutes);
router.use('/sales', salesRoutes);
router.use('/categories', categoriesRoutes);
router.use('/approvals', approvalsRoutes);
router.use('/users', usersRoutes);
router.use('/reports', reportsRoutes);
router.use('/settings', settingsRoutes);
router.use('/store-details', storeDetailsRoutes);
// Add more routes here: users, items, sales, etc.

module.exports = router; 