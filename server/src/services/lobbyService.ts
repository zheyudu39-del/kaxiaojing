/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/lobbyService.ts

import { getDb } from '../db/database';

// ===== 类型定义（自 .d.ts 还原）=====
export interface LobbyMessage {
    id: number;
    user_id: number;
    username: string;
    avatar_url: string | null;
    content: string;
    msg_type: 'chat' | 'recruit';
    competition_id: number | null;
    competition_name: string | null;
    created_at: string;
}

export class LobbyService {
    sendMessage(userId: number, content: string, msgType: 'chat' | 'recruit' = 'chat', competitionId?: number): LobbyMessage {
        const db = getDb();
        const result = db.prepare('INSERT INTO lobby_messages (user_id, content, msg_type, competition_id) VALUES (@userId, @content, @msgType, @competitionId)').run({ userId, content, msgType, competitionId: competitionId || null });
        return this.getMessageById(result.lastInsertRowid);
    }
    getMessages(limit: number = 20, before?: number): LobbyMessage[] {
        const db = getDb();
        const hiddenFilter = 'AND (lm.is_hidden = 0 OR lm.is_hidden IS NULL)';
        const sql = before
            ? `SELECT lm.id, lm.user_id, u.username, u.avatar_url, lm.content, lm.msg_type, lm.competition_id, c.name as competition_name, lm.created_at, lm.is_hidden, lm.moderation_reason
         FROM lobby_messages lm JOIN users u ON lm.user_id = u.id LEFT JOIN competitions c ON lm.competition_id = c.id
         WHERE lm.id < @before ${hiddenFilter} ORDER BY lm.id DESC LIMIT @limit`
            : `SELECT lm.id, lm.user_id, u.username, u.avatar_url, lm.content, lm.msg_type, lm.competition_id, c.name as competition_name, lm.created_at, lm.is_hidden, lm.moderation_reason
         FROM lobby_messages lm JOIN users u ON lm.user_id = u.id LEFT JOIN competitions c ON lm.competition_id = c.id
         WHERE 1=1 ${hiddenFilter} ORDER BY lm.id DESC LIMIT @limit`;
        const params = before ? { before, limit } : { limit };
        return db.prepare(sql).all(params).reverse();
    }
    getMessageById(id: number): LobbyMessage | undefined {
        const db = getDb();
        return db.prepare(`SELECT lm.id, lm.user_id, u.username, u.avatar_url, lm.content, lm.msg_type, lm.competition_id, c.name as competition_name, lm.created_at
       FROM lobby_messages lm JOIN users u ON lm.user_id = u.id LEFT JOIN competitions c ON lm.competition_id = c.id
       WHERE lm.id = @id`).get({ id });
    }
    deleteMessage(messageId: number, userId: number, isAdmin: boolean): void {
        const db = getDb();
        const msg = db.prepare('SELECT user_id FROM lobby_messages WHERE id = @id').get({ id: messageId });
        if (!msg)
            throw new Error('消息不存在');
        if (msg.user_id !== userId && !isAdmin)
            throw new Error('无权删除此消息');
        db.prepare('DELETE FROM lobby_messages WHERE id = @id').run({ id: messageId });
    }
}
export const lobbyService: LobbyService = new LobbyService();