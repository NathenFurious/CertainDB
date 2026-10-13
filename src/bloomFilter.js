// bloomfilter.js
class BloomFilter {
    constructor(size = 100) {
        this.size = size;
        this.bitArray = new Uint8Array(size);
    }

    _hash(str, seed) {
        let hash = seed;
        for (let i = 0; i < str.length; i++) {
            hash = (hash * 31 + str.charCodeAt(i)) % this.size;
        }
        return hash;
    }

    add(key) {
        this.bitArray[this._hash(key, 7)] = 1;
        this.bitArray[this._hash(key, 13)] = 1;
    }

    mightContain(key) {
        return (
            this.bitArray[this._hash(key, 7)] === 1 &&
            this.bitArray[this._hash(key, 13)] === 1
        );
    }
}

module.exports = BloomFilter;
