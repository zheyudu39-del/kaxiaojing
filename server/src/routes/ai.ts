/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/ai.ts

import { Router } from 'express';
import { chatWithAI, streamChatWithAI } from '../services/aiService';
import { authMiddleware } from '../middleware/auth';
import { getDb } from '../db/database';

const router = Router();
// POST /api/ai/chat - 非流式对话
router.post('/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        if (!message || !message.trim()) {
            res.status(400).json({ error: '消息不能为空' });
            return;
        }
        // 尝试获取用户ID（可选认证）
        let userId;
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            try {
                const { authService } = require('../services/authService');
                const payload = authService.verifyToken(authHeader.slice(7));
                userId = payload.userId;
            }
            catch { /* 未登录也可以使用 */ }
        }
        const reply = await chatWithAI(message.trim(), history || [], userId);
        res.json({ reply });
    }
    catch (err) {
        res.status(500).json({ error: err.message || '服务器内部错误' });
    }
});
// POST /api/ai/chat/stream - 流式对话（SSE）
router.post('/chat/stream', async (req, res) => {
    try {
        const { message, history } = req.body;
        if (!message || !message.trim()) {
            res.status(400).json({ error: '消息不能为空' });
            return;
        }
        let userId;
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            try {
                const { authService } = require('../services/authService');
                const payload = authService.verifyToken(authHeader.slice(7));
                userId = payload.userId;
            }
            catch { /* 未登录也可以使用 */ }
        }
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        for await (const chunk of streamChatWithAI(message.trim(), history || [], userId)) {
            res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        }
        res.write('data: [DONE]\n\n');
        res.end();
    }
    catch (err) {
        if (!res.headersSent) {
            res.status(500).json({ error: err.message || '服务器内部错误' });
        }
        else {
            res.end();
        }
    }
});
// POST /api/ai/history - 保存对话历史（需登录）
router.post('/history', authMiddleware, (req, res) => {
    try {
        const { title, messages } = req.body;
        const db = getDb();
        const result = db.prepare('INSERT INTO ai_chat_history (user_id, title, messages) VALUES (@userId, @title, @messages)').run({ userId: req.user.userId, title: title || '新对话', messages: JSON.stringify(messages || []) });
        res.status(201).json({ id: result.lastInsertRowid });
    }
    catch (err) {
        res.status(500).json({ error: err.message || '保存失败' });
    }
});
// GET /api/ai/history - 获取对话历史列表
router.get('/history', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        const histories = db.prepare('SELECT id, title, created_at FROM ai_chat_history WHERE user_id = @userId ORDER BY created_at DESC LIMIT 50').all({ userId: req.user.userId });
        res.json({ histories });
    }
    catch {
        res.status(500).json({ error: '获取失败' });
    }
});
// GET /api/ai/history/:id - 获取单条对话详情
router.get('/history/:id', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        const history = db.prepare('SELECT * FROM ai_chat_history WHERE id = @id AND user_id = @userId').get({ id: parseInt(req.params.id), userId: req.user.userId });
        if (!history) {
            res.status(404).json({ error: '对话不存在' });
            return;
        }
        history.messages = JSON.parse(history.messages || '[]');
        res.json(history);
    }
    catch {
        res.status(500).json({ error: '获取失败' });
    }
});
// DELETE /api/ai/history/:id - 删除对话历史
router.delete('/history/:id', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        db.prepare('DELETE FROM ai_chat_history WHERE id = @id AND user_id = @userId')
            .run({ id: parseInt(req.params.id), userId: req.user.userId });
        res.json({ message: '已删除' });
    }
    catch {
        res.status(500).json({ error: '删除失败' });
    }
});
export default router;
