const express = require('express');
const {
    createReminder,
    getUserReminders,
    updateReminderStatus,
    deleteReminder
} = require('../controllers/reminderController');

const router = express.Router();

const { protect } = require('../utils/authMiddleware');

router.post('/', protect, createReminder);
router.get('/:userId', protect, getUserReminders);
router.put('/:id', protect, updateReminderStatus);
router.delete('/:id', protect, deleteReminder);

module.exports = router;
