const pool = require('../config/db');

// Get all warehouses
const getWarehouses = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM warehouses ORDER BY name ASC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching warehouses:', error);
        res.status(500).json({ message: 'Server error while fetching warehouses' });
    }
};

// Get warehouse by ID
const getWarehouseById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM warehouses WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Warehouse not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching warehouse:', error);
        res.status(500).json({ message: 'Server error while fetching warehouse' });
    }
};

// Create new warehouse
const createWarehouse = async (req, res) => {
    try {
        const { name, code, location, address, city, country, capacity, current_utilization, manager_name, contact_email, contact_phone, status } = req.body;

        const result = await pool.query(
            `INSERT INTO warehouses (name, code, location, address, city, country, capacity, current_utilization, manager_name, contact_email, contact_phone, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING *`,
            [name, code, location, address, city, country, capacity, current_utilization || 0, manager_name, contact_email, contact_phone, status || 'operational']
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating warehouse:', error);
        res.status(500).json({ message: 'Server error while creating warehouse' });
    }
};

// Update warehouse
const updateWarehouse = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, location, address, city, country, capacity, current_utilization, manager_name, contact_email, contact_phone, status } = req.body;

        const result = await pool.query(
            `UPDATE warehouses 
       SET name = $1, code = $2, location = $3, address = $4, city = $5, country = $6,
           capacity = $7, current_utilization = $8, manager_name = $9, contact_email = $10,
           contact_phone = $11, status = $12, last_updated = CURRENT_TIMESTAMP
       WHERE id = $13 
       RETURNING *`,
            [name, code, location, address, city, country, capacity, current_utilization, manager_name, contact_email, contact_phone, status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Warehouse not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating warehouse:', error);
        res.status(500).json({ message: 'Server error while updating warehouse' });
    }
};

// Delete warehouse
const deleteWarehouse = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM warehouses WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Warehouse not found' });
        }

        res.json({ message: 'Warehouse deleted successfully' });
    } catch (error) {
        console.error('Error deleting warehouse:', error);
        res.status(500).json({ message: 'Server error while deleting warehouse' });
    }
};

module.exports = {
    getWarehouses,
    getWarehouseById,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse
};
