const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. API Đăng ký tài khoản
const register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email này đã được sử dụng!' });
        }

        // Mã hóa mật khẩu bằng bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Tạo user mới (mặc định nếu không truyền role thì là student)
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: role || 'student'
        });

        await newUser.save();
        res.status(201).json({ message: 'Đăng ký tài khoản thành công!', userId: newUser._id });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi đăng ký', error: error.message });
    }
};

// 2. API Đăng nhập
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Tìm user theo email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác!' });
        }

        // Kiểm tra mật khẩu khớp nhau qua bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác!' });
        }

        // Tạo JWT Token chứa userId và role (thời hạn 1 ngày)
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
        res.status(500).json({ message: 'Lỗi server khi đăng nhập', error: error.message });
    }
};

module.exports = { register, login };