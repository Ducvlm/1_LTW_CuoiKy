const ExamAttempt = require('../models/ExamAttempts');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const bcrypt = require('bcryptjs');
const getExamAnalytics = async (req, res) => {
    try {
        const [overviewResult, bySubject, byDate] = await Promise.all([
            // Pipeline 1: Tổng quan toàn hệ thống ($match -> $group -> $project)
            ExamAttempt.aggregate([
                { $match: { status: 'submitted' } },
                {
                    $group: {
                        _id: null,
                        totalSubmissions: { $sum: 1 },
                        avgScore: { $avg: '$score' },
                        passedCount: {
                            $sum: { $cond: [{ $gte: ['$score', 5] }, 1, 0] }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalSubmissions: 1,
                        avgScore: { $round: [{ $ifNull: ['$avgScore', 0] }, 2] },
                        passRate: {
                            $cond: [
                                { $gt: ['$totalSubmissions', 0] },
                                {
                                    $round: [
                                        { $multiply: [{ $divide: ['$passedCount', '$totalSubmissions'] }, 100] },
                                        1
                                    ]
                                },
                                0
                            ]
                        }
                    }
                }
            ]),

            // Pipeline 2: Thống kê theo từng môn học ($match -> $lookup -> $unwind -> $group -> $project -> $sort)
            ExamAttempt.aggregate([
                { $match: { status: 'submitted' } },
                {
                    $lookup: {
                        from: 'exams',
                        localField: 'examId',
                        foreignField: '_id',
                        as: 'examInfo'
                    }
                },
                { $unwind: '$examInfo' },
                {
                    $lookup: {
                        from: 'subjects',
                        localField: 'examInfo.subjectId',
                        foreignField: '_id',
                        as: 'subjectInfo'
                    }
                },
                { $unwind: '$subjectInfo' },
                {
                    $group: {
                        _id: '$subjectInfo._id',
                        subjectCode: { $first: '$subjectInfo.subjectCode' },
                        subjectName: { $first: '$subjectInfo.name' },
                        totalAttempts: { $sum: 1 },
                        avgScore: { $avg: '$score' },
                        maxScore: { $max: '$score' },
                        passedCount: {
                            $sum: { $cond: [{ $gte: ['$score', 5] }, 1, 0] }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        subjectId: '$_id',
                        subjectCode: 1,
                        subjectName: 1,
                        totalAttempts: 1,
                        avgScore: { $round: [{ $ifNull: ['$avgScore', 0] }, 2] },
                        maxScore: { $ifNull: ['$maxScore', 0] },
                        passRate: {
                            $round: [{ $multiply: [{ $divide: ['$passedCount', '$totalAttempts'] }, 100] }, 1]
                        }
                    }
                },
                { $sort: { totalAttempts: -1, avgScore: -1 } }
            ]),

            // Pipeline 3: Thống kê lượt nộp bài & điểm TB theo ngày ($match -> $group -> $project -> $sort -> $limit)
            ExamAttempt.aggregate([
                { $match: { status: 'submitted', submittedAt: { $ne: null } } },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m-%d', date: '$submittedAt', timezone: '+07:00' }
                        },
                        totalAttempts: { $sum: 1 },
                        avgScore: { $avg: '$score' }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        date: '$_id',
                        totalAttempts: 1,
                        avgScore: { $round: [{ $ifNull: ['$avgScore', 0] }, 2] }
                    }
                },
                { $sort: { date: -1 } },
                { $limit: 7 }
            ])
        ]);

        res.status(200).json({
            overview: overviewResult[0] || { totalSubmissions: 0, avgScore: 0, passRate: 0 },
            bySubject,
            byDate
        });
    } catch (error) {
        console.error('Lỗi thống kê kết quả thi:', error);
        res.status(500).json({ message: 'Lỗi lấy thống kê kết quả thi!' });
    }
};

// ================= 1. THỐNG KÊ DASHBOARD =================
const getDashboardStats = async (req, res) => {
    try {
        const [totalUsers, totalSubjects, totalExams, totalQuestions] = await Promise.all([
            User.countDocuments(),
            Subject.countDocuments(),
            Exam.countDocuments(),
            Question.countDocuments()
        ]);

        res.status(200).json({
            totalUsers,
            totalSubjects,
            totalExams,
            totalQuestions
        });
    } catch (error) {
        console.error('Lỗi lấy thống kê:', error);
        res.status(500).json({ message: 'Lỗi lấy thống kê hệ thống!' });
    }
};

// ================= 2. QUẢN LÝ TÀI KHOẢN (USERS) =================
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        console.error('Lỗi lấy danh sách user:', error);
        res.status(500).json({ message: 'Lỗi lấy danh sách người dùng!' });
    }
};

const createUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin!' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'Email đã tồn tại trong hệ thống!' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username: username.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: role || 'student'
        });

        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(201).json({ message: 'Tạo tài khoản thành công!', user: userResponse });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email đã tồn tại trong hệ thống!' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Dữ liệu vai trò không hợp lệ!' });
        }
        console.error('Lỗi tạo tài khoản:', error);
        res.status(500).json({ message: 'Lỗi tạo tài khoản!' });
    }
};

const updateUser = async (req, res) => {
    try {
        const { username, email, role, password } = req.body;
        const targetId = req.params.id;

        const targetUser = await User.findById(targetId);
        if (!targetUser) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
        }

        if (targetId === req.user.userId && role && role !== targetUser.role) {
            return res.status(400).json({ message: 'Không thể tự thay đổi vai trò của chính mình!' });
        }

        if (targetUser.role === 'admin' && role && role !== 'admin') {
            const activeAdminCount = await User.countDocuments({ role: 'admin', isActive: { $ne: false } });
            if (activeAdminCount <= 1) {
                return res.status(400).json({ message: 'Không thể hạ quyền quản trị viên cuối cùng!' });
            }
        }

        const updatePayload = {};
        if (username) updatePayload.username = username.trim();
        if (email) updatePayload.email = email.trim().toLowerCase();
        if (role) updatePayload.role = role;
        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            updatePayload.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(targetId, updatePayload, {
            new: true,
            runValidators: true
        }).select('-password');

        res.status(200).json({ message: 'Cập nhật người dùng thành công!', user: updatedUser });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email này đã được tài khoản khác sử dụng!' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Dữ liệu cập nhật không hợp lệ!' });
        }
        console.error('Lỗi cập nhật user:', error);
        res.status(500).json({ message: 'Lỗi cập nhật người dùng!' });
    }
};

const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
        }

        if (user._id.toString() === req.user.userId) {
            return res.status(400).json({ message: 'Không thể tự khóa tài khoản đang đăng nhập!' });
        }

        if (user.role === 'admin' && user.isActive !== false) {
            const activeAdminCount = await User.countDocuments({ role: 'admin', isActive: { $ne: false } });
            if (activeAdminCount <= 1) {
                return res.status(400).json({ message: 'Không thể khóa quản trị viên cuối cùng!' });
            }
        }

        user.isActive = !user.isActive;
        await user.save();

        res.status(200).json({
            message: user.isActive ? 'Đã mở khóa tài khoản!' : 'Đã khóa tài khoản!',
            isActive: user.isActive
        });
    } catch (error) {
        console.error('Lỗi đổi trạng thái user:', error);
        res.status(500).json({ message: 'Lỗi thay đổi trạng thái tài khoản!' });
    }
};

const deleteUser = async (req, res) => {
    try {
        if (req.params.id === req.user.userId) {
            return res.status(400).json({ message: 'Không thể tự xóa tài khoản của chính mình!' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
        }

        if (user.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({ message: 'Không thể xóa quản trị viên cuối cùng!' });
            }
        }

        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Đã xóa người dùng thành công!' });
    } catch (error) {
        console.error('Lỗi xóa user:', error);
        res.status(500).json({ message: 'Lỗi xóa người dùng!' });
    }
};

// ================= 3. QUẢN LÝ MÔN HỌC (SUBJECTS) =================
const getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find().sort({ createdAt: -1 });
        res.status(200).json(subjects);
    } catch (error) {
        console.error('Lỗi lấy danh sách môn học:', error);
        res.status(500).json({ message: 'Lỗi lấy danh sách môn học!' });
    }
};

const createSubject = async (req, res) => {
    try {
        const { subjectCode, name } = req.body;
        if (!subjectCode || !name) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ mã môn và tên môn!' });
        }

        const normalizedCode = subjectCode.trim().toUpperCase();
        const existingSubject = await Subject.findOne({ subjectCode: normalizedCode });
        if (existingSubject) {
            return res.status(400).json({ message: 'Mã môn học này đã tồn tại!' });
        }

        const newSubject = await Subject.create({
            subjectCode: normalizedCode,
            name: name.trim()
        });
        res.status(201).json({ message: 'Thêm môn học thành công!', subject: newSubject });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Mã môn học này đã tồn tại!' });
        }
        console.error('Lỗi thêm môn học:', error);
        res.status(500).json({ message: 'Lỗi thêm môn học!' });
    }
};

const updateSubject = async (req, res) => {
    try {
        const { subjectCode, name } = req.body;
        const updatedSubject = await Subject.findByIdAndUpdate(
            req.params.id,
            {
                subjectCode: subjectCode?.trim().toUpperCase(),
                name: name?.trim()
            },
            { new: true, runValidators: true }
        );

        if (!updatedSubject) {
            return res.status(404).json({ message: 'Không tìm thấy môn học!' });
        }

        res.status(200).json({ message: 'Cập nhật môn học thành công!', subject: updatedSubject });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Mã môn học này đã tồn tại!' });
        }
        console.error('Lỗi cập nhật môn học:', error);
        res.status(500).json({ message: 'Lỗi cập nhật môn học!' });
    }
};

const deleteSubject = async (req, res) => {
    try {
        const subjectId = req.params.id;
        const used = (await Question.exists({ subjectId })) || (await Exam.exists({ subjectId }));
        if (used) {
            return res.status(409).json({
                message: 'Môn học đang có câu hỏi hoặc đề thi liên kết, không thể xóa!'
            });
        }

        const deletedSubject = await Subject.findByIdAndDelete(subjectId);
        if (!deletedSubject) {
            return res.status(404).json({ message: 'Không tìm thấy môn học!' });
        }

        res.status(200).json({ message: 'Đã xóa môn học thành công!' });
    } catch (error) {
        console.error('Lỗi xóa môn học:', error);
        res.status(500).json({ message: 'Lỗi xóa môn học!' });
    }
};

module.exports = {
    getDashboardStats,
    getExamAnalytics,
    getAllUsers,
    createUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    getAllSubjects,
    createSubject,
    updateSubject,
    deleteSubject
};