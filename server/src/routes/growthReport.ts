/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/growthReport.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getDb } from '../db/database';

const router = Router();
// 获取个人成长报告
router.get('/', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const db = getDb();
    // 基础统计
    const awards = db.prepare(`
    SELECT a.*, c.name as competition_name, c.category
    FROM awards a
    JOIN competitions c ON a.competition_id = c.id
    WHERE a.user_id = @userId AND a.review_status = 'approved'
    ORDER BY a.award_date DESC
  `).all({ userId });
    const certPlans = db.prepare(`
    SELECT cp.*, c.name as certificate_name, c.category
    FROM cert_study_plans cp
    JOIN certificates c ON cp.certificate_id = c.id
    WHERE cp.user_id = @userId
  `).all({ userId });
    const posts = db.prepare(`
    SELECT COUNT(*) as count FROM posts WHERE user_id = @userId AND deleted_at IS NULL
  `).get({ userId });
    const comments = db.prepare(`
    SELECT COUNT(*) as count FROM comments WHERE user_id = @userId
  `).get({ userId });
    const teams = db.prepare(`
    SELECT COUNT(*) as count FROM team_members WHERE user_id = @userId
  `).get({ userId });
    const resources = db.prepare(`
    SELECT COUNT(*) as count FROM resources WHERE user_id = @userId AND review_status = 'approved'
  `).get({ userId });
    const followers = db.prepare(`
    SELECT COUNT(*) as count FROM follows WHERE followee_id = @userId
  `).get({ userId });
    const following = db.prepare(`
    SELECT COUNT(*) as count FROM follows WHERE follower_id = @userId
  `).get({ userId });
    // 获奖等级分布
    const awardLevelDist = db.prepare(`
    SELECT award_level, COUNT(*) as count
    FROM awards
    WHERE user_id = @userId AND review_status = 'approved'
    GROUP BY award_level
  `).all({ userId });
    // 获奖类别分布
    const awardCategoryDist = db.prepare(`
    SELECT c.category, COUNT(*) as count
    FROM awards a
    JOIN competitions c ON a.competition_id = c.id
    WHERE a.user_id = @userId AND a.review_status = 'approved'
    GROUP BY c.category
  `).all({ userId });
    // 月度活跃度（近6个月）
    const monthlyActivity = db.prepare(`
    SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count
    FROM user_activities
    WHERE user_id = @userId AND created_at >= date('now', '-6 months')
    GROUP BY month
    ORDER BY month
  `).all({ userId });
    // 证书备考进度
    const certProgress = {
        studying: certPlans.filter(p => p.status === 'studying').length,
        passed: certPlans.filter(p => p.status === 'passed').length,
        failed: certPlans.filter(p => p.status === 'failed').length,
    };
    // 打卡统计
    const checkinStats = db.prepare(`
    SELECT COUNT(*) as total,
      COUNT(DISTINCT certificate_id) as cert_count,
      COUNT(DISTINCT date(created_at)) as days
    FROM cert_checkins
    WHERE user_id = @userId
  `).get({ userId });
    // 计算成长分数（简单算法）
    const growthScore = Math.min(100, awards.length * 10 +
        certProgress.passed * 15 +
        posts.count * 2 +
        resources.count * 5 +
        followers.count * 1);
    res.json({
        summary: {
            award_count: awards.length,
            cert_studying: certProgress.studying,
            cert_passed: certProgress.passed,
            post_count: posts.count,
            comment_count: comments.count,
            team_count: teams.count,
            resource_count: resources.count,
            follower_count: followers.count,
            following_count: following.count,
            growth_score: growthScore,
        },
        awards,
        awardLevelDist,
        awardCategoryDist,
        certPlans,
        certProgress,
        checkinStats,
        monthlyActivity,
    });
});
export default router;
