const User = require('../models/User');
const Subject = require('../models/Subject');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const bcrypt = require('bcryptjs');

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
        res.status(500).json({ message: 'Lỗi lấy thống kê', error: error.message });
    }
};

// ================= 2. QUẢN LÝ TÀI KHOẢN (USERS) =================
// Lấy danh sách tất cả tài khoản (ẩn mật khẩu)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách người dùng', error: error.message });
    }
};

// Admin tạo tài khoản mới (có thể tạo cho Giảng viên hoặc Admin khác)
const createUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email đã tồn tại trong hệ thống!' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role: role || 'student'
        });

        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(201).json({ message: 'Tạo tài khoản thành công!', user: userResponse });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi tạo tài khoản', error: error.message });
    }
};

// Cập nhật thông tin hoặc phân quyền (role) của tài khoản
const updateUser = async (req, res) => {
    try {
        const { username, role } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { username, role },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
        }

        res.status(200).json({ message: 'Cập nhật người dùng thành công!', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi cập nhật người dùng', error: error.message });
    }
};

// Khóa hoặc Mở khóa tài khoản
const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
        }

        // Không cho phép Admin tự khóa chính mình
        if (user._id.toString() === req.user.userId) {
            return res.status(400).json({ message: 'Không thể tự khóa tài khoản đang đăng nhập!' });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.status(200).json({
            message: user.isActive ? 'Đã mở khóa tài khoản!' : 'Đã khóa tài khoản!',
            isActive: user.isActive
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi thay đổi trạng thái tài khoản', error: error.message });
    }
};

// Xóa tài khoản
const deleteUser = async (req, res) => {
    try {
        if (req.params.id === req.user.userId) {
            return res.status(400).json({ message: 'Không thể tự xóa tài khoản của chính mình!' });
        }

        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
        }

        res.status(200).json({ message: 'Đã xóa người dùng thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi xóa người dùng', error: error.message });
    }
};

// ================= 3. QUẢN LÝ MÔN HỌC (SUBJECTS) =================
// Lấy danh sách môn học
const getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find().sort({ createdAt: -1 });
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách môn học', error: error.message });
    }
};

// Thêm môn học mới
const createSubject = async (req, res) => {
    try {
        const { subjectCode, name } = req.body;

        const existingSubject = await Subject.findOne({ subjectCode });
        if (existingSubject) {
            return res.status(400).json({ message: 'Mã môn học này đã tồn tại!' });
        }

        const newSubject = await Subject.create({ subjectCode, name });
        res.status(201).json({ message: 'Thêm môn học thành công!', subject: newSubject });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi thêm môn học', error: error.message });
    }
};

// Cập nhật môn học
const updateSubject = async (req, res) => {
    try {
        const { subjectCode, name } = req.body;
        const updatedSubject = await Subject.findByIdAndUpdate(
            req.params.id,
            { subjectCode, name },
            { new: true }
        );

        if (!updatedSubject) {
            return res.status(404).json({ message: 'Không tìm thấy môn học!' });
        }

        res.status(200).json({ message: 'Cập nhật môn học thành công!', subject: updatedSubject });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi cập nhật môn học', error: error.message });
    }
};

// Xóa môn học
const deleteSubject = async (req, res) => {
    try {
        const deletedSubject = await Subject.findByIdAndDelete(req.params.id);
        if (!deletedSubject) {
            return res.status(404).json({ message: 'Không tìm thấy môn học!' });
        }

        res.status(200).json({ message: 'Đã xóa môn học thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi xóa môn học', error: error.message });
    }
};

module.exports = {
    getDashboardStats,
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