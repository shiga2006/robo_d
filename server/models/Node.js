const mongoose = require('mongoose');

const NodeSchema = new mongoose.Schema({
    mapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Map', required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    label: { type: String, default: '' },
    type: {
        type: String,
        required: true,
        enum: ['delivery', 'waypoint', 'charging']
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Node', NodeSchema);
