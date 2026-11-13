const mongoose = require('mongoose');
const examSchema = new mongoose.Schema({
    examCode: { type: String, required: true, unique: true }, // Sinh viên dùng mã này để vào thi
    title: { type: String, required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    duration: { type: Number, required: true }, // phút
    openTime: { type: Date, required: true },
    closeTime: { type: Date, required: true },
    maxAttempts: { type: Number, default: 1 },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
module.exports = mongoose.model('Exam', examSchema);