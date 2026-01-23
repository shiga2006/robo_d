const mongoose = require('mongoose');

const ConnectionSchema = new mongoose.Schema({
    mapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Map', required: true },
    fromNodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Node', required: true },
    toNodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Node', required: true },
    createdAt: { type: Date, default: Date.now }
});

// Ensure unique connections between same nodes
ConnectionSchema.index({ fromNodeId: 1, toNodeId: 1 }, { unique: true });

module.exports = mongoose.model('Connection', ConnectionSchema);
