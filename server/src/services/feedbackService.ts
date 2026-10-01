/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/feedbackService.ts

import { getDb } from '../db/database';

// ===== 类型定义（自 .d.ts 还原）=====
export interface Feedback {
    id: number;
    user_id: number | null;
    type: 'suggestion' | 'bug' | 'complaint' | 'other';
    title: string;
    content: string;
    contact: string | null;
    status: 'pending' | 'processing' | 'resolved' | 'closed';
    admin_reply: string | null;
    replied_at: string | null;
    created_at: string;
}

class FeedbackService {
    create(userId, data) {
        if (!data.title?.trim())
            throw new Error('TITLE_EMPTY');
        if (!data.content?.trim())
            throw new Error('CONTENT_EMPTY');
        const db = getDb();
        const result = db.prepare(`
      INSERT INTO user_feedback (user_id, type, title, content, contact)
      VALUES (@userId, @type, @title, @content, @contact)
    `).run({
            userId: userId || null,
            type: data.type || 'suggestion',
            title: data.title.trim(),
            content: data.content.trim(),
            contact: data.contact?.trim() || null
        });
        return this.getById(result.lastInsertRowid);
    }
    getById(id) {
        const db = getDb();
        return db.prepare('SELECT * FROM user_feedback WHERE id = @id').get({ id });
    }
    getUserFeedbacks(userId, page = 1, pageSize = 20) {
        const db = getDb();
        const offset = (page - 1) * pageSize;
        const total = db.prepare('SELECT COUNT(*) as count FROM user_feedback WHERE user_id = @userId').get({ userId });
        const feedbacks = db.prepare(`
      SELECT * FROM user_feedback WHERE user_id = @userId
      ORDER BY created_at DESC LIMIT @limit OFFSET @offset
    `).all({ userId, limit: pageSize, offset });
        return { feedbacks, total: total.count };
    }
    // 管理员方法
    listAll(filters) {
        const db = getDb();
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 20;
        const offset = (page - 1) * pageSize;
        let where = '1=1';
        const params = { limit: pageSize, offset };
        if (filters.status) {
            where += ' AND status = @status';
            params.status = filters.status;
        }
        if (filters.type) {
            where += ' AND type = @type';
            params.type = filters.type;
        }
        const total = db.prepare(`SELECT COUNT(*) as count FROM user_feedback WHERE ${where}`).get(params);
        const feedbacks = db.prepare(`
      SELECT f.*, u.username FROM user_feedback f
      LEFT JOIN users u ON f.user_id = u.id
      WHERE ${where}
      ORDER BY f.created_at DESC LIMIT @limit OFFSET @offset
    `).all(params);
        return { feedbacks, total: total.count };
    }
    updateStatus(id, status) {
        const db = getDb();
        db.prepare('UPDATE user_feedback SET status = @status WHERE id = @id').run({ id, status });
        return this.getById(id);
    }
    reply(id, adminReply) {
        const db = getDb();
        db.prepare(`
      UPDATE user_feedback SET admin_reply = @adminReply, replied_at = datetime('now'), status = 'resolved'
      WHERE id = @id
    `).run({ id, adminReply });
        return this.getById(id);
    }
}
export const feedbackService: FeedbackService = new FeedbackService();