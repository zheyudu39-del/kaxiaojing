/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/resourceService.ts

import { getDb } from '../db/database';
import path from 'path';

class ResourceService {
    uploadResource(userId, data, file) {
        const db = getDb();
        if (!data.title?.trim())
            throw new Error('TITLE_EMPTY');
        const ext = path.extname(file.originalname).toLowerCase();
        const result = db.prepare(`
      INSERT INTO resources (user_id, competition_id, title, description, file_name, file_path, file_type, file_size, is_external, review_status)
      VALUES (@userId, @competitionId, @title, @description, @fileName, @filePath, @fileType, @fileSize, 0, 'approved')
    `).run({
            userId, competitionId: data.competition_id, title: data.title,
            description: data.description || '', fileName: file.originalname,
            filePath: file.path, fileType: ext || file.mimetype, fileSize: file.size,
        });
        return db.prepare(`
      SELECT r.*, u.username as uploader_username, c.name as competition_name
      FROM resources r JOIN users u ON r.user_id = u.id JOIN competitions c ON r.competition_id = c.id
      WHERE r.id = @id
    `).get({ id: result.lastInsertRowid });
    }
    listResources(filters) {
        const db = getDb();
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 20;
        const offset = (page - 1) * pageSize;
        let where = "WHERE r.review_status = 'approved' AND r.deleted_at IS NULL";
        const params = { limit: pageSize, offset };
        if (filters.competition_id) {
            where += ' AND r.competition_id = @competitionId';
            params.competitionId = filters.competition_id;
        }
        if (filters.keyword) {
            where += ' AND (r.title LIKE @keyword OR r.description LIKE @keyword)';
            params.keyword = `%${filters.keyword}%`;
        }
        const total = db.prepare(`SELECT COUNT(*) as count FROM resources r ${where}`).get(params);
        const resources = db.prepare(`
      SELECT r.*, u.username as uploader_username, c.name as competition_name
      FROM resources r JOIN users u ON r.user_id = u.id JOIN competitions c ON r.competition_id = c.id
      ${where} ORDER BY r.created_at DESC LIMIT @limit OFFSET @offset
    `).all(params);
        return { resources, total: total.count };
    }
    downloadResource(resourceId) {
        const db = getDb();
        const resource = db.prepare('SELECT id, file_path, file_name, is_external, external_url FROM resources WHERE id = @id AND deleted_at IS NULL').get({ id: resourceId });
        if (!resource)
            return null;
        db.prepare('UPDATE resources SET download_count = download_count + 1 WHERE id = @id').run({ id: resourceId });
        if (resource.is_external) {
            return { filePath: '', fileName: resource.file_name, isExternal: true, externalUrl: resource.external_url };
        }
        return { filePath: resource.file_path, fileName: resource.file_name, isExternal: false };
    }
    deleteResource(resourceId, userId) {
        const db = getDb();
        const resource = db.prepare('SELECT id, user_id, file_path, is_external FROM resources WHERE id = @id AND deleted_at IS NULL').get({ id: resourceId });
        if (!resource)
            return false;
        if (resource.user_id !== userId)
            throw new Error('FORBIDDEN');
        db.prepare("UPDATE resources SET deleted_at = datetime('now') WHERE id = @id").run({ id: resourceId });
        return true;
    }
    rateResource(resourceId, userId, rating) {
        const db = getDb();
        // 注意：直接用 `rating < 1 || rating > 5` 无法拦住 undefined/字符串，
        // 因为 undefined 与数字比较恒为 false，会绕过校验直接写库导致 500。
        const r = Number(rating);
        if (!Number.isFinite(r) || r < 1 || r > 5)
            throw new Error('INVALID_RATING');
        const resource = db.prepare('SELECT id FROM resources WHERE id = @id AND deleted_at IS NULL').get({ id: resourceId });
        if (!resource)
            throw new Error('NOT_FOUND');
        const existing = db.prepare('SELECT id FROM resource_ratings WHERE resource_id = @resourceId AND user_id = @userId').get({ resourceId, userId });
        if (existing) {
            db.prepare('UPDATE resource_ratings SET rating = @rating WHERE resource_id = @resourceId AND user_id = @userId').run({ rating, resourceId, userId });
        }
        else {
            try {
                db.prepare('INSERT INTO resource_ratings (resource_id, user_id, rating) VALUES (@resourceId, @userId, @rating)').run({ resourceId, userId, rating });
            }
            catch (err) {
                if (err.message && err.message.includes('UNIQUE constraint failed')) {
                    throw new Error('DUPLICATE');
                }
                throw err;
            }
        }
        const avg = db.prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM resource_ratings WHERE resource_id = @resourceId').get({ resourceId });
        return { avg_rating: Math.round(avg.avg_rating * 10) / 10, count: avg.count };
    }
    getResourceRating(resourceId, userId) {
        const db = getDb();
        const avg = db.prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM resource_ratings WHERE resource_id = @resourceId').get({ resourceId });
        let userRating = null;
        if (userId) {
            const ur = db.prepare('SELECT rating FROM resource_ratings WHERE resource_id = @resourceId AND user_id = @userId').get({ resourceId, userId });
            userRating = ur?.rating || null;
        }
        return { avg_rating: avg.avg_rating ? Math.round(avg.avg_rating * 10) / 10 : 0, count: avg.count || 0, user_rating: userRating };
    }
}
export const resourceService: ResourceService = new ResourceService();