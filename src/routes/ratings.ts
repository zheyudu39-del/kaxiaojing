/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/ratings.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { ratingService } from '../services/ratingService';

const router = Router();
// 提交竞赛评分
router.post('/:competitionId', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const competitionId = parseInt(req.params.competitionId);
    const { difficulty, value, recommend, comment } = req.body;
    if (!difficulty || !value || !recommend) {
        res.status(400).json({ error: '请填写完整评分' });
        return;
    }
    // 检查是否有资格评分
    if (!ratingService.canRate(userId, competitionId)) {
        res.status(403).json({ error: '您需要参加过该竞赛才能评分' });
        return;
    }
    ratingService.rateCompetition(userId, competitionId, { difficulty, value, recommend, comment });
    res.json({ success: true, message: '评分成功' });
});
// 获取竞赛评分统计
router.get('/:competitionId', (req, res) => {
    const competitionId = parseInt(req.params.competitionId);
    const ratings = ratingService.getCompetitionRatings(competitionId);
    res.json(ratings);
});
// 获取我对某竞赛的评分
router.get('/:competitionId/my', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const competitionId = parseInt(req.params.competitionId);
    const rating = ratingService.getUserRating(userId, competitionId);
    const canRate = ratingService.canRate(userId, competitionId);
    res.json({ rating, can_rate: canRate });
});
export default router;
