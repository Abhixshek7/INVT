const express = require('express');
const router = express.Router();
const forecastController = require('../controllers/forecastController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected routes - require authentication
router.get('/', authMiddleware, forecastController.getForecast);
router.post('/train', authMiddleware, forecastController.trainModel);

module.exports = router;
