/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/competitionService.ts

import { getDb } from '../db/database';
import { cacheService } from './cacheService';

// ===== 类型定义（自 .d.ts 还原）=====
export interface Competition {
    id: number;
    name: string;
    category: string;
    description: string;
    target_audience: string;
    fee: string;
    format: string;
    reg_start_month: number;
    reg_end_month: number | null;
    requirements: string;
}
export interface CompetitionFilters {
    category?: string;
    month?: number;
    keyword?: string;
    page?: number;
    pageSize?: number;
}

export class CompetitionService {
    list(filters: CompetitionFilters = {}): { competitions: Competition[]; total: number; page: number; pageSize: number; } {
        const cacheKey = `competitions:list:${JSON.stringify(filters)}`;
        const cached = cacheService.get(cacheKey);
        if (cached)
            return cached;
        const db = getDb();
        const conditions = [];
        const params = {};
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 20;
        conditions.push('deleted_at IS NULL');
        if (filters.category) {
            conditions.push('category = @category');
            params.category = filters.category;
        }
        if (filters.keyword) {
            conditions.push('(name LIKE @keyword OR category LIKE @keyword)');
            params.keyword = `%${filters.keyword}%`;
        }
        if (filters.month !== undefined && filters.month !== null) {
            conditions.push(`(
          (reg_end_month IS NULL AND reg_start_month = @month)
          OR (reg_end_month IS NOT NULL AND reg_start_month <= reg_end_month AND reg_start_month <= @month AND @month <= reg_end_month)
          OR (reg_end_month IS NOT NULL AND reg_start_month > reg_end_month AND (@month >= reg_start_month OR @month <= reg_end_month))
        )`);
            params.month = filters.month;
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const countSql = `SELECT COUNT(*) as total FROM competitions ${whereClause}`;
        const total = db.prepare(countSql).get(params).total;
        params.limit = pageSize;
        params.offset = (page - 1) * pageSize;
        const sql = `SELECT * FROM competitions ${whereClause} ORDER BY id LIMIT @limit OFFSET @offset`;
        const competitions = db.prepare(sql).all(params);
        const result = { competitions, total, page, pageSize };
        cacheService.set(cacheKey, result, 300000); // 5 minute TTL
        return result;
    }
    getById(id: number): Competition | null {
        const db = getDb();
        const competition = db.prepare('SELECT * FROM competitions WHERE id = @id AND deleted_at IS NULL').get({ id });
        return competition || null;
    }
    getCategories(): string[] {
        const db = getDb();
        const rows = db.prepare('SELECT DISTINCT category FROM competitions WHERE deleted_at IS NULL ORDER BY category').all();
        return rows.map(r => r.category);
    }
    getRelated(id: number, limit: number = 5): Competition[] {
        const db = getDb();
        const comp = this.getById(id);
        if (!comp)
            return [];
        return db.prepare('SELECT * FROM competitions WHERE category = @category AND id != @id AND deleted_at IS NULL ORDER BY RANDOM() LIMIT @limit')
            .all({ category: comp.category, id, limit });
    }
    getDeadlineSoon(days: number = 30): Competition[] {
        const db = getDb();
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        // 获取当前月份或下个月报名截止的竞赛
        const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        return db.prepare(`
      SELECT * FROM competitions
      WHERE deleted_at IS NULL AND reg_end_month IS NOT NULL AND (reg_end_month = @currentMonth OR reg_end_month = @nextMonth)
      ORDER BY reg_end_month ASC LIMIT 10
    `).all({ currentMonth, nextMonth });
    }
}
export const competitionService: CompetitionService = new CompetitionService();