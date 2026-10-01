/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/subscriptions.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { subscriptionService } from '../services/subscriptionService';

const router = Router();
// 订阅竞赛提醒
router.post('/', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const { competition_id, reminder_days } = req.body;
    if (!competition_id) {
        res.status(400).json({ error: '缺少竞赛ID' });
        return;
    }
    subscriptionService.subscribe(userId, competition_id, reminder_days || 3);
    res.json({ success: true, message: '订阅成功' });
});
// 取消订阅
router.delete('/:competitionId', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const competitionId = parseInt(req.params.competitionId);
    subscriptionService.unsubscribe(userId, competitionId);
    res.json({ success: true, message: '已取消订阅' });
});
// 获取我的订阅列表
router.get('/my', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const subscriptions = subscriptionService.getUserSubscriptions(userId);
    res.json({ subscriptions });
});
// 检查是否已订阅
router.get('/check/:competitionId', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const competitionId = parseInt(req.params.competitionId);
    const isSubscribed = subscriptionService.isSubscribed(userId, competitionId);
    res.json({ is_subscribed: isSubscribed });
});
export default router;
