/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/privateMessageService.ts

import { getDb } from '../db/database';

export class PrivateMessageService {
    sendMessage(senderId: number, receiverId: number, content: string): { id: number; sender_id: number; receiver_id: number; content: string; } {
        const db = getDb();
        if (!content || !content.trim())
            throw new Error('消息内容不能为空');
        // 验证接收者存在
        const receiver = db.prepare('SELECT id FROM users WHERE id = @receiverId').get({ receiverId });
        if (!receiver)
            throw new Error('用户不存在');
        const result = db.prepare('INSERT INTO private_messages (sender_id, receiver_id, content) VALUES (@senderId, @receiverId, @content)').run({ senderId, receiverId, content: content.trim() });
        // 创建通知
        const sender = db.prepare('SELECT username FROM users WHERE id = @senderId').get({ senderId });
        db.prepare("INSERT INTO notifications (user_id, type, title, content, related_id) VALUES (@userId, 'private_message', @title, @content, @relatedId)").run({ userId: receiverId, title: `${sender?.username || '用户'}给你发了一条私信`, content: content.trim().substring(0, 50), relatedId: senderId });
        return { id: result.lastInsertRowid, sender_id: senderId, receiver_id: receiverId, content: content.trim() };
    }
    getConversations(userId: number, limit: number = 20): any[] {
        const db = getDb();
        return db.prepare(`
      SELECT 
        CASE WHEN pm.sender_id = @userId THEN pm.receiver_id ELSE pm.sender_id END as other_user_id,
        u.username as other_username,
        u.avatar_url as other_avatar_url,
        pm.content as last_message,
        pm.created_at as last_message_time,
        (SELECT COUNT(*) FROM private_messages pm2 WHERE pm2.sender_id = CASE WHEN pm.sender_id = @userId THEN pm.receiver_id ELSE pm.sender_id END AND pm2.receiver_id = @userId AND pm2.is_read = 0) as unread_count
      FROM private_messages pm
      JOIN users u ON u.id = CASE WHEN pm.sender_id = @userId THEN pm.receiver_id ELSE pm.sender_id END
      WHERE pm.id IN (
        SELECT MAX(id) FROM private_messages
        WHERE sender_id = @userId OR receiver_id = @userId
        GROUP BY CASE WHEN sender_id = @userId THEN receiver_id ELSE sender_id END
      )
      ORDER BY pm.created_at DESC
      LIMIT @limit
    `).all({ userId, limit });
    }
    getMessages(userId: number, otherUserId: number, limit: number = 20): any[] {
        const db = getDb();
        // 标记为已读
        db.prepare('UPDATE private_messages SET is_read = 1 WHERE sender_id = @otherUserId AND receiver_id = @userId AND is_read = 0').run({ otherUserId, userId });
        return db.prepare(`
      SELECT pm.*, u.username as sender_username
      FROM private_messages pm
      JOIN users u ON u.id = pm.sender_id
      WHERE (pm.sender_id = @userId AND pm.receiver_id = @otherUserId) OR (pm.sender_id = @otherUserId AND pm.receiver_id = @userId)
      ORDER BY pm.created_at ASC
      LIMIT @limit
    `).all({ userId, otherUserId, limit });
    }
}
export const privateMessageService: PrivateMessageService = new PrivateMessageService();