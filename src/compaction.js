// compaction.js
const fs = require('fs');
const SSTable = require('./sstable');

class Compactor {
    static compact(sstableFiles, outputFilePath) {
        const masterMap = new Map();

        // Read all entries from existing SSTables (older files first, newer override)
        for (const file of sstableFiles) {
            if (!fs.existsSync(file)) continue;
            const content = fs.readFileSync(file, 'utf8');
            for (const line of content.trim().split('\n')) {
                if (!line) continue;
                const { key, value } = JSON.parse(line);
                if (value === null) {
                    masterMap.delete(key); // Handle tombstones (deletions)
                } else {
                    masterMap.set(key, value);
                }
            }
        }

        const sortedEntries = Array.from(masterMap.entries()).sort((a, b) => 
            a[0].localeCompare(b[0])
        );

        // Write out a clean, compacted single SSTable
        return SSTable.create(outputFilePath, sortedEntries);
    }
}

module.exports = Compactor;
