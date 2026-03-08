const express = require('express');
const {
    createGroup,
    getMentorGroups,
    getStudentGroups
} = require('../controllers/groupController');

const router = express.Router();

const { protect } = require('../utils/authMiddleware');

router.post('/', protect, createGroup);
router.get('/mentor/:mentorId', protect, getMentorGroups);
router.get('/student/:studentId', protect, getStudentGroups);

module.exports = router;
