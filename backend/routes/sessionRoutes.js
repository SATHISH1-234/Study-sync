const express = require('express');
const router = express.Router();
const { recordSession, getStudentSessions } = require('../controllers/sessionController');
const { protect } = require('../utils/authMiddleware');

router.post('/', protect, recordSession);
router.get('/student', protect, getStudentSessions);

module.exports = router;
