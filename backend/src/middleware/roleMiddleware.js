// Role-based access control middleware
const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ msg: 'Not authenticated' });
        }

        if (!req.user.role) {
            return res.status(403).json({ msg: 'No role assigned. Please contact an administrator.' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ msg: 'Access denied. Insufficient permissions.' });
        }

        next();
    };
};

module.exports = checkRole;
