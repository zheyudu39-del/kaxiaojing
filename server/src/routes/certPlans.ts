/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/certPlans.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { certPlanService } from '../services/certPlanService';

const router = Router();
router.post('/', authMiddleware, (req, res) => {
    try {
        const { certificate_id, target_date, notes, proof_image_url } = req.body;
        if (!certificate_id)
            return res.status(400).json({ error: '缺少证书ID' });
        const id = certPlanService.addPlan(req.user.userId, certificate_id, target_date, notes, proof_image_url);
        res.status(201).json({ id, message: '备考计划已添加' });
    }
    catch (err) {
        if (err.message === 'ALREADY_EXISTS')
            return res.status(409).json({ error: '该证书已在备考计划中' });
        res.status(500).json({ error: '添加失败' });
    }
});
router.get('/my', authMiddleware, (req, res) => {
    const plans = certPlanService.getUserPlans(req.user.userId);
    res.json({ plans });
});
router.put('/:certificateId', authMiddleware, (req, res) => {
    certPlanService.updatePlan(req.user.userId, parseInt(req.params.certificateId), req.body);
    res.json({ message: '更新成功' });
});
router.delete('/:certificateId', authMiddleware, (req, res) => {
    certPlanService.deletePlan(req.user.userId, parseInt(req.params.certificateId));
    res.json({ message: '已删除' });
});
// 每日打卡
router.post('/:certificateId/checkin', authMiddleware, (req, res) => {
    try {
        certPlanService.checkin(req.user.userId, parseInt(req.params.certificateId), req.body.note || '');
        const streak = certPlanService.getCheckinStreak(req.user.userId, parseInt(req.params.certificateId));
        res.json({ message: '打卡成功', streak });
    }
    catch (err) {
        if (err.message === 'ALREADY_CHECKIN')
            return res.status(400).json({ error: '今日已打卡' });
        res.status(500).json({ error: '打卡失败' });
    }
});
router.get('/:certificateId/checkins', authMiddleware, (req, res) => {
    const checkins = certPlanService.getCheckins(req.user.userId, parseInt(req.params.certificateId));
    const streak = certPlanService.getCheckinStreak(req.user.userId, parseInt(req.params.certificateId));
    res.json({ checkins, streak });
});
export default router;
