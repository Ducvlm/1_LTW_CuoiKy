const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const {
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
} = require('../controllers/adminController');

// Áp dụng bảo vệ: Bắt buộc đăng nhập & phải có quyền 'admin' cho tất cả route bên dưới
router.use(verifyToken, verifyRole(['admin']));

// Route thống kê tổng quan
router.get('/stats', getDashboardStats);

// Routes quản lý tài khoản (CRUD + Khóa/Mở)
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

// Routes quản lý môn học (CRUD)
router.get('/subjects', getAllSubjects);
router.post('/subjects', createSubject);
router.put('/subjects/:id', updateSubject);
router.delete('/subjects/:id', deleteSubject);

module.exports = router;