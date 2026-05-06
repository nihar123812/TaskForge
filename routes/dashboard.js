const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// @route   GET /api/dashboard/stats
router.get('/stats', dashboardController.getStats);

module.exports = router;
