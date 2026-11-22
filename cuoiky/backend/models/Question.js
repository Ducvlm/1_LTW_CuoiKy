const mongoose = require('mongoose');
const questionSchema = new mongoose.Schema({
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    content: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswers: [{ type: String, required: true }], // Mảng để hỗ trợ 1 hoặc nhiều đáp án
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
module.exports = mongoose.model('Question', questionSchema);