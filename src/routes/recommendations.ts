/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/recommendations.ts

import { Router } from 'express';
import { recommendationService } from '../services/recommendationService';
import { authMiddleware } from '../middleware/auth';

const router = Router();
// GET /api/recommendations - 获取推荐竞赛
router.get('/', authMiddleware, (req, res) => {
    try {
        const userId = req.user.userId;
        const limit = parseInt(req.query.limit) || 10;
        const results = recommendationService.getRecommendations(userId, limit);
        res.json({ recommendations: results });
    }
    catch (err) {
        res.status(500).json({ error: err.message || '获取推荐失败' });
    }
});
export default router;
