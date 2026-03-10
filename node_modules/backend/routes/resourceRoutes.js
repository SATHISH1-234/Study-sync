const express = require('express');
const {
    addResource,
    getGroupResources,
    getStudentResources,
    getMentorResources,
    deleteResource
} = require('../controllers/resourceController');
const { protect, authorize } = require('../utils/authMiddleware');

const router = express.Router();

const upload = require('../utils/upload');

router.post('/', protect, authorize('admin', 'mentor'), upload.single('file'), addResource);
router.get('/group/:groupId', protect, getGroupResources);
router.get('/student', protect, getStudentResources);
router.get('/mentor', protect, authorize('admin', 'mentor'), getMentorResources);
router.delete('/:id', protect, authorize('admin', 'mentor'), deleteResource);

module.exports = router;
