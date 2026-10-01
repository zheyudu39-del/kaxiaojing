/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/recruitments.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { recruitmentService } from '../services/recruitmentService';

const router = Router();
router.post('/', authMiddleware, (req, res) => {
    try {
        const post = recruitmentService.createPost(req.user.userId, req.body);
        res.status(201).json(post);
    }
    catch (err) {
        if (err.message.startsWith('MISSING:')) {
            res.status(400).json({ error: `缺少必填字段: ${err.message.split(':')[1]}` });
            return;
        }
        throw err;
    }
});
router.get('/', (req, res) => {
    const { competition_id, skill, page, pageSize } = req.query;
    res.json(recruitmentService.listPosts({
        competition_id: competition_id ? Number(competition_id) : undefined,
        skill: skill,
        page: page ? Number(page) : 1,
        pageSize: pageSize ? Number(pageSize) : 20,
    }));
});
router.get('/:id', (req, res) => {
    const post = recruitmentService.getPostDetail(parseInt(req.params.id));
    if (!post) {
        res.status(404).json({ error: '招募帖不存在' });
        return;
    }
    res.json(post);
});
router.put('/:id/close', authMiddleware, (req, res) => {
    try {
        const result = recruitmentService.closePost(parseInt(req.params.id), req.user.userId);
        if (!result) {
            res.status(404).json({ error: '招募帖不存在' });
            return;
        }
        res.json({ message: '已关闭' });
    }
    catch (err) {
        if (err.message === 'FORBIDDEN') {
            res.status(403).json({ error: '无权操作此招募帖' });
            return;
        }
        throw err;
    }
});
router.delete('/:id', authMiddleware, (req, res) => {
    try {
        const result = recruitmentService.deletePost(parseInt(req.params.id), req.user.userId);
        if (!result) {
            res.status(404).json({ error: '招募帖不存在' });
            return;
        }
        res.json({ message: '删除成功' });
    }
    catch (err) {
        if (err.message === 'FORBIDDEN') {
            res.status(403).json({ error: '无权操作此招募帖' });
            return;
        }
        throw err;
    }
});
// POST /api/recruitments/:id/apply — 申请加入
router.post('/:id/apply', authMiddleware, (req, res) => {
    try {
        recruitmentService.applyToRecruitment(parseInt(req.params.id), req.user.userId, req.body.message);
        res.json({ message: '申请已提交' });
    }
    catch (err) {
        if (err.message === 'NOT_FOUND') {
            res.status(404).json({ error: '招募帖不存在' });
            return;
        }
        if (err.message === 'CLOSED') {
            res.status(400).json({ error: '该招募已关闭' });
            return;
        }
        if (err.message === 'SELF_APPLY') {
            res.status(400).json({ error: '不能申请自己的招募帖' });
            return;
        }
        if (err.message === 'ALREADY_APPLIED') {
            res.status(400).json({ error: '您已申请过' });
            return;
        }
        throw err;
    }
});
// GET /api/recruitments/:id/applications — 查看申请列表
router.get('/:id/applications', authMiddleware, (req, res) => {
    try {
        const apps = recruitmentService.listApplications(parseInt(req.params.id), req.user.userId);
        res.json({ applications: apps });
    }
    catch (err) {
        if (err.message === 'FORBIDDEN') {
            res.status(403).json({ error: '无权查看' });
            return;
        }
        throw err;
    }
});
// PUT /api/recruitments/applications/:id — 处理申请
router.put('/applications/:id', authMiddleware, (req, res) => {
    try {
        const action = req.body.action;
        if (!['approved', 'rejected'].includes(action)) {
            res.status(400).json({ error: '无效操作' });
            return;
        }
        recruitmentService.handleApplication(parseInt(req.params.id), req.user.userId, action);
        res.json({ message: action === 'approved' ? '已通过' : '已拒绝' });
    }
    catch (err) {
        if (err.message === 'NOT_FOUND') {
            res.status(404).json({ error: '申请不存在' });
            return;
        }
        if (err.message === 'FORBIDDEN') {
            res.status(403).json({ error: '无权操作' });
            return;
        }
        throw err;
    }
});
export default router;
