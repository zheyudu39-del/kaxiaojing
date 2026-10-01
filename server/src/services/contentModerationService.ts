/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/contentModerationService.ts

import { getDb } from '../db/database';

// ===== 类型定义（自 .d.ts 还原）=====
interface ModerationResult {
    is_inappropriate: boolean;
    reason: string | null;
}

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const WARNING_THRESHOLD = 3;
const MUTE_DURATION_MS = 24 * 60 * 60 * 1000; // 24小时
export class ContentModerationService {
    async moderateContent(content: string): Promise<ModerationResult> {
        if (!DEEPSEEK_API_KEY) {
            return { is_inappropriate: false, reason: null };
        }
        try {
            const response = await fetch(DEEPSEEK_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: 'system',
                            content: '你是一个内容审核助手。请判断以下用户消息是否包含不良内容（骂人、侮辱、歧视、色情、暴力威胁等）。仅返回JSON格式：{"is_inappropriate": true/false, "reason": "原因或null"}。不要返回任何其他内容。',
                        },
                        { role: 'user', content },
                    ],
                    temperature: 0.1,
                    max_tokens: 200,
                    stream: false,
                }),
            });
            if (!response.ok) {
                console.error('[ContentModeration] API error:', response.status);
                return { is_inappropriate: false, reason: null };
            }
            const data = await response.json();
            const text = data.choices?.[0]?.message?.content || '';
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    is_inappropriate: !!parsed.is_inappropriate,
                    reason: parsed.reason || null,
                };
            }
            return { is_inappropriate: false, reason: null };
        }
        catch (err) {
            console.error('[ContentModeration] Error:', err.message);
            return { is_inappropriate: false, reason: null };
        }
    }
    addWarning(userId: number, messageId: number, reason: string): { warning_count: number; is_muted: boolean; } {
        const db = getDb();
        db.prepare('INSERT INTO user_warnings (user_id, message_id, reason) VALUES (@userId, @messageId, @reason)').run({ userId, messageId, reason });
        db.prepare('UPDATE users SET warning_count = warning_count + 1 WHERE id = @userId').run({ userId });
        const user = db.prepare('SELECT warning_count FROM users WHERE id = @userId').get({ userId });
        const newCount = user?.warning_count || 0;
        let isMuted = false;
        if (newCount >= WARNING_THRESHOLD) {
            const muteUntil = new Date(Date.now() + MUTE_DURATION_MS).toISOString();
            db.prepare('UPDATE users SET muted_until = @muteUntil WHERE id = @userId').run({ userId, muteUntil });
            isMuted = true;
        }
        return { warning_count: newCount, is_muted: isMuted };
    }
    isUserMuted(userId: number): { muted: boolean; unmute_at: string | null; } {
        const db = getDb();
        const user = db.prepare('SELECT muted_until FROM users WHERE id = @userId').get({ userId });
        if (!user?.muted_until)
            return { muted: false, unmute_at: null };
        if (new Date(user.muted_until) > new Date()) {
            return { muted: true, unmute_at: user.muted_until };
        }
        return { muted: false, unmute_at: null };
    }
    getWarningCount(userId: number): number {
        const db = getDb();
        const user = db.prepare('SELECT warning_count FROM users WHERE id = @userId').get({ userId });
        return user?.warning_count || 0;
    }
    hideMessage(messageId: number, reason: string): void {
        const db = getDb();
        db.prepare('UPDATE lobby_messages SET is_hidden = 1, moderation_reason = @reason WHERE id = @id').run({ id: messageId, reason });
    }
}
export const contentModerationService: ContentModerationService = new ContentModerationService();