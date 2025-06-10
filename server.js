const express = require('express');
const mysql = require('mysql2'); // Switch to promise-based API

const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const fs = require('fs');



const app = express();
const PORT = 8001; // Change this to any available port

// Set up MySQL connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "harshu", // Update with your actual password
    database: "loginDB" // Update with your database name
});

// Middleware setup
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname))); // Serve static files from the root directory

// Initialize session middleware
app.use(session({
    secret: 'my_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Database connection error: ' + err.stack);
        return;
    }
    console.log('Connected to the database.');
});

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }); // Create the multer instance

// Handle user registration
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    const checkQuery = 'SELECT * FROM users WHERE username = ?';
    db.query(checkQuery, [username], (err, results) => {
        if (err) {
            console.error('Query error: ', err);
            return res.status(500).send('Server error: ' + err.message);
        }

        if (results.length > 0) {
            res.send(`<script>alert('Username already exists! Choose another one.'); window.location.href = '/';</script>`);
        } else {
            const insertQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
            db.query(insertQuery, [username, email, password], (err) => {
                if (err) {
                    console.error('Query error: ', err);
                    return res.status(500).send('Registration error: ' + err.message);
                }
                res.send(`<script>alert('User registered successfully!'); window.location.href = '/';</script>`);
            });
        }
    });
});

// Handle user login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check if the username is 'iam_admin'
    if (username === 'iam_admin' && password === 'admin') {
        // Set the user session for admin
        req.session.user = { username: 'iam_admin' };
        console.log('Admin user session set successfully:', req.session.user);
        return res.redirect('/admin.html'); // Redirect to admin page directly
    }

    // If not admin, proceed to check the database
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Query error: ', err);
            return res.status(500).send('Login error: ' + err.message);
        }
        if (results.length > 0) {
            req.session.user = { username: results[0].username };
            console.log('User session set successfully:', req.session.user);
            res.redirect('/mainpage.html'); // Redirect to main page for regular users
        } else {
            res.send(`<script>alert('Invalid Username or password!'); window.location.href = '/';</script>`);
        }
    });
});

// API endpoint to get the session data (username)
app.get('/session', (req, res) => {
    if (req.session.user) {
        res.json({ username: req.session.user.username }); // Return the username if logged in
    } else {
        res.json({ username: 'Guest' }); // Return 'Guest' if no user is logged in
    }
});

// API endpoint to get all users
app.get('/api/users', (req, res) => {
    const query = 'SELECT id, username, email, password FROM users';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Query error: ', err);
            return res.status(500).send('Error fetching users: ' + err.message);
        }
        res.json(results); // Send back user data as JSON
    });
});


// API endpoint to delete a user
app.delete('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    const deleteQuery = 'DELETE FROM users WHERE id = ?';
    db.query(deleteQuery, [userId], (err, results) => {
        if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).send('Error deleting user');
        }
        if (results.affectedRows > 0) {
            res.status(204).send(); // Successfully deleted
        } else {
            res.status(404).send({ error: 'User not found' });
        }
    });
});

// Serve the login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the main page for logged-in users
app.get('/mainpage.html', (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, 'mainpage.html'));
    } else {
        res.redirect('/');
    }
});

// Serve the admin page
app.get('/admin.html', (req, res) => {
    if (req.session.user && req.session.user.username === 'iam_admin') {
        res.sendFile(path.join(__dirname, 'admin.html'));
    } else {
        res.redirect('/');
    }
});

// Handle logout
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/mainpage.html');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

// Handle file upload and save to the database
app.post('/upload', upload.single('file'), (req, res) => {
    const { filename } = req.body; // Get the filename from the form
    const fileData = req.file ? req.file.buffer : null; // Get the file data as a buffer from multer

    if (!fileData) {
        console.error('No file uploaded or error in file upload.');
        return res.status(400).send('No file uploaded or error in file upload.');
    }

    // SQL query to insert file data into the database
    const insertQuery = 'INSERT INTO pdf_files (filename, file_data) VALUES (?, ?)';
    db.query(insertQuery, [filename, fileData], (err) => {
        if (err) {
            console.error('Error inserting file into database:', err);
            return res.status(500).send('Error uploading file.');
        }
        res.send(`<script>alert('File uploaded successfully!'); window.location.href = '/admin.html';</script>`);
    });
});

// Endpoint to fetch all PDF files
app.get('/api/files', (req, res) => {
    const query = 'SELECT id, filename FROM pdf_files';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching files:', err);
            return res.status(500).send('Error retrieving files from the database.');
        }
        res.json(results); // Send the list of files as JSON response
    });
});

// API endpoint to download a file by its ID
app.get('/download/:id', (req, res) => {
    const fileId = req.params.id;
    const query = 'SELECT filename, file_data FROM pdf_files WHERE id = ?';

    db.query(query, [fileId], (err, results) => {
        if (err || results.length === 0) {
            console.error('Error retrieving file:', err);
            return res.status(404).send('File not found.');
        }

        const file = results[0];
        res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.send(file.file_data);
    });
});

// API endpoint to delete a study material by ID
app.delete('/api/files/:id', (req, res) => {
    const fileId = req.params.id;
    const deleteQuery = 'DELETE FROM pdf_files WHERE id = ?';
    db.query(deleteQuery, [fileId], (err, results) => {
        if (err) {
            console.error('Error deleting file:', err);
            return res.status(500).send('Error deleting file');
        }
        if (results.affectedRows > 0) {
            res.status(204).send(); // Successfully deleted
        } else {
            res.status(404).send({ error: 'File not found' });
        }
    });
});

// Handle feedback form submission
app.post('/submit-feedback', (req, res) => {
    const { name, feedback } = req.body;

    console.log('Received feedback:', req.body); // Debugging line to check received data

    // Insert feedback into the database
    const insertQuery = 'INSERT INTO feedback (name, feedback) VALUES (?, ?)';
    db.query(insertQuery, [name, feedback], (err) => {
        if (err) {
            console.error('Error saving feedback:', err);
            return res.status(500).send('Error saving feedback. Please try again later.');
        }
        // Respond with a success message to avoid page redirection
        res.status(200).send('Feedback submitted successfully!');
    });
});

// API endpoint to delete a study material by ID
app.delete('/api/files/:id', (req, res) => {
    const fileId = req.params.id;
    const deleteQuery = 'DELETE FROM pdf_files WHERE id = ?';
    db.query(deleteQuery, [fileId], (err, results) => {
        if (err) {
            console.error('Error deleting file:', err);
            return res.status(500).send('Error deleting file');
        }
        if (results.affectedRows > 0) {
            res.status(204).send(); // Successfully deleted
        } else {
            res.status(404).send({ error: 'File not found' });
        }
    });
});





// Start the server
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});
