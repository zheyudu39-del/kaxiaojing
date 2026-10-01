/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/cacheService.ts

export class CacheService {
    private store;
    private hits;
    private misses;
    constructor() {
        this.store = new Map();
        this.hits = 0;
        this.misses = 0;
    }
    get<T>(key: string): T | null {
        const entry = this.store.get(key);
        if (!entry) {
            this.misses++;
            return null;
        }
        // Lazy expiration: check TTL on read
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            this.misses++;
            return null;
        }
        this.hits++;
        return entry.data;
    }
    set<T>(key: string, data: T, ttlMs: number): void {
        this.store.set(key, {
            data,
            expiresAt: Date.now() + ttlMs,
        });
    }
    /**
     * Invalidate all cache entries whose key starts with the given pattern.
     */
    invalidate(pattern: string): void {
        for (const key of this.store.keys()) {
            if (key.startsWith(pattern)) {
                this.store.delete(key);
            }
        }
    }
    getStats(): { hits: number; misses: number; hitRate: number; size: number; } {
        const total = this.hits + this.misses;
        return {
            hits: this.hits,
            misses: this.misses,
            hitRate: total === 0 ? 0 : this.hits / total,
            size: this.store.size,
        };
    }
    /**
     * Clear the entire cache and reset statistics. Useful for testing.
     */
    clear(): void {
        this.store.clear();
        this.hits = 0;
        this.misses = 0;
    }
}
export const cacheService: CacheService = new CacheService();