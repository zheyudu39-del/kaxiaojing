/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/studyCheckin.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { StudyCheckinService } from '../services/studyCheckinService';

const router = Router();
const service = new StudyCheckinService();
// 获取用户打卡统计
router.get('/stats', authMiddleware, (req, res) => {
    try {
        const stats = service.getUserStats(req.user.userId);
        res.json(stats);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 获取用户训练计划列表
router.get('/plans', authMiddleware, (req, res) => {
    try {
        const status = req.query.status;
        const plans = service.getUserPlans(req.user.userId, status);
        res.json({ plans });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 创建训练计划
router.post('/plans', authMiddleware, (req, res) => {
    try {
        const { title, description, competitionId, dailyGoal, startDate, endDate } = req.body;
        if (!title || !startDate || !endDate) {
            res.status(400).json({ error: '标题、开始日期和结束日期为必填' });
            return;
        }
        const plan = service.createPlan(req.user.userId, { title, description, competitionId, dailyGoal, startDate, endDate });
        res.status(201).json(plan);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 更新计划状态
router.patch('/plans/:planId/status', authMiddleware, (req, res) => {
    try {
        const planId = parseInt(req.params.planId);
        const { status } = req.body;
        if (!['active', 'completed', 'paused', 'cancelled'].includes(status)) {
            res.status(400).json({ error: '无效的状态' });
            return;
        }
        service.updatePlanStatus(planId, req.user.userId, status);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 获取计划的打卡记录
router.get('/plans/:planId/checkins', authMiddleware, (req, res) => {
    try {
        const planId = parseInt(req.params.planId);
        const checkins = service.getPlanCheckins(planId, req.user.userId);
        res.json({ checkins });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 打卡
router.post('/plans/:planId/checkins', authMiddleware, (req, res) => {
    try {
        const planId = parseInt(req.params.planId);
        const { content, duration, checkinDate } = req.body;
        const date = checkinDate || new Date().toISOString().split('T')[0];
        const result = service.checkin(req.user.userId, planId, { content, duration, checkinDate: date });
        res.status(201).json(result);
    }
    catch (err) {
        if (err.message?.includes('UNIQUE')) {
            res.status(400).json({ error: '今天已经打过卡了' });
            return;
        }
        res.status(500).json({ error: err.message });
    }
});
// 删除打卡记录
router.delete('/checkins/:checkinId', authMiddleware, (req, res) => {
    try {
        const checkinId = parseInt(req.params.checkinId);
        service.deleteCheckin(checkinId, req.user.userId);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
export default router;
