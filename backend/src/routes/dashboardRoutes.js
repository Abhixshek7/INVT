const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes protected
// router.use(authMiddleware); // Uncomment to enforce auth

router.get('/stats', dashboardController.getDashboardStats);
router.get('/top-products', dashboardController.getTopMovingProducts);
router.get('/sales-trend', dashboardController.getSalesTrend);
router.get('/recent-activity', dashboardController.getRecentActivity);
router.get('/low-stock', dashboardController.getLowStockItems);
router.get('/analytics', dashboardController.getAnalytics);
router.get('/notifications', dashboardController.getNotifications);

module.exports = router;
