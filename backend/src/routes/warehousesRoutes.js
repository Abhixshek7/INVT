const express = require('express');
const router = express.Router();
const {
    getWarehouses,
    getWarehouseById,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse
} = require('../controllers/warehousesController');
const auth = require('../middleware/authMiddleware');

// All routes require authentication
router.use(auth);

// GET all warehouses
router.get('/', getWarehouses);

// GET warehouse by ID
router.get('/:id', getWarehouseById);

// POST create new warehouse (admin/manager only)
router.post('/', createWarehouse);

// PUT update warehouse (admin/manager only)
router.put('/:id', updateWarehouse);

// DELETE warehouse (admin only)
router.delete('/:id', deleteWarehouse);

module.exports = router;
