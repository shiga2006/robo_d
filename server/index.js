const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Ensure DB file exists
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ maps: [], nodes: [], connections: [] }, null, 2));
}

// --- Helper Functions for JSON DB ---

const readDb = () => {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading DB:', err);
        return { maps: [], nodes: [], connections: [] };
    }
};

const writeDb = (data) => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error writing DB:', err);
    }
};

// --- Multer Storage ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

console.log('📦 Using Local JSON Storage (No MongoDB required)');

// ==========================================
// API Routes
// ==========================================

// --- Maps ---

app.get('/api/maps', (req, res) => {
    const db = readDb();
    // Sort by createdAt desc
    const maps = db.maps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(maps);
});

app.post('/api/maps', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
    }

    const { name, width, height, userId } = req.body;
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const newMap = {
        _id: Date.now().toString(), // Simple string ID
        userId: userId || 'demo-user-123',
        name,
        imageUrl,
        width: Number(width),
        height: Number(height),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    const db = readDb();
    db.maps.push(newMap);
    writeDb(db);

    res.status(201).json(newMap);
});

app.delete('/api/maps/:id', (req, res) => {
    const db = readDb();
    const mapIndex = db.maps.findIndex(m => m._id === req.params.id);

    if (mapIndex === -1) return res.status(404).json({ error: 'Map not found' });

    const map = db.maps[mapIndex];

    // Delete local file
    try {
        const filename = map.imageUrl.split('/uploads/')[1];
        if (filename) {
            const filePath = path.join(uploadDir, filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
    } catch (e) {
        console.error("Could not delete file:", e);
    }

    // Remove map
    db.maps.splice(mapIndex, 1);

    // Cascade delete nodes and connections
    const nodesToDelete = db.nodes.filter(n => n.mapId === req.params.id).map(n => n._id);
    db.nodes = db.nodes.filter(n => n.mapId !== req.params.id);
    db.connections = db.connections.filter(c => c.mapId !== req.params.id);

    writeDb(db);
    res.json({ message: 'Map deleted successfully' });
});

// --- Nodes ---

app.get('/api/maps/:mapId/nodes', (req, res) => {
    const db = readDb();
    const nodes = db.nodes.filter(n => n.mapId === req.params.mapId);
    res.json(nodes);
});

app.post('/api/nodes', (req, res) => {
    const db = readDb();
    const newNode = {
        _id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        createdAt: new Date().toISOString(),
        ...req.body
    };

    db.nodes.push(newNode);
    writeDb(db);
    res.status(201).json(newNode);
});

app.put('/api/nodes/:id', (req, res) => {
    const db = readDb();
    const nodeIndex = db.nodes.findIndex(n => n._id === req.params.id);

    if (nodeIndex === -1) return res.status(404).json({ error: 'Node not found' });

    const updatedNode = { ...db.nodes[nodeIndex], ...req.body };
    db.nodes[nodeIndex] = updatedNode;
    writeDb(db);

    res.json(updatedNode);
});

app.delete('/api/nodes/:id', (req, res) => {
    const db = readDb();
    const initialLength = db.nodes.length;
    db.nodes = db.nodes.filter(n => n._id !== req.params.id);

    if (db.nodes.length === initialLength) return res.status(404).json({ error: 'Node not found' });

    // Delete valid connections
    db.connections = db.connections.filter(c => c.fromNodeId !== req.params.id && c.toNodeId !== req.params.id);

    writeDb(db);
    res.json({ message: 'Node deleted successfully' });
});

// --- Connections ---

app.get('/api/maps/:mapId/connections', (req, res) => {
    const db = readDb();
    const connections = db.connections.filter(c => c.mapId === req.params.mapId);
    res.json(connections);
});

app.post('/api/connections', (req, res) => {
    const db = readDb();
    const { mapId, fromNodeId, toNodeId } = req.body;

    // Check duplicate
    const exists = db.connections.some(c =>
        c.mapId === mapId &&
        ((c.fromNodeId === fromNodeId && c.toNodeId === toNodeId) ||
            (c.fromNodeId === toNodeId && c.toNodeId === fromNodeId))
    ); // Note: Simple undirected check logic or strict directed? Mongoose model was unique compound index.
    // Let's assume strict directed for uniqueness based on inputs, but usually we want unique per pair.
    // The Mongoose schema had {from:1, to:1} unique.

    const exactExists = db.connections.some(c => c.fromNodeId === fromNodeId && c.toNodeId === toNodeId);
    if (exactExists) {
        return res.status(400).json({ error: 'Connection already exists' });
    }

    const newConnection = {
        _id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        mapId,
        fromNodeId,
        toNodeId,
        createdAt: new Date().toISOString()
    };

    db.connections.push(newConnection);
    writeDb(db);
    res.status(201).json(newConnection);
});

app.delete('/api/connections/:id', (req, res) => {
    const db = readDb();
    db.connections = db.connections.filter(c => c._id !== req.params.id);
    writeDb(db);
    res.json({ message: 'Connection deleted successfully' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
