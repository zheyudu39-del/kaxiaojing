/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/registrations.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { registrationService } from '../services/registrationService';

const router = Router();
// POST /api/registrations — 报名竞赛
router.post('/', authMiddleware, (req, res) => {
    try {
        const { competition_id, team_id } = req.body;
        if (!competition_id)
            return res.status(400).json({ error: '缺少竞赛ID' });
        const id = registrationService.register(req.user.userId, competition_id, team_id);
        res.status(201).json({ id, message: '报名成功' });
    }
    catch (err) {
        if (err.message === 'ALREADY_REGISTERED')
            return res.status(409).json({ error: '您已报名该竞赛' });
        res.status(500).json({ error: '报名失败' });
    }
});
// DELETE /api/registrations/:competitionId — 取消报名
router.delete('/:competitionId', authMiddleware, (req, res) => {
    try {
        registrationService.cancel(req.user.userId, parseInt(req.params.competitionId));
        res.json({ message: '已取消报名' });
    }
    catch (err) {
        if (err.message === 'NOT_FOUND')
            return res.status(404).json({ error: '未找到报名记录' });
        res.status(500).json({ error: '取消失败' });
    }
});
// GET /api/registrations/my — 我的报名
router.get('/my', authMiddleware, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const regs = registrationService.getUserRegistrations(req.user.userId, page, pageSize);
    res.json({ registrations: regs });
});
// GET /api/registrations/check/:competitionId — 检查是否已报名
router.get('/check/:competitionId', authMiddleware, (req, res) => {
    const registered = registrationService.isRegistered(req.user.userId, parseInt(req.params.competitionId));
    res.json({ registered });
});
export default router;
