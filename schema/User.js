const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    messages: { type: Number, default: 0 },
    voiceTime: { type: Number, default: 0 }, // секунды
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    coins: { type: Number, default: 500 },
    lastDaily: { type: Date, default: null },
    marriedTo: { type: String, default: null },
    marryDate: { type: Date, default: null },
    clan: { type: String, default: 'Нет' },
    inventory: { type: Array, default: [] } // для магазина
});

module.exports = mongoose.model('User', userSchema);