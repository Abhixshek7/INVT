const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// @route   PUT api/users/profile
// @desc    Update own profile
// @access  Private
router.put('/profile', authMiddleware, userController.updateProfile);

// @route   GET api/users
// @desc    Get all users
// @access  Admin only
router.get('/', authMiddleware, checkRole('admin'), userController.getAllUsers);

// @route   GET api/users/:userId
// @desc    Get user by ID
// @access  Admin only
router.get('/:userId', authMiddleware, checkRole('admin'), userController.getUserById);

// @route   PUT api/users/:userId/role
// @desc    Update user role
// @access  Admin only
router.put('/:userId/role', authMiddleware, checkRole('admin'), userController.updateUserRole);

// @route   DELETE api/users/:userId
// @desc    Delete user
// @access  Admin only
router.delete('/:userId', authMiddleware, checkRole('admin'), userController.deleteUser);

// @route   POST api/users/invite
// @desc    Invite new user
// @access  Admin only
router.post('/invite', authMiddleware, checkRole('admin'), userController.inviteUser);

module.exports = router;
