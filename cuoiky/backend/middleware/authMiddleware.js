const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware xác thực token và kiểm tra trạng thái tài khoản trong DB
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Không tìm thấy token xác thực, vui lòng đăng nhập!' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('role isActive');

        if (!user) {
            return res.status(401).json({ message: 'Tài khoản không tồn tại!' });
        }
        if (user.isActive === false) {
            return res.status(401).json({ message: 'Tài khoản của bạn đã bị khóa!' });
        }

        req.user = { userId: user._id.toString(), role: user.role };
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn!' });
    }
};

// Middleware phân quyền theo danh sách các role được phép truy cập
const verifyRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này!' });
        }
        next();
    };
};

module.exports = { verifyToken, verifyRole };