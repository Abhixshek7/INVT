const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const pool = require('./config/db');
require('./config/passport'); // Init passport config

const app = express();
const port = process.env.PORT || 5000;

// Middleware

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
            connectSrc: ["'self'", "http://localhost:5173", "https://accounts.google.com"],
            imgSrc: ["'self'", "data:", "https://*.googleusercontent.com"],
            frameSrc: ["'self'", "https://accounts.google.com"],
        },
    },
}));

// CORS Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Basic route to test connection
app.get('/', (req, res) => {
    res.send('Inventory Management System API is running');
});

// Database Connection Test
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ message: 'Database connected successfully', time: result.rows[0].now });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
