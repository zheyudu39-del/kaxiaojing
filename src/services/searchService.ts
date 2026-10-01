/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/searchService.ts

import { getDb } from '../db/database';

// ===== 类型定义（自 .d.ts 还原）=====
export interface SearchResult {
    type: 'competition' | 'post' | 'resource';
    id: number;
    title: string;
    description: string;
    relevance: number;
}

export class SearchService {
    search(keyword: string, types: string[] = ['competition', 'post', 'resource']): SearchResult[] {
        if (!keyword || !keyword.trim()) {
            return [];
        }
        const db = getDb();
        const like = `%${keyword}%`;
        const results = [];
        if (types.includes('competition')) {
            const rows = db.prepare(`
        SELECT id, name, description,
          CASE WHEN name LIKE @like THEN 2 ELSE 1 END as relevance
        FROM competitions
        WHERE deleted_at IS NULL AND (name LIKE @like OR description LIKE @like)
      `).all({ like });
            for (const row of rows) {
                results.push({
                    type: 'competition',
                    id: row.id,
                    title: row.name,
                    description: row.description || '',
                    relevance: row.relevance,
                });
            }
        }
        if (types.includes('post')) {
            const rows = db.prepare(`
        SELECT id, title, content,
          CASE WHEN title LIKE @like THEN 2 ELSE 1 END as relevance
        FROM posts
        WHERE deleted_at IS NULL AND (title LIKE @like OR content LIKE @like)
      `).all({ like });
            for (const row of rows) {
                results.push({
                    type: 'post',
                    id: row.id,
                    title: row.title,
                    description: row.content || '',
                    relevance: row.relevance,
                });
            }
        }
        if (types.includes('resource')) {
            const rows = db.prepare(`
        SELECT id, title, description,
          CASE WHEN title LIKE @like THEN 2 ELSE 1 END as relevance
        FROM resources
        WHERE deleted_at IS NULL AND (title LIKE @like OR description LIKE @like)
      `).all({ like });
            for (const row of rows) {
                results.push({
                    type: 'resource',
                    id: row.id,
                    title: row.title,
                    description: row.description || '',
                    relevance: row.relevance,
                });
            }
        }
        // Sort by relevance descending
        results.sort((a, b) => b.relevance - a.relevance);
        return results;
    }
}
export const searchService: SearchService = new SearchService();