// memtable.js
class MemTable {
    constructor() {
        this.map = new Map();
    }

    put(key, value) {
        this.map.set(key, value);
    }

    get(key) {
        return this.map.get(key);
    }

    has(key) {
        return this.map.has(key);
    }

    size() {
        return this.map.size;
    }

    clear() {
        this.map.clear();
    }

    // Returns entries sorted lexicographically by key
    entries() {
        return Array.from(this.map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    }
}

module.exports = MemTable;
