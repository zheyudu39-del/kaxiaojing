/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/studyBuddy.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { StudyBuddyService } from '../services/studyBuddyService';

const router = Router();
const service = new StudyBuddyService();
// 查找学习伙伴（基于用户的竞赛关联）
router.get('/match', authMiddleware, (req, res) => {
    try {
        const competitionId = req.query.competitionId ? parseInt(req.query.competitionId) : undefined;
        const buddies = service.findBuddies(req.user.userId, competitionId);
        res.json({ buddies });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 获取某竞赛的备赛同学
router.get('/competition/:competitionId', authMiddleware, (req, res) => {
    try {
        const competitionId = parseInt(req.params.competitionId);
        const buddies = service.getCompetitionBuddies(competitionId, req.user.userId);
        res.json({ buddies });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
export default router;
