/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/recommend.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { smartRecommendService } from '../services/smartRecommendService';

const router = Router();
// 获取个性化推荐
router.get('/personalized', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const recommendations = smartRecommendService.getRecommendations(userId, limit);
    res.json({ recommendations });
});
// 获取相似竞赛
router.get('/similar/:competitionId', (req, res) => {
    const competitionId = parseInt(req.params.competitionId);
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    const similar = smartRecommendService.getSimilarCompetitions(competitionId, limit);
    res.json({ competitions: similar });
});
// 获取热门竞赛
router.get('/trending', (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const trending = smartRecommendService.getTrendingCompetitions(limit);
    res.json({ competitions: trending });
});
// 获取即将截止的竞赛
router.get('/deadline-soon', (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const competitions = smartRecommendService.getDeadlineSoon(limit);
    res.json({ competitions });
});
export default router;
