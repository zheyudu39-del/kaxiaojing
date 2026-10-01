/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/ranking.ts

import { Router } from 'express';
import { getDb } from '../db/database';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';

const router = Router();
// GET /api/ranking - get user ranking by participation and awards
router.get('/', (_req, res) => {
    try {
        const db = getDb();
        const page = parseInt(_req.query.page) || 1;
        const pageSize = parseInt(_req.query.pageSize) || 20;
        const offset = (page - 1) * pageSize;
        // Get user participation count (number of teams joined)
        const rankings = db.prepare(`
      SELECT 
        u.id,
        u.username,
        COUNT(DISTINCT tm.team_id) as participation_count,
        COALESCE(award_stats.award_count, 0) as award_count,
        COALESCE(award_stats.gold_count, 0) as gold_count,
        COALESCE(award_stats.silver_count, 0) as silver_count,
        COALESCE(award_stats.bronze_count, 0) as bronze_count
      FROM users u
      LEFT JOIN team_members tm ON u.id = tm.user_id
      LEFT JOIN (
        SELECT 
          user_id,
          COUNT(*) as award_count,
          SUM(CASE WHEN award_level = '一等奖' OR award_level = '金奖' THEN 1 ELSE 0 END) as gold_count,
          SUM(CASE WHEN award_level = '二等奖' OR award_level = '银奖' THEN 1 ELSE 0 END) as silver_count,
          SUM(CASE WHEN award_level = '三等奖' OR award_level = '铜奖' THEN 1 ELSE 0 END) as bronze_count
        FROM awards
        WHERE review_status = 'approved'
        GROUP BY user_id
      ) award_stats ON u.id = award_stats.user_id
      GROUP BY u.id
      ORDER BY award_count DESC, participation_count DESC
      LIMIT @pageSize OFFSET @offset
    `).all({ pageSize, offset });
        res.json({ rankings });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: '服务器内部错误' });
    }
});
// POST /api/ranking/award - add an award record (for testing/admin)
router.post('/award', authMiddleware, adminMiddleware, (req, res) => {
    try {
        const { userId, competitionId, awardLevel, proofImageUrl } = req.body;
        if (!userId || !competitionId || !awardLevel) {
            res.status(400).json({ error: '缺少必填字段' });
            return;
        }
        const db = getDb();
        db.prepare('INSERT INTO awards (user_id, competition_id, award_level, review_status, proof_image_url) VALUES (@userId, @competitionId, @awardLevel, @reviewStatus, @proofImageUrl)')
            .run({ userId, competitionId, awardLevel, reviewStatus: 'pending', proofImageUrl: proofImageUrl || null });
        res.json({ message: '获奖记录已添加' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: '服务器内部错误' });
    }
});
export default router;
