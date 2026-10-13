// index.js
const fs = require('fs');
const path = require('./db');
const MiniLevelDB = require('./db');

// Setup clean data directory
const dataDir = './mydb_data';
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const db = new MiniLevelDB(dataDir);

console.log('--- Inserting Key-Value Pairs ---');
db.put('apple', 'red fruit');
db.put('banana', 'yellow fruit');
db.put('cherry', 'small red fruit'); // Hits maxMemSize=3 -> Triggers disk flush!

db.put('date', 'sweet fruit');
db.put('elderberry', 'purple fruit');

console.log('\n--- Reading Values ---');
console.log('Get apple (from disk SSTable):', db.get('apple'));
console.log('Get elderberry (from MemTable):', db.get('elderberry'));
console.log('Get non-existent key:', db.get('zebra'));
