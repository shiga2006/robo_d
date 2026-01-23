const mongoose = require('mongoose');

const MapSchema = new mongoose.Schema({
    name: { type: String, required: true },
    imageUrl: { type: String, required: true }, // Local URL path
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    userId: { type: String, required: true, default: 'demo-user-123' }, // Default for now
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Map', MapSchema);
