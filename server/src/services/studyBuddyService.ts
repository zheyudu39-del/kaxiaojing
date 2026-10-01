/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/studyBuddyService.ts

import { getDb } from '../db/database';

export class StudyBuddyService {
    // 查找学习伙伴：基于相同竞赛的学习计划、报名、收藏
    findBuddies(userId: number, competitionId?: number): any[] {
        const db = getDb();
        // 获取当前用户关注的竞赛ID列表（来自学习计划、报名、收藏）
        const myCompIds = this.getUserCompetitionIds(userId);
        if (myCompIds.length === 0 && !competitionId)
            return [];
        const targetIds = competitionId ? [competitionId] : myCompIds;
        const placeholders = targetIds.map(() => '?').join(',');
        // 查找有相同竞赛关联的其他用户
        const buddies = db.prepare(`
      SELECT u.id, u.username, u.college, u.major, u.avatar_url, u.bio,
        GROUP_CONCAT(DISTINCT c.name) as common_competitions,
        COUNT(DISTINCT comp_id) as match_score
      FROM (
        SELECT user_id, competition_id as comp_id FROM study_plans WHERE competition_id IN (${placeholders}) AND status = 'active' AND user_id != ?
        UNION ALL
        SELECT user_id, competition_id as comp_id FROM registrations WHERE competition_id IN (${placeholders}) AND user_id != ?
        UNION ALL
        SELECT user_id, competition_id as comp_id FROM favorites WHERE competition_id IN (${placeholders}) AND user_id != ?
      ) matched
      JOIN users u ON matched.user_id = u.id
      JOIN competitions c ON matched.comp_id = c.id
      GROUP BY u.id
      ORDER BY match_score DESC
      LIMIT 20
    `).all([...targetIds, userId, ...targetIds, userId, ...targetIds, userId]);
        return buddies;
    }
    // 获取用户关联的竞赛ID
    getUserCompetitionIds(userId) {
        const db = getDb();
        const ids = new Set();
        const plans = db.prepare("SELECT DISTINCT competition_id FROM study_plans WHERE user_id = ? AND competition_id IS NOT NULL AND status = 'active'").all([userId]);
        plans.forEach(r => ids.add(r.competition_id));
        const regs = db.prepare("SELECT DISTINCT competition_id FROM registrations WHERE user_id = ?").all([userId]);
        regs.forEach(r => ids.add(r.competition_id));
        const favs = db.prepare("SELECT DISTINCT competition_id FROM favorites WHERE user_id = ?").all([userId]);
        favs.forEach(r => ids.add(r.competition_id));
        return Array.from(ids);
    }
    // 获取某竞赛的备赛同学列表
    getCompetitionBuddies(competitionId: number, userId: number): any[] {
        const db = getDb();
        return db.prepare(`
      SELECT DISTINCT u.id, u.username, u.college, u.major, u.avatar_url,
        CASE
          WHEN sp.id IS NOT NULL THEN '正在备赛'
          WHEN r.id IS NOT NULL THEN '已报名'
          WHEN f.id IS NOT NULL THEN '已收藏'
        END as relation,
        sp.title as plan_title
      FROM users u
      LEFT JOIN study_plans sp ON u.id = sp.user_id AND sp.competition_id = @compId AND sp.status = 'active'
      LEFT JOIN registrations r ON u.id = r.user_id AND r.competition_id = @compId
      LEFT JOIN favorites f ON u.id = f.user_id AND f.competition_id = @compId
      WHERE u.id != @userId AND (sp.id IS NOT NULL OR r.id IS NOT NULL OR f.id IS NOT NULL)
      ORDER BY (sp.id IS NOT NULL) DESC, (r.id IS NOT NULL) DESC
      LIMIT 30
    `).all({ compId: competitionId, userId });
    }
}