/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/feedback.ts

import { Router } from 'express';
import { optionalAuthMiddleware, authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { feedbackService } from '../services/feedbackService';

const router = Router();
// 提交反馈（可匿名）
router.post('/', optionalAuthMiddleware, (req, res) => {
    try {
        const userId = req.user?.id || null;
        const feedback = feedbackService.create(userId, req.body);
        res.status(201).json(feedback);
    }
    catch (err) {
        if (err.message === 'TITLE_EMPTY') {
            res.status(400).json({ error: '标题不能为空' });
        }
        else if (err.message === 'CONTENT_EMPTY') {
            res.status(400).json({ error: '内容不能为空' });
        }
        else {
            res.status(500).json({ error: '提交失败' });
        }
    }
});
// 获取我的反馈列表
router.get('/my', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const result = feedbackService.getUserFeedbacks(userId, page, pageSize);
    res.json(result);
});
// 管理员：获取所有反馈
router.get('/admin', authMiddleware, adminMiddleware, (req, res) => {
    const result = feedbackService.listAll({
        status: req.query.status,
        type: req.query.type,
        page: parseInt(req.query.page) || 1,
        pageSize: parseInt(req.query.pageSize) || 20
    });
    res.json(result);
});
// 管理员：更新状态
router.patch('/admin/:id/status', authMiddleware, adminMiddleware, (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    let feedback;
    try {
        feedback = feedbackService.updateStatus(id, status);
    }
    catch (err) {
        if (err.message === 'INVALID_STATUS') {
            res.status(400).json({ error: '状态无效，可选值：pending / processing / resolved / closed' });
            return;
        }
        throw err;
    }
    if (!feedback) {
        res.status(404).json({ error: '反馈不存在' });
        return;
    }
    res.json(feedback);
});
// 管理员：回复反馈
router.post('/admin/:id/reply', authMiddleware, adminMiddleware, (req, res) => {
    const id = parseInt(req.params.id);
    const { reply } = req.body;
    if (!reply?.trim()) {
        res.status(400).json({ error: '回复内容不能为空' });
        return;
    }
    const feedback = feedbackService.reply(id, reply);
    if (!feedback) {
        res.status(404).json({ error: '反馈不存在' });
        return;
    }
    res.json(feedback);
});
export default router;
