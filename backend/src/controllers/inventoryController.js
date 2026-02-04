const pool = require('../config/db');

exports.getAllItems = async (req, res) => {
    try {
        const allItems = await pool.query('SELECT * FROM inventory'); // Assuming table name is 'inventory'
        res.json(allItems.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
