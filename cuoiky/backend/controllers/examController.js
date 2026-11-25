const Exam = require('../models/Exam');
const ExamAttempt = require('../models/ExamAttempts');


const getAllExams = async (req, res) => {
    try {
        const exams = await Exam.find()
            .populate('subjectId', 'subjectCode name')
            .select('examCode title subjectId duration openTime closeTime maxAttempts')
            .sort({ createdAt: -1 });

        const now = new Date();
        const result = exams.map((exam) => {
            let status = 'Đang mở';
            if (now < new Date(exam.openTime)) status = 'Chưa mở';
            else if (now > new Date(exam.closeTime)) status = 'Đã đóng';

            return {
                _id: exam._id,
                examCode: exam.examCode,
                title: exam.title,
                subject: exam.subjectId,
                duration: exam.duration,
                openTime: exam.openTime,
                closeTime: exam.closeTime,
                maxAttempts: exam.maxAttempts,
                status
            };
        });

        res.status(200).json(result);
    } catch (error) {
        console.error('Lỗi lấy danh sách bài thi:', error);
        res.status(500).json({ message: 'Lỗi server khi tải danh sách bài thi!' });
    }
};


const joinExam = async (req, res) => {
    try {
        const { examCode } = req.body;
        const userId = req.user.userId;

        if (!examCode || !examCode.trim()) {
            return res.status(400).json({ message: 'Vui lòng nhập mã đề thi!' });
        }

        const exam = await Exam.findOne({ examCode: examCode.trim().toUpperCase() })
            .populate('questions')
            .populate('subjectId', 'subjectCode name');

        if (!exam) {
            return res.status(404).json({ message: 'Mã đề thi không tồn tại!' });
        }

        const now = new Date();
        if (now < new Date(exam.openTime)) {
            return res.status(403).json({ message: 'Kỳ thi này chưa tới giờ mở!' });
        }
        if (now > new Date(exam.closeTime)) {
            return res.status(403).json({ message: 'Kỳ thi này đã đóng!' });
        }

        
        let attempt = await ExamAttempt.findOne({
            userId,
            examId: exam._id,
            status: 'in-progress'
        });

        if (!attempt) {
            const submittedCount = await ExamAttempt.countDocuments({
                userId,
                examId: exam._id,
                status: 'submitted'
            });

            if (submittedCount >= exam.maxAttempts) {
                return res.status(403).json({
                    message: `Bạn đã hết lượt làm bài cho đề thi này (Tối đa ${exam.maxAttempts} lượt)!`
                });
            }

            attempt = await ExamAttempt.create({
                userId,
                examId: exam._id,
                startTime: now,
                status: 'in-progress'
            });
        }

        
        const safeQuestions = exam.questions.map((q) => ({
            _id: q._id,
            content: q.content,
            options: q.options,
            isMultipleChoice: q.correctAnswers.length > 1
        }));

        res.status(200).json({
            attemptId: attempt._id,
            startTime: attempt.startTime,
            serverTime: now,
            exam: {
                _id: exam._id,
                examCode: exam.examCode,
                title: exam.title,
                duration: exam.duration,
                openTime: exam.openTime,
                closeTime: exam.closeTime,
                subject: exam.subjectId
            },
            questions: safeQuestions
        });
    } catch (error) {
        console.error('Lỗi vào phòng thi:', error);
        res.status(500).json({ message: 'Lỗi server khi vào phòng thi!' });
    }
};


const submitExam = async (req, res) => {
    try {
        const { attemptId, answers } = req.body;
        const userId = req.user.userId;

        const attempt = await ExamAttempt.findById(attemptId);
        if (!attempt) {
            return res.status(404).json({ message: 'Không tìm thấy phiên làm bài!' });
        }
        if (attempt.userId.toString() !== userId) {
            return res.status(403).json({ message: 'Bạn không có quyền nộp bài làm này!' });
        }
        if (attempt.status === 'submitted') {
            return res.status(400).json({ message: 'Bài thi này đã được nộp trước đó!' });
        }

        const exam = await Exam.findById(attempt.examId).populate('questions');
        if (!exam) {
            return res.status(404).json({ message: 'Không tìm thấy đề thi!' });
        }

        
        const now = Date.now();
        const endByDuration = new Date(attempt.startTime).getTime() + exam.duration * 60 * 1000;
        const endByCloseTime = new Date(exam.closeTime).getTime();
        const deadline = Math.min(endByDuration, endByCloseTime) + 15000;

        if (now > deadline) {
            return res.status(400).json({ message: 'Đã quá thời gian nộp bài!' });
        }

        
        const submittedAnswers = Array.isArray(answers) ? answers : [];
        const answerMap = new Map();
        submittedAnswers.forEach((item) => {
            if (item.questionId) {
                answerMap.set(item.questionId.toString(), Array.isArray(item.selectedOptions) ? item.selectedOptions : []);
            }
        });

        
        let correctCount = 0;
        exam.questions.forEach((q) => {
            const selected = answerMap.get(q._id.toString()) || [];
            const correct = q.correctAnswers || [];

            const sortedSelected = [...selected].sort();
            const sortedCorrect = [...correct].sort();

            const isExactMatch =
                sortedSelected.length === sortedCorrect.length &&
                sortedSelected.every((val, idx) => val === sortedCorrect[idx]);

            if (isExactMatch) correctCount += 1;
        });

        const totalQuestions = exam.questions.length;
        const score = totalQuestions > 0 ? Number(((correctCount / totalQuestions) * 10).toFixed(2)) : 0;

        attempt.answers = submittedAnswers;
        attempt.correctCount = correctCount;
        attempt.score = score;
        attempt.status = 'submitted';
        attempt.submittedAt = new Date();
        await attempt.save();

        res.status(200).json({
            message: 'Nộp bài thành công!',
            score,
            correctCount,
            totalQuestions
        });
    } catch (error) {
        console.error('Lỗi nộp bài:', error);
        res.status(500).json({ message: 'Lỗi server khi nộp bài!' });
    }
};

module.exports = { getAllExams, joinExam, submitExam };