const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

let db = null;

// Export a start function that receives the database path
function start(dbPath) {
    // Connect to the SQLite database file
    db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error('Database connection error:', err.message);
            // If the database connection fails, throw an error to signal the failure
            throw new Error('Failed to open the database: ' + err.message);
        } else {
            console.log('Connected to the SQLite database successfully.');
        }
    });

    // API endpoint for searching addresses
    app.get('/search', (req, res) => {
        if (!db) {
            return res.status(500).json({ message: 'Database connection is not available.' });
        }

        const query = req.query.q;
        if (!query || query.length < 2) {
            return res.status(400).json({ message: 'Search query is too short.' });
        }

        const searchQuery = `%${query.toLowerCase().trim()}%`;
        const sql = `
            SELECT number, street, city, postcode
            FROM addresses
            WHERE 
                LOWER(number) LIKE ? OR
                LOWER(street) LIKE ? OR
                LOWER(city) LIKE ? OR
                LOWER(postcode) LIKE ?
            LIMIT 100
        `;

        db.all(sql, [searchQuery, searchQuery, searchQuery, searchQuery], (err, rows) => {
            if (err) {
                console.error('Database query error:', err.message);
                // Return a specific error message for database query failures
                return res.status(500).json({ message: 'Database query failed.' });
            }
            
            // Send back an empty array if no rows are found or if the result is not an array
            if (!Array.isArray(rows)) {
                console.error('Database query returned an invalid result.');
                return res.json([]);
            }

            res.json(rows);
        });
    });

    app.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
    });
}

module.exports = {
    start
};