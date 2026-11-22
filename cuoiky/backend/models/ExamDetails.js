const mongoose = require('mongoose');
const examAttemptSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    startTime: { type: Date, default: Date.now }, // Lưu trên server để đếm ngược
    status: { type: String, enum: ['in-progress', 'submitted'], default: 'in-progress' },
    answers: [{ 
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        selectedOptions: [{ type: String }] 
    }], // Câu trả lời của sinh viên đẩy lên
    score: { type: Number, default: null }, // Do server tính toán lúc nộp bài
    correctCount: { type: Number, default: null },
    submittedAt: { type: Date }
}, { timestamps: true });
module.exports = mongoose.model('ExamAttempt', examAttemptSchema);