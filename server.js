import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import session from 'express-session';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/pmk_labelled', express.static(path.join(__dirname, 'pmk_labelled')));
app.use(session({
    secret: 'pmk-monitor-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Database Initialization & Server Start
let db;
(async () => {
    try {
        db = await open({
            filename: path.join(__dirname, 'database.sqlite'),
            driver: sqlite3.Database
        });

        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password TEXT,
                full_name TEXT,
                email TEXT
            );
            CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                rate INTEGER,
                date TEXT,
                FOREIGN KEY(user_id) REFERENCES users(id)
            );
        `);

        try {
            await db.exec(`ALTER TABLE history ADD COLUMN type TEXT;`);
            await db.exec(`ALTER TABLE history ADD COLUMN image_path TEXT;`);
            await db.exec(`ALTER TABLE history ADD COLUMN ai_summary TEXT;`);
        } catch (e) {
            // Columns already exist
        }

        console.log('Database Ready');
        app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    } catch (err) {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    }
})();

// Multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

// --- API ROUTES ---

// Auth Routes
app.post('/api/register', async (req, res) => {
    const { username, password, fullName, email } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.run(
            'INSERT INTO users (username, password, full_name, email) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, fullName, email]
        );
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Registration error details:', err);
        if (err.code === 'SQLITE_CONSTRAINT' || err.message.includes('UNIQUE constraint failed')) {
            res.status(400).json({ error: 'Username already exists' });
        } else {
            res.status(500).json({ error: 'Server error: ' + err.message });
        }
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = user.id;
        req.session.user = { id: user.id, username: user.username, fullName: user.full_name, email: user.email };
        res.json({ message: 'Login successful', user: req.session.user });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Logged out' });
});

// User Info
app.get('/api/profile', (req, res) => {
    if (req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

// History Routes
app.post('/api/history', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Login required' });
    const { rate, type, ai_summary } = req.body;
    const date = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    await db.run(
        'INSERT INTO history (user_id, rate, date, type, ai_summary) VALUES (?, ?, ?, ?, ?)', 
        [req.session.userId, rate, date, type || 'Manual AHP', ai_summary || '']
    );
    res.json({ message: 'History saved' });
});

app.get('/api/history', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Login required' });
    const history = await db.all('SELECT * FROM history WHERE user_id = ? ORDER BY id DESC', [req.session.userId]);
    res.json(history);
});

// Image Upload & AI Detection History
app.post('/api/deteksi-pmk', upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const { rate, ai_summary, type } = req.body;
    let historyId = null;
    const imagePath = '/uploads/' + req.file.filename;

    if (req.session.userId && rate) {
        const date = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        const result = await db.run(
            'INSERT INTO history (user_id, rate, date, type, image_path, ai_summary) VALUES (?, ?, ?, ?, ?, ?)',
            [req.session.userId, parseInt(rate), date, type || 'AI MobileNet', imagePath, ai_summary || '']
        );
        historyId = result.lastID;
    }

    res.json({ 
        success: true, 
        message: 'Image uploaded and history saved', 
        filename: req.file.filename,
        imagePath,
        historyId
    });
});

// Storage for saving TFJS model
const modelStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, 'public', 'model');
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname === 'model.json' ? 'model.json' : 'model.weights.bin');
    }
});
const uploadModel = multer({ storage: modelStorage });

app.post('/api/save-model', uploadModel.fields([
    { name: 'model.json', maxCount: 1 },
    { name: 'model.weights.bin', maxCount: 1 }
]), (req, res) => {
    console.log('Model saved successfully to public/model/');
    res.json({ success: true, message: 'Model saved' });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Catch-all for frontend (must be last)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
        if (err) {
            res.status(404).json({ error: 'Endpoint not found or frontend not built' });
        }
    });
});
