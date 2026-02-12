const pool = require('../config/db');

// Get all suppliers
const getSuppliers = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM suppliers ORDER BY name ASC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        res.status(500).json({ message: 'Server error while fetching suppliers' });
    }
};

// Get supplier by ID
const getSupplierById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM suppliers WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching supplier:', error);
        res.status(500).json({ message: 'Server error while fetching supplier' });
    }
};

// Create new supplier
const createSupplier = async (req, res) => {
    try {
        const { name, contact_person, email, phone, address, city, country, rating, status } = req.body;

        const result = await pool.query(
            `INSERT INTO suppliers (name, contact_person, email, phone, address, city, country, rating, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
            [name, contact_person, email, phone, address, city, country, rating, status || 'active']
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating supplier:', error);
        res.status(500).json({ message: 'Server error while creating supplier' });
    }
};

// Update supplier
const updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, contact_person, email, phone, address, city, country, rating, status } = req.body;

        const result = await pool.query(
            `UPDATE suppliers 
       SET name = $1, contact_person = $2, email = $3, phone = $4, 
           address = $5, city = $6, country = $7, rating = $8, status = $9,
           last_updated = CURRENT_TIMESTAMP
       WHERE id = $10 
       RETURNING *`,
            [name, contact_person, email, phone, address, city, country, rating, status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating supplier:', error);
        res.status(500).json({ message: 'Server error while updating supplier' });
    }
};

// Delete supplier
const deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM suppliers WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        res.json({ message: 'Supplier deleted successfully' });
    } catch (error) {
        console.error('Error deleting supplier:', error);
        res.status(500).json({ message: 'Server error while deleting supplier' });
    }
};

module.exports = {
    getSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
};
