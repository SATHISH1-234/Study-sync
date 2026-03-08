const express = require('express');
const router = express.Router();
const { updateProgress, getProgress, getAllStudentProgress, getMentorOverview } = require('../controllers/progressController');
const { protect, authorize } = require('../utils/authMiddleware');

router.post('/update', protect, updateProgress);
router.get('/student/all', protect, getAllStudentProgress);
router.get('/mentor/overview', protect, authorize('mentor', 'admin'), getMentorOverview);
router.get('/:courseId', protect, getProgress);

module.exports = router;
