const pool = require('../config/db');

// Get all purchase orders with supplier and warehouse info
const getPurchaseOrders = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
        po.*,
        s.name as supplier_name,
        w.name as warehouse_name,
        w.code as warehouse_code
       FROM purchase_orders po
       LEFT JOIN suppliers s ON po.supplier_id = s.id
       LEFT JOIN warehouses w ON po.warehouse_id = w.id
       ORDER BY po.order_date DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching purchase orders:', error);
        res.status(500).json({ message: 'Server error while fetching purchase orders' });
    }
};

// Get purchase order by ID with items
const getPurchaseOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        // Get PO details
        const poResult = await pool.query(
            `SELECT 
        po.*,
        s.name as supplier_name,
        s.email as supplier_email,
        s.phone as supplier_phone,
        w.name as warehouse_name,
        w.code as warehouse_code,
        w.location as warehouse_location
       FROM purchase_orders po
       LEFT JOIN suppliers s ON po.supplier_id = s.id
       LEFT JOIN warehouses w ON po.warehouse_id = w.id
       WHERE po.id = $1`,
            [id]
        );

        if (poResult.rows.length === 0) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }

        // Get PO items
        const itemsResult = await pool.query(
            `SELECT * FROM purchase_order_items WHERE po_id = $1`,
            [id]
        );

        const purchaseOrder = {
            ...poResult.rows[0],
            items: itemsResult.rows
        };

        res.json(purchaseOrder);
    } catch (error) {
        console.error('Error fetching purchase order:', error);
        res.status(500).json({ message: 'Server error while fetching purchase order' });
    }
};

// Create new purchase order
const createPurchaseOrder = async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const { po_number, supplier_id, warehouse_id, order_date, expected_delivery, status, notes, items } = req.body;

        // Calculate totals from items
        const total_items = items.reduce((sum, item) => sum + item.quantity, 0);
        const total_amount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

        // Create PO
        const poResult = await client.query(
            `INSERT INTO purchase_orders (po_number, supplier_id, warehouse_id, order_date, expected_delivery, status, total_items, total_amount, notes, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
            [po_number, supplier_id, warehouse_id, order_date, expected_delivery, status || 'pending', total_items, total_amount, notes, req.user?.id || null]
        );

        const po_id = poResult.rows[0].id;

        // Create PO items
        for (const item of items) {
            await client.query(
                `INSERT INTO purchase_order_items (po_id, sku, product_name, quantity, unit_price) 
         VALUES ($1, $2, $3, $4, $5)`,
                [po_id, item.sku, item.product_name, item.quantity, item.unit_price]
            );
        }

        await client.query('COMMIT');
        res.status(201).json(poResult.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating purchase order:', error);
        res.status(500).json({ message: 'Server error while creating purchase order' });
    } finally {
        client.release();
    }
};

// Update purchase order status
const updatePurchaseOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, actual_delivery, notes } = req.body;

        const result = await pool.query(
            `UPDATE purchase_orders 
       SET status = $1, actual_delivery = $2, notes = $3, last_updated = CURRENT_TIMESTAMP
       WHERE id = $4 
       RETURNING *`,
            [status, actual_delivery, notes, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating purchase order:', error);
        res.status(500).json({ message: 'Server error while updating purchase order' });
    }
};

// Delete purchase order
const deletePurchaseOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM purchase_orders WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }

        res.json({ message: 'Purchase order deleted successfully' });
    } catch (error) {
        console.error('Error deleting purchase order:', error);
        res.status(500).json({ message: 'Server error while deleting purchase order' });
    }
};

module.exports = {
    getPurchaseOrders,
    getPurchaseOrderById,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder
};
