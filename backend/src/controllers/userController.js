const pool = require('../config/db');

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await pool.query(
            'SELECT id, username, email, role, avatar_url, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(users.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update user role (Admin only)
exports.updateUserRole = async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    // Valid roles
    const validRoles = ['admin', 'store_manager', 'inventory_analyst', 'staff'];

    if (!validRoles.includes(role)) {
        return res.status(400).json({ msg: 'Invalid role' });
    }

    try {
        const user = await pool.query(
            'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, email, role, avatar_url',
            [role, userId]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json({ msg: 'User role updated successfully', user: user.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
    const { userId } = req.params;

    try {
        // Prevent admin from deleting themselves
        if (parseInt(userId) === req.user.id) {
            return res.status(400).json({ msg: 'You cannot delete your own account' });
        }

        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json({ msg: 'User deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Invite user (Admin only) - sends invitation link
exports.inviteUser = async (req, res) => {
    const { email, role } = req.body;

    const validRoles = ['admin', 'store_manager', 'inventory_analyst', 'staff'];

    if (!validRoles.includes(role)) {
        return res.status(400).json({ msg: 'Invalid role' });
    }

    try {
        // Check if user already exists
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ msg: 'User with this email already exists' });
        }

        // In a real application, you would:
        // 1. Create an invitation token
        // 2. Store it in a database table with expiration
        // 3. Send an email with the invitation link
        // For now, we'll just return a success message

        res.json({
            msg: 'Invitation sent successfully',
            email,
            role,
            // In production, include invitation link
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await pool.query(
            'SELECT id, username, email, role, avatar_url, created_at FROM users WHERE id = $1',
            [userId]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
