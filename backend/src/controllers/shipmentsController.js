const pool = require('../config/db');

// Get all shipments
const getShipments = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
        s.*,
        po.po_number,
        ow.name as origin_warehouse_name,
        ow.code as origin_warehouse_code,
        dw.name as destination_warehouse_name,
        dw.code as destination_warehouse_code
       FROM shipments s
       LEFT JOIN purchase_orders po ON s.po_id = po.id
       LEFT JOIN warehouses ow ON s.origin_warehouse_id = ow.id
       LEFT JOIN warehouses dw ON s.destination_warehouse_id = dw.id
       ORDER BY s.ship_date DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching shipments:', error);
        res.status(500).json({ message: 'Server error while fetching shipments' });
    }
};

// Get shipment by ID
const getShipmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT 
        s.*,
        po.po_number,
        po.supplier_id,
        sp.name as supplier_name,
        ow.name as origin_warehouse_name,
        ow.code as origin_warehouse_code,
        ow.location as origin_location,
        dw.name as destination_warehouse_name,
        dw.code as destination_warehouse_code,
        dw.location as destination_location
       FROM shipments s
       LEFT JOIN purchase_orders po ON s.po_id = po.id
       LEFT JOIN suppliers sp ON po.supplier_id = sp.id
       LEFT JOIN warehouses ow ON s.origin_warehouse_id = ow.id
       LEFT JOIN warehouses dw ON s.destination_warehouse_id = dw.id
       WHERE s.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Shipment not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching shipment:', error);
        res.status(500).json({ message: 'Server error while fetching shipment' });
    }
};

// Create new shipment
const createShipment = async (req, res) => {
    try {
        const {
            tracking_number,
            po_id,
            origin_warehouse_id,
            destination_warehouse_id,
            carrier,
            shipping_method,
            status,
            ship_date,
            expected_delivery,
            total_weight,
            total_cost,
            notes
        } = req.body;

        const result = await pool.query(
            `INSERT INTO shipments (tracking_number, po_id, origin_warehouse_id, destination_warehouse_id, carrier, shipping_method, status, ship_date, expected_delivery, total_weight, total_cost, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING *`,
            [tracking_number, po_id, origin_warehouse_id, destination_warehouse_id, carrier, shipping_method, status || 'pending', ship_date, expected_delivery, total_weight, total_cost, notes]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating shipment:', error);
        res.status(500).json({ message: 'Server error while creating shipment' });
    }
};

// Update shipment
const updateShipment = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, actual_delivery, notes } = req.body;

        const result = await pool.query(
            `UPDATE shipments 
       SET status = $1, actual_delivery = $2, notes = $3, last_updated = CURRENT_TIMESTAMP
       WHERE id = $4 
       RETURNING *`,
            [status, actual_delivery, notes, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Shipment not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating shipment:', error);
        res.status(500).json({ message: 'Server error while updating shipment' });
    }
};

// Delete shipment
const deleteShipment = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM shipments WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Shipment not found' });
        }

        res.json({ message: 'Shipment deleted successfully' });
    } catch (error) {
        console.error('Error deleting shipment:', error);
        res.status(500).json({ message: 'Server error while deleting shipment' });
    }
};

module.exports = {
    getShipments,
    getShipmentById,
    createShipment,
    updateShipment,
    deleteShipment
};
