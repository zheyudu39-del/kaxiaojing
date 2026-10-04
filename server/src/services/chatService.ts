/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/chatService.ts

import { getDb } from '../db/database';

// ===== 类型定义（自 .d.ts 还原）=====
export interface ChatMessage {
    id: number;
    team_id: number;
    user_id: number;
    username: string;
    content: string;
    created_at: string;
}

export class ChatError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message);
        this.name = 'ChatError';
        this.statusCode = statusCode;
    }
}
export class ChatService {
    sendMessage(teamId: number, userId: number, content: string): ChatMessage {
        const db = getDb();
        // 防御：入参可能来自 socket 载荷，历史上出现过对象形态（{teamId:N}），
        // 直接绑定给 sql.js 会抛错并崩进程，这里强制收敛成基本类型
        teamId = Number(teamId);
        userId = Number(userId);
        content = String(content ?? '');
        if (!Number.isInteger(teamId) || !Number.isInteger(userId)) {
            throw new ChatError('参数不合法', 400);
        }
        if (!this.isTeamMember(teamId, userId)) {
            throw new ChatError('您不是该队伍成员', 403);
        }
        const result = db.prepare('INSERT INTO messages (team_id, user_id, content) VALUES (@teamId, @userId, @content)').run({ teamId, userId, content });
        const message = db.prepare(`
      SELECT m.id, m.team_id, m.user_id, u.username, m.content, m.created_at
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.id = @id
    `).get({ id: result.lastInsertRowid });
        return message;
    }
    getMessages(teamId: number, limit: number = 20, before?: number): ChatMessage[] {
        const db = getDb();
        if (before !== undefined) {
            return db.prepare(`
        SELECT m.id, m.team_id, m.user_id, u.username, m.content, m.created_at
        FROM messages m
        JOIN users u ON m.user_id = u.id
        WHERE m.team_id = @teamId AND m.id < @before
        ORDER BY m.id DESC
        LIMIT @limit
      `).all({ teamId, before, limit }).reverse();
        }
        return db.prepare(`
      SELECT m.id, m.team_id, m.user_id, u.username, m.content, m.created_at
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.team_id = @teamId
      ORDER BY m.id DESC
      LIMIT @limit
    `).all({ teamId, limit }).reverse();
    }
    isTeamMember(teamId: number, userId: number): boolean {
        const db = getDb();
        // 同上：收敛类型，避免对象被当作绑定参数
        const tid = Number(teamId);
        const uid = Number(userId);
        if (!Number.isInteger(tid) || !Number.isInteger(uid)) {
            return false;
        }
        const result = db.prepare('SELECT id FROM team_members WHERE team_id = @teamId AND user_id = @userId').get({ teamId: tid, userId: uid });
        return !!result;
    }
}
export const chatService: ChatService = new ChatService();