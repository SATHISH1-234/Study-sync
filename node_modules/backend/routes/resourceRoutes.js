const express = require('express');
const {
    addResource,
    getGroupResources,
    getStudentResources,
    getMentorResources
} = require('../controllers/resourceController');

const router = express.Router();

const { protect, authorize } = require('../utils/authMiddleware');

router.post('/', protect, authorize('admin', 'mentor'), addResource);
router.get('/group/:groupId', protect, getGroupResources);
router.get('/student', protect, getStudentResources);
router.get('/mentor', protect, authorize('admin', 'mentor'), getMentorResources);

module.exports = router;
