// db.js
const path = require('path');
const WAL = require('./wal');
const MemTable = require('./memtable');
const SSTable = require('./sstable');
const Compactor = require('./compaction');

class MiniLevelDB {
    constructor(dataDir = './data') {
        this.dataDir = dataDir;
        this.wal = new WAL(path.join(dataDir, 'wal.log'));
        this.memTable = new MemTable();
        this.sstableFiles = [];
        this.maxMemSize = 3; // Low threshold to showcase flushes quickly
    }

    put(key, value) {
        this.wal.append('PUT', key, value);
        this.memTable.put(key, value);

        if (this.memTable.size() >= this.maxMemSize) {
            this._flush();
        }
    }

    get(key) {
        // 1. Check MemTable
        if (this.memTable.has(key)) {
            return this.memTable.get(key);
        }

        // 2. Check immutable SSTable files (newest to oldest)
        for (let i = this.sstableFiles.length - 1; i >= 0; i--) {
            const table = new SSTable(this.sstableFiles[i]);
            const val = table.get(key);
            if (val !== null) return val;
        }

        return null;
    }

    _flush() {
        const fileName = path.join(this.dataDir, `sstable_${Date.now()}.db`);
        SSTable.create(fileName, this.memTable.entries());
        this.sstableFiles.push(fileName);
        this.memTable.clear();
        this.wal.clear();
        console.log(`[LevelDB Engine] Flushed MemTable to disk: ${fileName}`);

        // Run background compaction if we have more than 2 tables
        if (this.sstableFiles.length >= 3) {
            const compactedName = path.join(this.dataDir, `sstable_compacted_${Date.now()}.db`);
            Compactor.compact(this.sstableFiles, compactedName);
            this.sstableFiles = [compactedName];
            console.log('[LevelDB Engine] Background compaction complete.');
        }
    }
}

module.exports = MiniLevelDB;
