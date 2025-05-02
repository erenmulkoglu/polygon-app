const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'İsim alanı zorunludur.']
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['Erkek', 'Kadın'], // Enum ile iki seçenek sınırlanıyor
        required: true,
        default: 'Erkek' 
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
