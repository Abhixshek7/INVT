const express = require('express');
const router = express.Router();
const {
    getPurchaseOrders,
    getPurchaseOrderById,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder
} = require('../controllers/purchaseOrdersController');
const auth = require('../middleware/authMiddleware');

// All routes require authentication
router.use(auth);

// GET all purchase orders
router.get('/', getPurchaseOrders);

// GET purchase order by ID
router.get('/:id', getPurchaseOrderById);

// POST create new purchase order (admin/manager only)
router.post('/', createPurchaseOrder);

// PUT update purchase order (admin/manager only)
router.put('/:id', updatePurchaseOrder);

// DELETE purchase order (admin only)
router.delete('/:id', deletePurchaseOrder);

module.exports = router;
