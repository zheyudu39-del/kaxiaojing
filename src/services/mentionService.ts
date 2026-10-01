/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/mentionService.ts

import { getDb } from '../db/database';
import { notificationService } from './notificationService';

const MENTION_REGEX = /@([\w\u4e00-\u9fff]{2,20})/g;
export class MentionService {
    /**
     * 提取文本中所有 @用户名，返回去重后的用户名列表
     * Requirements: 4.1
     */
    parseMentions(text: string): string[] {
        const mentions = [];
        let match;
        const regex = new RegExp(MENTION_REGEX.source, MENTION_REGEX.flags);
        while ((match = regex.exec(text)) !== null) {
            if (!mentions.includes(match[1])) {
                mentions.push(match[1]);
            }
        }
        return mentions;
    }
    /**
     * 格式化文本，保持 @用户名 不变（往返一致性）
     * Requirements: 4.2
     */
    formatMentions(text: string): string {
        return text;
    }
    /**
     * 解析提及、验证用户存在性、向存在的被提及用户发送通知（排除作者自己）
     * Requirements: 4.3, 4.4
     */
    resolveAndNotify(text: string, authorId: number, relatedType: string, relatedId: number): void {
        const usernames = this.parseMentions(text);
        if (usernames.length === 0)
            return;
        const db = getDb();
        for (const username of usernames) {
            const user = db.prepare('SELECT id, username FROM users WHERE username = @username').get({ username });
            // Requirement 4.4: 用户不存在则保留为普通文本（不做任何操作）
            if (!user)
                continue;
            // 不通知作者自己
            if (user.id === authorId)
                continue;
            // Requirement 4.3: 向被提及用户发送通知
            notificationService.createNotification(user.id, 'mention', '你被提及了', `有人在${relatedType}中提及了你`, relatedId);
        }
    }
}
export const mentionService: MentionService = new MentionService();