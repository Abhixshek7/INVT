const pool = require('../config/db');

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
    try {
        // Only return users with assigned roles (not 'user' or NULL)
        const users = await pool.query(
            `SELECT id, username, email, role, avatar_url, created_at 
             FROM users 
             WHERE role IS NOT NULL 
             AND role != 'user' 
             ORDER BY created_at DESC`
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

// Create/Invite user (Admin only) - Creates user with assigned role
exports.inviteUser = async (req, res) => {
    const { email, role, username } = req.body;

    const validRoles = ['admin', 'store_manager', 'inventory_analyst', 'staff'];

    if (!validRoles.includes(role)) {
        return res.status(400).json({ msg: 'Invalid role' });
    }

    if (!email) {
        return res.status(400).json({ msg: 'Email is required' });
    }

    try {
        // Check if user already exists
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ msg: 'User with this email already exists' });
        }

        // Create the user with the assigned role
        // Password is null because they will login via Google OAuth
        const newUser = await pool.query(
            'INSERT INTO users (username, email, role, password) VALUES ($1, $2, $3, NULL) RETURNING id, username, email, role, created_at',
            [username || email.split('@')[0], email, role]
        );

        res.status(201).json({
            msg: 'User created successfully. They can now log in with Google.',
            user: newUser.rows[0]
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

// Update own profile
exports.updateProfile = async (req, res) => {
    const { firstName, lastName, phone, settings } = req.body;
    const userId = req.user.id; // From authMiddleware

    try {
        // Build update query dynamically or just update all fields
        // Since we are updating specific profile fields, we can do a direct update

        // Note: Using COALESCE to keep existing values if not provided, or handles client sending full object
        // Actually, if client sends null/undefined, we might want to keep it or set it.
        // Let's assume the client sends the data they want to save.

        // We need to fetch current user first to merge settings if we want partial updates,
        // but typically a save on settings page sends the whole state.
        // Let's assume we receive the full settings object or at least the parts we want to update.
        // For simplicity, we update what is provided.

        // However, raw SQL 'COALESCE($1, first_name)' might be better if fields are optional.

        const updateQuery = `
            UPDATE users 
            SET 
                first_name = COALESCE($1, first_name),
                last_name = COALESCE($2, last_name),
                phone = COALESCE($3, phone),
                settings = COALESCE($4, settings)
            WHERE id = $5
            RETURNING id, username, email, role, first_name, last_name, phone, settings, avatar_url
        `;

        const result = await pool.query(updateQuery, [
            firstName,
            lastName,
            phone,
            settings, // Ensure this is a JSON object or stringified if library doesn't handle it (pg handles objects usually)
            userId
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json({ msg: 'Profile updated successfully', user: result.rows[0] });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
