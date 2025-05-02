const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');


router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });

    res.json(user);
  } catch (err) {
    console.error('Kullanıcı alınamadı:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Profil Güncelle
router.put('/update-profile/:id', async (req, res) => {
    try {
      const { password, ...otherData } = req.body;
  
      let updatedData = { ...otherData };
  
      // Eğer yeni şifre varsa hashle
      if (password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        updatedData.password = hashedPassword;
      }
  
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        updatedData,
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      }
  
      res.json(updatedUser);
    } catch (err) {
      console.error('Güncelleme hatası:', err);
      res.status(500).json({ error: 'Sunucu hatası' });
    }
  });
  

module.exports = router;
