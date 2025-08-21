const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('addresses.db');
const csvFilePath = path.join(__dirname, 'cleaned_addresses2.csv');

async function importData() {
    return new Promise(async (resolve, reject) => {
        db.serialize(async () => {
            db.run("DROP TABLE IF EXISTS addresses", (err) => {
                if (err) return reject(err);
            });
            db.run(`
                CREATE TABLE addresses (
                    number TEXT,
                    street TEXT,
                    city TEXT,
                    postcode TEXT,
                    full_address TEXT
                )
            `, (err) => {
                if (err) return reject(err);
                console.log('Table created. Starting import...');
            });
            
            let totalCount = 0;
            const batchSize = 5000;
            let batch = [];
            
            const stream = fs.createReadStream(csvFilePath).pipe(csv());
            
            stream.on('data', async (row) => {
                batch.push(row);
                if (batch.length >= batchSize) {
                    stream.pause();
                    await processBatch(batch);
                    batch = [];
                    stream.resume();
                }
            });
            
            stream.on('end', async () => {
                if (batch.length > 0) {
                    await processBatch(batch);
                }
                
                console.log(`Successfully imported ${totalCount} rows.`);
                db.close();
                resolve();
            });
            
            stream.on('error', (err) => {
                console.error('Stream error:', err);
                db.close();
                reject(err);
            });
            
            async function processBatch(currentBatch) {
                return new Promise((resolve, reject) => {
                    db.run('BEGIN TRANSACTION', (beginErr) => {
                        if (beginErr) return reject(beginErr);
                        
                        currentBatch.forEach(row => {
                            const { number, street, city, postcode, full_address } = row;
                            db.run("INSERT INTO addresses VALUES (?, ?, ?, ?, ?)", [number, street, city, postcode, full_address], (err) => {
                                if (err) console.error('Error inserting row:', err);
                            });
                        });

                        db.run('COMMIT', (commitErr) => {
                            if (commitErr) return reject(commitErr);
                            totalCount += currentBatch.length;
                            console.log(`Processed ${totalCount} rows...`);
                            resolve();
                        });
                    });
                });
            }
        });
    });
}

importData()
    .catch(err => {
        console.error('Import process failed:', err);
    });