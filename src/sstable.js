// sstable.js
const fs = require('fs');
const BloomFilter = require('./bloomfilter');

class SSTable {
    constructor(filePath) {
        this.filePath = filePath;
        this.bloomFilter = new BloomFilter();
        this.index = []; // Array of { key, offset }
    }

    static create(filePath, sortedEntries) {
        const sstable = new SSTable(filePath);
        let currentOffset = 0;
        const dataLines = [];

        for (const [key, value] of sortedEntries) {
            sstable.bloomFilter.add(key);
            const line = JSON.stringify({ key, value }) + '\n';
            
            sstable.index.push({ key, offset: currentOffset });
            currentOffset += Buffer.byteLength(line, 'utf8');
            dataLines.push(line);
        }

        // Write data block to disk
        fs.writeFileSync(filePath, dataLines.join(''), 'utf8');
        return sstable;
    }

    get(key) {
        if (!this.bloomFilter.mightContain(key)) {
            return null; // Definitely not in this file
        }

        // Binary search the index for the key
        let low = 0;
        let high = this.index.length - 1;
        let targetOffset = -1;

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            if (this.index[mid].key === key) {
                targetOffset = this.index[mid].offset;
                break;
            } else if (this.index[mid].key < key) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }

        if (targetOffset === -1) return null;

        // Read specific bytes from the file using offset
        const fd = fs.openSync(this.filePath, 'r');
        const buffer = Buffer.alloc(1024);
        const bytesRead = fs.readSync(fd, buffer, 0, 1024, targetOffset);
        fs.closeSync(fd);

        const line = buffer.toString('utf8', 0, bytesRead).split('\n')[0];
        if (!line) return null;
        
        const parsed = JSON.parse(line);
        return parsed.key === key ? parsed.value : null;
    }
}

module.exports = SSTable;
