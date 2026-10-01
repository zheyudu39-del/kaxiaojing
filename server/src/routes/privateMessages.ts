/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/privateMessages.ts

import { Router } from 'express';
import { privateMessageService } from '../services/privateMessageService';
import { authMiddleware } from '../middleware/auth';
import { pushPrivateMessage } from '../socket/index';
import { getDb } from '../db/database';

const router = Router();
// GET /api/private-messages/users/search - 搜索用户（用于发起新会话）
router.get('/users/search', authMiddleware, (req, res) => {
    const keyword = req.query.keyword;
    if (!keyword || keyword.length < 1) {
        res.json({ users: [] });
        return;
    }
    const db = getDb();
    const currentUserId = req.user.userId;
    const users = db.prepare(`
    SELECT id, username, avatar_url, college 
    FROM users 
    WHERE username LIKE @kw AND id != @currentUserId
    LIMIT 10
  `).all({ kw: `%${keyword}%`, currentUserId });
    res.json({ users });
});
// POST /api/private-messages - 发送私信
router.post('/', authMiddleware, (req, res) => {
    try {
        const senderId = req.user.userId;
        const { receiver_id, content } = req.body;
        if (!receiver_id)
            return res.status(400).json({ error: '缺少接收者ID' });
        const msg = privateMessageService.sendMessage(senderId, receiver_id, content);
        // 实时推送给接收者
        pushPrivateMessage(receiver_id, msg);
        res.status(201).json(msg);
    }
    catch (err) {
        if (err.message === '用户不存在')
            return res.status(404).json({ error: err.message });
        if (err.message === '消息内容不能为空')
            return res.status(400).json({ error: err.message });
        res.status(500).json({ error: err.message || '发送失败' });
    }
});
// GET /api/private-messages/conversations - 获取会话列表
router.get('/conversations', authMiddleware, (req, res) => {
    try {
        const userId = req.user.userId;
        const conversations = privateMessageService.getConversations(userId);
        res.json({ conversations });
    }
    catch (err) {
        res.status(500).json({ error: err.message || '获取会话失败' });
    }
});
// GET /api/private-messages/:userId - 获取与某用户的消息
router.get('/:userId', authMiddleware, (req, res) => {
    try {
        const userId = req.user.userId;
        const otherUserId = parseInt(req.params.userId);
        const messages = privateMessageService.getMessages(userId, otherUserId);
        res.json({ messages });
    }
    catch (err) {
        res.status(500).json({ error: err.message || '获取消息失败' });
    }
});
export default router;
