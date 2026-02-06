const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT Helper
const generateToken = (user) => {
    const payload = {
        user: {
            id: user.id,
            role: user.role
        }
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// Register User
exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if user exists
        let userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
            [username, email, hashedPassword]
        );

        // Return token
        const token = generateToken(newUser.rows[0]);
        res.json({ token, user: { id: newUser.rows[0].id, username: newUser.rows[0].username, role: newUser.rows[0].role } });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Login User
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check user
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const user = userResult.rows[0];

        // Check if user has a role assigned
        if (!user.role || user.role === 'user') {
            return res.status(403).json({
                msg: 'Access denied. No role has been assigned to your account. Please contact an administrator.'
            });
        }

        // Check password (only if they have one - google users might not)
        if (!user.password) {
            return res.status(400).json({ msg: 'Please log in with Google' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Return token
        const token = generateToken(user);
        res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role, avatar_url: user.avatar_url } });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Google Callback Handler
exports.googleCallback = (req, res) => {
    // req.user is set by passport
    const user = req.user;

    // Check if user has a role assigned
    if (!user.role || user.role === 'user') {
        return res.redirect(`${process.env.FRONTEND_URL}/not-authorized`);
    }

    const token = generateToken(user);

    // Redirect to frontend with token
    // For this demo, we'll implement a query param redirect
    // The frontend should parse this token and save it
    res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);
};

// Get Current User (Protected Route Example)
exports.getMe = async (req, res) => {
    try {
        const user = await pool.query('SELECT id, username, email, role, avatar_url FROM users WHERE id = $1', [req.user.id]);
        res.json(user.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
