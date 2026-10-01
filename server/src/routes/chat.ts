/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/chat.ts

import { Router } from 'express';
import { chatService, ChatError } from '../services/chatService';
import { authMiddleware } from '../middleware/auth';

const router = Router();
// GET /api/teams/:teamId/messages - Get team chat messages
router.get('/:teamId/messages', authMiddleware, (req, res) => {
    try {
        const teamId = parseInt(req.params.teamId, 10);
        if (isNaN(teamId)) {
            res.status(400).json({ error: '无效的队伍ID' });
            return;
        }
        if (!chatService.isTeamMember(teamId, req.user.userId)) {
            res.status(403).json({ error: '您不是该队伍成员' });
            return;
        }
        const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
        const beforeParam = req.query.before;
        const before = beforeParam ? parseInt(beforeParam, 10) : undefined;
        if (before !== undefined && isNaN(before)) {
            res.status(400).json({ error: '无效的 before 参数' });
            return;
        }
        const messages = chatService.getMessages(teamId, limit, before);
        // Determine hasMore: if we got `limit` messages, there are likely more
        const hasMore = messages.length === limit;
        res.json({ messages, hasMore });
    }
    catch (err) {
        if (err instanceof ChatError) {
            res.status(err.statusCode).json({ error: err.message });
        }
        else {
            res.status(500).json({ error: '服务器内部错误' });
        }
    }
});
export default router;
