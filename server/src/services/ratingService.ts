/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/ratingService.ts

import { getDb } from '../db/database';

// 8. 竞赛难度评分服务
export const ratingService = {
    // 提交竞赛评分
    rateCompetition(userId, competitionId, data) {
        const db = getDb();
        return db.prepare(`
      INSERT OR REPLACE INTO competition_ratings (user_id, competition_id, difficulty, value, recommend, comment)
      VALUES (@userId, @competitionId, @difficulty, @value, @recommend, @comment)
    `).run({
            userId,
            competitionId,
            difficulty: data.difficulty,
            value: data.value,
            recommend: data.recommend,
            comment: data.comment || null
        });
    },
    // 获取竞赛评分统计
    getCompetitionRatings(competitionId) {
        const db = getDb();
        const stats = db.prepare(`
      SELECT 
        COUNT(*) as rating_count,
        AVG(difficulty) as avg_difficulty,
        AVG(value) as avg_value,
        AVG(recommend) as avg_recommend
      FROM competition_ratings
      WHERE competition_id = @competitionId
    `).get({ competitionId });
        const reviews = db.prepare(`
      SELECT cr.*, u.username, u.avatar_url
      FROM competition_ratings cr
      JOIN users u ON cr.user_id = u.id
      WHERE cr.competition_id = @competitionId AND cr.comment IS NOT NULL
      ORDER BY cr.created_at DESC
      LIMIT 20
    `).all({ competitionId });
        return {
            rating_count: stats?.rating_count || 0,
            avg_difficulty: stats?.avg_difficulty ? Math.round(stats.avg_difficulty * 10) / 10 : null,
            avg_value: stats?.avg_value ? Math.round(stats.avg_value * 10) / 10 : null,
            avg_recommend: stats?.avg_recommend ? Math.round(stats.avg_recommend * 10) / 10 : null,
            reviews
        };
    },
    // 获取用户对某竞赛的评分
    getUserRating(userId, competitionId) {
        const db = getDb();
        return db.prepare(`
      SELECT * FROM competition_ratings WHERE user_id = @userId AND competition_id = @competitionId
    `).get({ userId, competitionId });
    },
    // 检查用户是否有资格评分（需要参加过该竞赛）
    canRate(userId, competitionId) {
        const db = getDb();
        // 检查是否有获奖记录或参赛记录
        const award = db.prepare(`
      SELECT id FROM awards WHERE user_id = @userId AND competition_id = @competitionId
    `).get({ userId, competitionId });
        const registration = db.prepare(`
      SELECT id FROM registrations WHERE user_id = @userId AND competition_id = @competitionId
    `).get({ userId, competitionId });
        const teamMember = db.prepare(`
      SELECT tm.id FROM team_members tm
      JOIN teams t ON tm.team_id = t.id
      WHERE tm.user_id = @userId AND t.competition_id = @competitionId
    `).get({ userId, competitionId });
        return !!(award || registration || teamMember);
    }
};