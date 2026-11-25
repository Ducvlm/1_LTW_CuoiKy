const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { getAllExams, joinExam, submitExam } = require('../controllers/examController');

// Tất cả API phòng thi đều yêu cầu đăng nhập
router.use(verifyToken);

router.get('/', getAllExams);
router.post('/join', joinExam);
router.post('/submit', submitExam);

module.exports = router;