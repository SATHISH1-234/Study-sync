const express = require('express');
const router = express.Router();
const { getMentorRequests, updateRequestStatus, getStudentRequestStatus } = require('../controllers/enrollmentController');
const { protect, authorize } = require('../utils/authMiddleware');

router.get('/status/:courseId', protect, getStudentRequestStatus);
router.get('/mentor', protect, authorize('mentor', 'admin'), getMentorRequests);
router.put('/:id', protect, authorize('mentor', 'admin'), updateRequestStatus);

module.exports = router;
