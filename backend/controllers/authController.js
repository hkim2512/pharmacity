const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_pharmacy_key_2026';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  const { email, password, fullName, role } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }
    const user = await User.create({ email, password, fullName, role });
    res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng ký', error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không hợp lệ' });
    }
    res.status(200).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng nhập', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  const { fullName, password } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (fullName) user.fullName = fullName.trim();
    if (password) user.password = password; // Sẽ tự động hash ở pre-save

    await user.save();

    res.status(200).json({
      message: 'Cập nhật tài khoản thành công',
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật hồ sơ cá nhân', error: error.message });
  }
};
