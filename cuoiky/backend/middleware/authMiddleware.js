const jwt = require('jsonwebtoken');

// Middleware xác thực token đăng nhập
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Không tìm thấy token xác thực, vui lòng đăng nhập!' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Lưu thông tin (userId, role) vào request để dùng tiếp
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
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