const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Kayıt
exports.register = async (req, res) => {
  const { name, email, password, gender } = req.body;

  if (!name || !email || !password || !gender) {
    return res.status(400).json({ error: 'Tüm alanlar zorunludur.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Bu email zaten kayıtlı.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({ name, email, password: hashedPassword, gender });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, gender: user.gender } });
  } catch (err) {
    console.error('Kayıt hatası:', err);
    res.status(500).json({ error: 'Kayıt yapılamadı.' });
  }
};

// Giriş
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Geçersiz email veya şifre." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Geçersiz email veya şifre." });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Giriş yapılamadı:', error);
    res.status(500).json({ error: "Giriş yapılamadı." });
  }
};

// Kullanıcı Bilgisi Getir
exports.getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });

    res.json(user);
  } catch (error) {
    console.error('Kullanıcı bilgileri alınamadı:', error);
    res.status(500).json({ message: 'Kullanıcı bilgileri alınamadı.' });
  }
};

// Kullanıcı Profil Güncelleme
exports.updateProfile = async (req, res) => {
  const { name, email, currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });

    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ error: 'Mevcut şifre hatalı' });
    }

    if (newPassword) {
      user.password = await bcrypt.hash(newPassword, 10);
    }

    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();

    res.status(200).json({ message: 'Profil başarıyla güncellendi!' });
  } catch (error) {
    console.error('Profil güncellenemedi:', error);
    res.status(500).json({ message: 'Profil güncellenemedi.' });
  }
};
