const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { protect, authorize } = require('../utils/authMiddleware');
const upload = require('../utils/upload');
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateProfileImage,
    getAllUsers,
    deleteUser
} = require('../controllers/authController');

router.post(
    '/register',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
        check('role', 'Role is required').isIn(['student', 'mentor', 'admin'])
    ],
    registerUser
);

router.post(
    '/login',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ],
    loginUser
);

router.get('/profile', protect, getUserProfile);
router.put('/profile/image', protect, upload.single('image'), updateProfileImage);

// Admin routes
router.get('/users', protect, authorize('admin'), getAllUsers);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
