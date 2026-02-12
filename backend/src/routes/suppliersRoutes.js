const express = require('express');
const router = express.Router();
const {
    getSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
} = require('../controllers/suppliersController');
const auth = require('../middleware/authMiddleware');

// All routes require authentication
router.use(auth);

// GET all suppliers
router.get('/', getSuppliers);

// GET supplier by ID
router.get('/:id', getSupplierById);

// POST create new supplier (admin/manager only)
router.post('/', createSupplier);

// PUT update supplier (admin/manager only)
router.put('/:id', updateSupplier);

// DELETE supplier (admin only)
router.delete('/:id', deleteSupplier);

module.exports = router;
