const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'conform.db'), (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the SQLite database');
    
    // Create users table if it doesn't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        healthcare_title TEXT NOT NULL,
        hospital_system TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
});

// Routes
app.post('/api/signup', (req, res) => {
  const { name, email, healthcareTitle, hospitalSystem } = req.body;
  
  if (!name || !email || !healthcareTitle || !hospitalSystem) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  const sql = `INSERT INTO users (name, email, healthcare_title, hospital_system) 
               VALUES (?, ?, ?, ?)`;
  
  db.run(sql, [name, email, healthcareTitle, hospitalSystem], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Email already registered' });
      }
      return res.status(500).json({ error: err.message });
    }
    
    res.status(201).json({ 
      message: 'User registered successfully',
      userId: this.lastID 
    });
  });
});

app.post('/api/login', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  const sql = `SELECT id, name, email, healthcare_title, hospital_system 
               FROM users WHERE email = ?`;
  
  db.get(sql, [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    res.json({ 
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        healthcareTitle: user.healthcare_title,
        hospitalSystem: user.hospital_system
      }
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Close database connection on process exit
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed');
    process.exit(0);
  });
}); 