/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/lobby.ts

import { Router } from 'express';
import { lobbyService } from '../services/lobbyService';
import { contentModerationService } from '../services/contentModerationService';
import { authMiddleware } from '../middleware/auth';
import { getDb } from '../db/database';

const router = Router();
// GET /api/lobby/messages - Get lobby messages
router.get('/messages', (_req, res) => {
    try {
        const limit = parseInt(_req.query.limit) || 20;
        const before = _req.query.before ? parseInt(_req.query.before) : undefined;
        const messages = lobbyService.getMessages(limit, before);
        res.json({ messages });
    }
    catch {
        res.status(500).json({ error: '服务器内部错误' });
    }
});
// POST /api/lobby/messages - Send a lobby message
router.post('/messages', authMiddleware, (req, res) => {
    try {
        const userId = req.user.userId;
        // 检查禁言状态
        const muteStatus = contentModerationService.isUserMuted(userId);
        if (muteStatus.muted) {
            const remaining = Math.ceil((new Date(muteStatus.unmute_at).getTime() - Date.now()) / 60000);
            res.status(403).json({ error: `您已被禁言，剩余${remaining}分钟`, muted: true, unmute_at: muteStatus.unmute_at });
            return;
        }
        const { content, msgType, competitionId } = req.body;
        if (!content || !content.trim()) {
            res.status(400).json({ error: '消息内容不能为空' });
            return;
        }
        const message = lobbyService.sendMessage(userId, content.trim(), msgType || 'chat', competitionId);
        res.status(201).json(message);
        // 异步进行AI内容审核（不阻塞响应）
        contentModerationService.moderateContent(content.trim()).then(result => {
            if (result.is_inappropriate) {
                contentModerationService.hideMessage(message.id, result.reason || '不良内容');
                const warningResult = contentModerationService.addWarning(userId, message.id, result.reason || '不良内容');
                // 发送警告通知
                const db = getDb();
                const notifyContent = warningResult.is_muted
                    ? `您发布的消息包含不良内容，已被隐藏。累计警告${warningResult.warning_count}次，您已被禁言24小时。`
                    : `您发布的消息包含不良内容，已被隐藏。累计警告${warningResult.warning_count}次，达到3次将被禁言。`;
                db.prepare('INSERT INTO notifications (user_id, type, title, content, is_read) VALUES (@userId, @type, @title, @content, 0)').run({ userId, type: 'warning', title: '内容审核警告', content: notifyContent });
            }
        }).catch(err => {
            console.error('[ContentModeration] Async moderation failed:', err.message);
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message || '服务器内部错误' });
    }
});
// DELETE /api/lobby/messages/:id - Delete a lobby message
router.delete('/messages/:id', authMiddleware, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ error: '无效ID' });
            return;
        }
        const isAdmin = req.user?.role === 'admin';
        lobbyService.deleteMessage(id, req.user.userId, isAdmin);
        res.json({ message: '已删除' });
    }
    catch (err) {
        res.status(400).json({ error: err.message || '删除失败' });
    }
});
export default router;
