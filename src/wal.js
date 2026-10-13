// wal.js
const fs = require('fs');

class WAL {
    constructor(filePath) {
        this.filePath = filePath;
        // Ensure log file exists
        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, '');
        }
    }

    append(type, key, value) {
        const record = JSON.stringify({ type, key, value, timestamp: Date.now() }) + '\n';
        fs.appendFileSync(this.filePath, record, 'utf8');
    }

    readAll() {
        const content = fs.readFileSync(this.filePath, 'utf8');
        if (!content.trim()) return [];
        return content.trim().split('\n').map(line => JSON.parse(line));
    }

    clear() {
        fs.writeFileSync(this.filePath, '');
    }
}

module.exports = WAL;
