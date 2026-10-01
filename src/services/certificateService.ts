/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/certificateService.ts

import { getDb } from '../db/database';

class CertificateService {
    list(params) {
        const db = getDb();
        let sql = 'SELECT * FROM certificates WHERE 1=1';
        const binds = {};
        if (params.category) {
            sql += ' AND category = @category';
            binds.category = params.category;
        }
        if (params.keyword) {
            sql += ' AND (name LIKE @kw OR description LIKE @kw)';
            binds.kw = `%${params.keyword}%`;
        }
        if (params.difficulty) {
            sql += ' AND difficulty = @difficulty';
            binds.difficulty = params.difficulty;
        }
        const page = params.page || 1;
        const pageSize = params.pageSize || 20;
        sql += ' ORDER BY category, id LIMIT @pageSize OFFSET @offset';
        binds.pageSize = pageSize;
        binds.offset = (page - 1) * pageSize;
        return db.prepare(sql).all(binds);
    }
    getById(id) {
        const db = getDb();
        return db.prepare('SELECT * FROM certificates WHERE id = @id').get({ id });
    }
    getCategories() {
        const db = getDb();
        const rows = db.prepare('SELECT DISTINCT category FROM certificates ORDER BY category').all();
        return rows.map(r => r.category);
    }
}
export const certificateService: CertificateService = new CertificateService();