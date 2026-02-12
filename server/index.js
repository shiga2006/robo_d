const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Models
const User = require('./models/User');
const Map = require('./models/Map');
const Node = require('./models/Node');
const Connection = require('./models/Connection');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/robo_d';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-env';

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

// --- MongoDB Connection ---
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// ==========================================
// Authentication Routes
// ==========================================

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied. Token missing.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
        req.user = user;
        next();
    });
};

app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const newUser = new User({ username, password });
        await newUser.save();

        const token = jwt.sign({ id: newUser._id, username: newUser.username }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ token, user: { id: newUser._id, username: newUser.username } });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user._id, username: user.username } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: err.message });
    }
});

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

// ==========================================
// API Routes
// ==========================================

// --- Maps ---

app.get('/api/maps', authenticateToken, async (req, res) => {
    try {
        const query = {};
        // If filtering by userId, use it, otherwise show all for demos? 
        // Actually, let's tie it to the LOGGED IN user primarily.
        const userId = req.query.userId || req.user.id;
        query.userId = userId;

        const maps = await Map.find(query).sort({ createdAt: -1 });
        res.json(maps);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/maps', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        console.log('📥 Received Map Upload request');
        if (!req.file) {
            console.error('❌ No image file in request');
            return res.status(400).json({ error: 'No image uploaded' });
        }

        const { name, width, height, userId } = req.body;
        console.log(`📦 Map metadata: name=${name}, dimensions=${width}x${height}, userId=${userId}`);

        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        console.log(`🔗 Generated imageUrl: ${imageUrl}`);

        const newMap = new Map({
            userId: userId || 'demo-user-123',
            name,
            imageUrl,
            width: Number(width),
            height: Number(height)
        });

        await newMap.save();
        console.log('✅ Map record saved to MongoDB');
        res.status(201).json(newMap);
    } catch (err) {
        console.error('❌ Error in /api/maps:', err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/maps/:id', async (req, res) => {
    try {
        const map = await Map.findById(req.params.id);
        if (!map) return res.status(404).json({ error: 'Map not found' });

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

        // Cascade delete nodes and connections
        await Node.deleteMany({ mapId: req.params.id });
        await Connection.deleteMany({ mapId: req.params.id });
        await Map.findByIdAndDelete(req.params.id);

        res.json({ message: 'Map deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Nodes ---

app.get('/api/maps/:mapId/nodes', async (req, res) => {
    try {
        const nodes = await Node.find({ mapId: req.params.mapId });
        res.json(nodes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/nodes', async (req, res) => {
    try {
        const newNode = new Node(req.body);
        await newNode.save();
        res.status(201).json(newNode);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/nodes/:id', async (req, res) => {
    try {
        const updatedNode = await Node.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedNode) return res.status(404).json({ error: 'Node not found' });
        res.json(updatedNode);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/nodes/:id', async (req, res) => {
    try {
        const deletedNode = await Node.findByIdAndDelete(req.params.id);
        if (!deletedNode) return res.status(404).json({ error: 'Node not found' });

        // Delete valid connections
        await Connection.deleteMany({
            $or: [{ fromNodeId: req.params.id }, { toNodeId: req.params.id }]
        });

        res.json({ message: 'Node deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Connections ---

app.get('/api/maps/:mapId/connections', async (req, res) => {
    try {
        const connections = await Connection.find({ mapId: req.params.mapId });
        res.json(connections);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/connections', async (req, res) => {
    try {
        const { mapId, fromNodeId, toNodeId } = req.body;

        // Check if connection already exists (Mongoose unique index handles this, but we can check for better error response)
        const exactExists = await Connection.findOne({ fromNodeId, toNodeId });
        if (exactExists) {
            return res.status(400).json({ error: 'Connection already exists' });
        }

        const newConnection = new Connection({
            mapId,
            fromNodeId,
            toNodeId
        });

        await newConnection.save();
        res.status(201).json(newConnection);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Connection already exists' });
        }
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/connections/:id', async (req, res) => {
    try {
        await Connection.findByIdAndDelete(req.params.id);
        res.json({ message: 'Connection deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, '127.0.0.1', () => {
    console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
});
