/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/notificationService.ts

import { getDb } from '../db/database';
import { pushNotification } from '../socket/index';

class NotificationService {
    createNotification(userId, type, title, content, relatedId) {
        const db = getDb();
        const result = db.prepare('INSERT INTO notifications (user_id, type, title, content, related_id) VALUES (@userId, @type, @title, @content, @relatedId)').run({ userId, type, title, content, relatedId: relatedId || null });
        pushNotification(userId, {
            id: result.lastInsertRowid,
            type,
            title,
            content,
            related_id: relatedId || null,
            is_read: 0,
            created_at: new Date().toISOString(),
        });
    }
    createBroadcast(title, content) {
        const db = getDb();
        const users = db.prepare('SELECT id FROM users').all();
        // 使用事务批量插入，避免每条 INSERT 都写一次文件（防止数据库损坏）
        db.runInTransaction(() => {
            for (const u of users) {
                db.prepare('INSERT INTO notifications (user_id, type, title, content) VALUES (@userId, @type, @title, @content)').run({ userId: u.id, type: 'system_announcement', title, content });
            }
        });
    }
    getNotifications(userId, page = 1, pageSize = 20) {
        const db = getDb();
        const offset = (page - 1) * pageSize;
        const total = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = @userId').get({ userId });
        const unread = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = @userId AND is_read = 0').get({ userId });
        const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = @userId ORDER BY created_at DESC LIMIT @limit OFFSET @offset').all({ userId, limit: pageSize, offset });
        return { notifications, total: total.count, unread_count: unread.count };
    }
    markAsRead(notificationId, userId) {
        const db = getDb();
        const n = db.prepare('SELECT id, user_id FROM notifications WHERE id = @id').get({ id: notificationId });
        if (!n)
            return false;
        if (n.user_id !== userId)
            throw new Error('FORBIDDEN');
        db.prepare('UPDATE notifications SET is_read = 1 WHERE id = @id').run({ id: notificationId });
        return true;
    }
    markAllAsRead(userId) {
        const db = getDb();
        db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = @userId AND is_read = 0').run({ userId });
    }
    getUnreadCount(userId) {
        const db = getDb();
        const result = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = @userId AND is_read = 0').get({ userId });
        return result.count;
    }
    deleteNotification(notificationId, userId) {
        const db = getDb();
        const n = db.prepare('SELECT id, user_id FROM notifications WHERE id = @id').get({ id: notificationId });
        if (!n)
            return false;
        if (n.user_id !== userId)
            throw new Error('FORBIDDEN');
        db.prepare('DELETE FROM notifications WHERE id = @id').run({ id: notificationId });
        return true;
    }
    deleteNotifications(ids, userId) {
        const db = getDb();
        let count = 0;
        for (const id of ids) {
            const result = db.prepare('DELETE FROM notifications WHERE id = @id AND user_id = @userId').run({ id, userId });
            count += result.changes;
        }
        return count;
    }
    deleteAllNotifications(userId) {
        const db = getDb();
        const result = db.prepare('DELETE FROM notifications WHERE user_id = @userId').run({ userId });
        return result.changes;
    }
    deleteReadNotifications(userId) {
        const db = getDb();
        const result = db.prepare('DELETE FROM notifications WHERE user_id = @userId AND is_read = 1').run({ userId });
        return result.changes;
    }
}
export const notificationService: NotificationService = new NotificationService();