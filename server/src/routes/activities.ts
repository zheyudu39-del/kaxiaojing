/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/activities.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { activityService } from '../services/activityService';

const router = Router();
// 获取我的动态
router.get('/my', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const result = activityService.getUserActivities(userId, page, pageSize);
    res.json(result);
});
// 获取指定用户的动态
router.get('/user/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const result = activityService.getUserActivities(userId, page, pageSize);
    res.json(result);
});
// 获取关注用户的动态（动态流）
router.get('/following', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const result = activityService.getFollowingActivities(userId, page, pageSize);
    res.json(result);
});
// 获取单个动态详情
router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const activity = activityService.getActivityWithDetails(id);
    if (!activity) {
        res.status(404).json({ error: '动态不存在' });
        return;
    }
    res.json(activity);
});
export default router;
