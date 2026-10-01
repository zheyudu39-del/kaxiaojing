/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/timeline.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { timelineService } from '../services/timelineService';

const router = Router();
// 获取用户竞赛时间线
router.get('/user/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const timeline = timelineService.getUserTimeline(userId);
    res.json({ timeline });
});
// 获取我的时间线
router.get('/my', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const timeline = timelineService.getUserTimeline(userId);
    res.json({ timeline });
});
// 获取用户统计
router.get('/user/:userId/stats', (req, res) => {
    const userId = parseInt(req.params.userId);
    const stats = timelineService.getUserStats(userId);
    res.json(stats);
});
// 获取我的统计
router.get('/my/stats', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const stats = timelineService.getUserStats(userId);
    res.json(stats);
});
// 获取成长曲线数据
router.get('/user/:userId/growth', (req, res) => {
    const userId = parseInt(req.params.userId);
    const growth = timelineService.getGrowthData(userId);
    res.json({ growth });
});
// 获取我的成长曲线
router.get('/my/growth', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const growth = timelineService.getGrowthData(userId);
    res.json({ growth });
});
// 获取里程碑
router.get('/user/:userId/milestones', (req, res) => {
    const userId = parseInt(req.params.userId);
    const milestones = timelineService.getMilestones(userId);
    res.json({ milestones });
});
// 获取我的里程碑
router.get('/my/milestones', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const milestones = timelineService.getMilestones(userId);
    res.json({ milestones });
});
export default router;
