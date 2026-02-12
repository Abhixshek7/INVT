const express = require('express');
const router = express.Router();
const {
    getShipments,
    getShipmentById,
    createShipment,
    updateShipment,
    deleteShipment
} = require('../controllers/shipmentsController');
const auth = require('../middleware/authMiddleware');

// All routes require authentication
router.use(auth);

// GET all shipments
router.get('/', getShipments);

// GET shipment by ID
router.get('/:id', getShipmentById);

// POST create new shipment (admin/manager only)
router.post('/', createShipment);

// PUT update shipment (admin/manager only)
router.put('/:id', updateShipment);

// DELETE shipment (admin only)
router.delete('/:id', deleteShipment);

module.exports = router;
