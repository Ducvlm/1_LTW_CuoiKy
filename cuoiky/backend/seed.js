const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Subject = require('./models/Subject');
const Question = require('./models/Question');
const Exam = require('./models/Exam');
const ExamDetails = require('./models/ExamDetails'); // Sửa tên file ở đây cho khớp với bạn nhé

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Đang kết nối MongoDB để nạp đầy đủ 5 bảng...');

        // Xóa dữ liệu cũ để tránh trùng lặp
        await User.deleteMany({});
        await Subject.deleteMany({});
        await Question.deleteMany({});
        await Exam.deleteMany({});
        await ExamDetails.deleteMany({});

        // 1. Tạo dữ liệu Users (3 vai trò: Admin, Teacher, Student)
        const users = await User.insertMany([
            { username: 'Quản trị viên Admin', email: 'admin@gmail.com', password: '123', role: 'admin' },
            { username: 'Giảng viên Java', email: 'teacher@gmail.com', password: '123', role: 'teacher' },
            { username: 'Thí sinh Đức', email: 'duc@gmail.com', password: '123', role: 'student' }
        ]);
        const teacher = users[1];
        const student = users[2];

        // 2. Tạo dữ liệu Subjects (Môn học)
        const subjects = await Subject.insertMany([
            { subjectCode: 'INT1304', name: 'Lập trình hướng đối tượng Java' },
            { subjectCode: 'INT1305', name: 'Cấu trúc dữ liệu và giải thuật' }
        ]);
        const javaSubject = subjects[0];

        // 3. Tạo dữ liệu Questions (Ngân hàng câu hỏi)
        const questions = await Question.insertMany([
            {
                subjectId: javaSubject._id,
                content: 'Java là ngôn ngữ lập trình hướng đối tượng đúng hay sai?',
                options: ['Đúng', 'Sai'],
                correctAnswers: ['Đúng'],
                difficulty: 'easy',
                teacherId: teacher._id
            },
            {
                subjectId: javaSubject._id,
                content: 'Đâu là các tính chất của Lập trình hướng đối tượng?',
                options: ['Tính đóng gói', 'Tính kế thừa', 'Tính đa hình', 'Tính tuần tự'],
                correctAnswers: ['Tính đóng gói', 'Tính kế thừa', 'Tính đa hình'],
                difficulty: 'medium',
                teacherId: teacher._id
            }
        ]);

        // 4. Tạo dữ liệu Exams (Đề thi)
        const exam = await Exam.create({
            examCode: 'JAVA01',
            title: 'Kiểm tra giữa kỳ môn Java',
            subjectId: javaSubject._id,
            questions: [questions[0]._id, questions[1]._id],
            duration: 45,
            openTime: new Date(),
            closeTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            maxAttempts: 2,
            teacherId: teacher._id
        });

        // 5. Tạo dữ liệu chi tiết bài làm (ExamDetails)
        await ExamDetails.create({
            userId: student._id,
            examId: exam._id,
            startTime: new Date(),
            status: 'submitted',
            answers: [
                { questionId: questions[0]._id, selectedOptions: ['Đúng'] }
            ],
            score: 5.0,
            correctCount: 1,
            submittedAt: new Date()
        });

        console.log('🚀 Đã nạp thành công toàn bộ 5 bảng lên MongoDB Atlas!');
        process.exit();
    } catch (error) {
        console.error('❌ Lỗi khi nạp dữ liệu:', error);
        process.exit(1);
    }
};

seedData();