/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/badges.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { badgeService } from '../services/badgeService';

const router = Router();
// 获取所有徽章定义
router.get('/all', (req, res) => {
    res.json({ badges: badgeService.BADGES });
});
// 获取我的徽章
router.get('/my', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const badges = badgeService.getUserBadges(userId);
    const stats = badgeService.getUserStats(userId);
    res.json({ badges, stats });
});
// 获取所有徽章及获取状态
router.get('/my/all', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const badges = badgeService.getAllBadgesWithStatus(userId);
    const stats = badgeService.getUserStats(userId);
    res.json({ badges, stats });
});
// 检查并授予新徽章
router.post('/check', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const newBadges = badgeService.checkAndGrantBadges(userId);
    if (newBadges.length > 0) {
        const badges = badgeService.BADGES.filter(b => newBadges.includes(b.id));
        res.json({ new_badges: badges });
    }
    else {
        res.json({ new_badges: [] });
    }
});
// 获取用户徽章（公开）
router.get('/user/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const badges = badgeService.getUserBadges(userId);
    res.json({ badges });
});
export default router;
