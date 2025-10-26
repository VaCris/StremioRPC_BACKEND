const TTL = 1000 * 60 * 5; // 5 min
const cache = new Map();

export function getCached(key) {
    const entry = cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.ts > TTL) {
        cache.delete(key);
        return null;
    }
    return entry.data;
}

export function setCached(key, data) {
    cache.set(key, { ts: Date.now(), data });
}