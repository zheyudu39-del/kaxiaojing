/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/teamMatch.ts

import { Router } from 'express';
import { teamMatchService } from '../services/teamMatchService';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.get('/', authMiddleware, (req, res) => {
    try {
        const userId = req.user.userId;
        const competitionId = req.query.competitionId ? parseInt(req.query.competitionId) : undefined;
        const matches = teamMatchService.getMatches(userId, competitionId);
        res.json({ matches });
    }
    catch (err) {
        res.status(500).json({ error: err.message || '获取匹配失败' });
    }
});
export default router;
