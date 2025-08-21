const fs = require('fs');
const readline = require('readline');

const inputFile = 'cleaned_addresses.csv';
const outputFile = 'cleaned_addresses2.csv';

const reader = readline.createInterface({
    input: fs.createReadStream(inputFile),
    crlfDelay: Infinity
});

const writer = fs.createWriteStream(outputFile);
let isFirstRow = true;
let isPaused = false;
let pending = 0;

reader.on('line', (line) => {
    // Check if the line is not blank
    if (line.trim().length > 0) {
        if (isFirstRow) {
            writer.write(line);
            isFirstRow = false;
        } else {
            writer.write('\n' + line);
        }
        
        // This is the key change: check if the writer buffer is full
        pending++;
        if (!writer.writable) { // Check if the writer stream is full
            reader.pause();
            isPaused = true;
        }
    }
});

writer.on('drain', () => {
    // The drain event is emitted when the writer's buffer is empty
    if (isPaused) {
        reader.resume();
        isPaused = false;
    }
});

reader.on('close', () => {
    writer.end();
    console.log(`Successfully cleaned the file. The new file is ${outputFile}`);
});

reader.on('error', (err) => {
    console.error('Error reading file:', err);
    writer.end();
});

writer.on('error', (err) => {
    console.error('Error writing file:', err);
    writer.end();
});