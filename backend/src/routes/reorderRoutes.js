const express = require('express');
const router = express.Router();
const {
    getReorderSuggestions,
    getSuggestedSuppliers
} = require('../controllers/reorderController');
const auth = require('../middleware/authMiddleware');

// All routes require authentication
router.use(auth);

// GET reorder suggestions
router.get('/suggestions', getReorderSuggestions);

// GET suggested suppliers for reordering
router.get('/suppliers', getSuggestedSuppliers);

module.exports = router;
