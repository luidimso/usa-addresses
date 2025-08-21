const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

// Connect to the SQLite database file
const db = new sqlite3.Database(path.join(__dirname, 'addresses.db'), (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// API endpoint for searching addresses
app.get('/search', (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ message: 'Search query is required.' });
    }

    const searchQuery = `%${query.toLowerCase().trim()}%`;
    const sql = `
        SELECT number, street, city, postcode, full_address
        FROM addresses
        WHERE 
            LOWER(number) LIKE ? OR
            LOWER(street) LIKE ? OR
            LOWER(city) LIKE ? OR
            LOWER(postcode) LIKE ? OR
            LOWER(full_address) LIKE ?
        LIMIT 100
    `;

    db.all(sql, [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery], (err, rows) => {
        if (err) {
            console.error('Database query error:', err.message);
            res.status(500).json({ message: 'Internal server error.' });
            return;
        }

        // Log the results to the console for debugging
        console.log(`Search for '${query}' returned ${rows.length} results.`);
        console.log(rows);

        res.json(rows);
    });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});