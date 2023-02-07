// import CryptoJS from 'crypto-js';
// This code will only be triggered in Node -- the browser has CryptoJS as a global via CDN
var isNode = new Function("try {return this===global;}catch(e){return false;}");
if (isNode()) {
    // nodejs
    console.warn('type of CryptoJS is', typeof CryptoJS);
    var CryptoJS1 = await import('crypto-js');
    var CryptoJS = CryptoJS1.default;
}
else {
    // @ts-ignore
    var CryptoJS = window.CryptoJS;
}
export default class PFRNG {
    serverSeed;
    serverSeedHashed;
    constructor(serverSeed) {
        // Note: client seed is not stored here, but passed with each function call.
        if (typeof serverSeed === 'string') {
            this.serverSeed = serverSeed; // pass in old server seed for verification
        }
        else {
            // serverSeed is null, which means we need to generate it fresh for a new game.
            this.serverSeed = this.randomHash(); // each with its own SS
        }
        this.serverSeedHashed = this.getHash(this.serverSeed);
    }
    randomHash() {
        return this.getHash(Math.random().toString());
    }
    gameGetHMAC(server_seed, client_seed, nonce) {
        const msg = nonce + ':' + client_seed;
        const key = server_seed;
        return this.getHMAC(msg, key);
    }
    getHMAC(msg, key) {
        const msg_str = String(msg);
        const key_str = String(key);
        return CryptoJS.HmacSHA512(msg_str, key_str).toString(CryptoJS.enc.Hex);
    }
    getHash(msg) {
        const msg_str = String(msg);
        return CryptoJS.SHA256(msg_str).toString(CryptoJS.enc.Hex);
    }
    hashToInt(hash, min, max) {
        const base = 16; // our hash is a string of hexadecimal digits	
        const range_desired = max - min;
        const modulo = range_desired + 1; // mod 6 gives range 0-5
        let hex_digits = 1;
        let range_PFRNG = base;
        // Reduce the probability of landing outside the range
        const range_desired_big = range_desired * base; // ie 16x bigger
        while (range_desired_big > range_PFRNG) {
            range_PFRNG = range_PFRNG * base;
            hex_digits += 1;
        }
        let startIndex = 0;
        while (true) {
            let endIndex = startIndex + hex_digits;
            // exhausting the hash is astronomically rare (4x10^-242)
            // ... but, just in case ;)
            if (endIndex > hash.length) {
                const rehash = this.getHMAC(hash, this.serverSeed);
                return this.hashToInt(rehash, min, max);
            }
            // Note: endIndex is not inclusive, so hex_digits == 1 gives substring(0, 1), which will return just the 0th digit.
            let hex_chunk = hash.substring(startIndex, endIndex);
            let generated_number = parseInt(hex_chunk, base);
            const biggest_divisor = Math.floor(range_PFRNG / modulo) * modulo;
            if (generated_number >= biggest_divisor) { // >= is correct, see note above the function.
                // try again, starting with the next hex digit
                startIndex += 1;
                continue;
            }
            return min + generated_number % modulo;
        }
    }
}
