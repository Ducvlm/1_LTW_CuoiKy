const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. API Đăng ký tài khoản (mặc định luôn là student)
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu!' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'Email này đã được sử dụng!' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username: username.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: 'student'
        });

        await newUser.save();
        res.status(201).json({ message: 'Đăng ký tài khoản thành công!', userId: newUser._id });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email này đã được sử dụng!' });
        }
        console.error('Lỗi đăng ký:', error);
        res.status(500).json({ message: 'Lỗi server khi đăng ký tài khoản!' });
    }
};

// 2. API Đăng nhập
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email?.trim().toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác!' });
        }

        // Kiểm tra mật khẩu trước để không làm lộ trạng thái tài khoản bị khóa
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác!' });
        }

        if (user.isActive === false) {
            return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin!' });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Đăng nhập thành công!',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        res.status(500).json({ message: 'Lỗi server khi đăng nhập!' });
    }
};

module.exports = { register, login };