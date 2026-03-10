const express = require('express');
const router = express.Router();
const {
    createReport,
    getReports,
    respondToReport,
    deleteReport
} = require('../controllers/reportController');
const { protect, authorize } = require('../utils/authMiddleware');

router.use(protect);

router.post('/', createReport);
router.get('/', authorize('admin'), getReports);
router.put('/:id', authorize('admin'), respondToReport);
router.delete('/:id', authorize('admin'), deleteReport);

module.exports = router;
