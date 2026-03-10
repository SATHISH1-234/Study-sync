const express = require('express');
const {
    createGroup,
    getMentorGroups,
    getStudentGroups,
    getAllGroups,
    deleteGroup
} = require('../controllers/groupController');

const router = express.Router();

const { protect, authorize } = require('../utils/authMiddleware');

router.post('/', protect, createGroup);
router.get('/', protect, authorize('admin'), getAllGroups);
router.delete('/:id', protect, authorize('admin'), deleteGroup);
router.get('/mentor/:mentorId', protect, getMentorGroups);
router.get('/student/:studentId', protect, getStudentGroups);

module.exports = router;
