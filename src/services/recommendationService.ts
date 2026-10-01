/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/recommendationService.ts

import { getDb } from '../db/database';

// ===== 类型定义（自 .d.ts 还原）=====
export interface RecommendedCompetition {
    id: number;
    name: string;
    category: string;
    description: string;
    score: number;
    reason: string;
}

export class RecommendationService {
    /**
     * 智能推荐：基于学院/专业关联和参赛历史类别加权
     * 算法：学院匹配+10，专业匹配+15，历史类别每匹配+2
     * 排除用户已参加的竞赛
     */
    getRecommendations(userId: number, limit: number = 10): RecommendedCompetition[] {
        const db = getDb();
        // 1. 获取用户学院和专业
        const user = db.prepare('SELECT college, major FROM users WHERE id = @userId').get({ userId });
        if (!user || (!user.college && !user.major)) {
            return this.getDefaultRecommendations(limit, userId);
        }
        // 2. 获取用户已参加的竞赛ID（通过 team_members + teams）
        const participatedIds = this.getParticipatedCompetitionIds(userId);
        // 3. 查找学院ID
        let collegeId = null;
        if (user.college) {
            const college = db.prepare('SELECT id FROM colleges WHERE name = @name').get({ name: user.college });
            collegeId = college?.id ?? null;
        }
        // 4. 查找专业ID
        let majorId = null;
        if (user.major) {
            const major = db.prepare('SELECT id FROM majors WHERE name = @name').get({ name: user.major });
            majorId = major?.id ?? null;
        }
        // 5. 获取学院关联竞赛ID集合
        const collegeCompIds = new Set();
        if (collegeId !== null) {
            const rows = db.prepare('SELECT competition_id FROM college_competitions WHERE college_id = @collegeId').all({ collegeId });
            rows.forEach(r => collegeCompIds.add(r.competition_id));
        }
        // 6. 获取专业关联竞赛ID集合
        const majorCompIds = new Set();
        if (majorId !== null) {
            const rows = db.prepare('SELECT competition_id FROM major_competitions WHERE major_id = @majorId').all({ majorId });
            rows.forEach(r => majorCompIds.add(r.competition_id));
        }
        // 7. 获取用户参赛历史类别（频率统计）
        const historyCategories = this.getHistoryCategories(userId);
        // 8. 获取所有竞赛并计算分数
        const allCompetitions = db.prepare('SELECT id, name, category, description FROM competitions').all();
        const scored = [];
        for (const comp of allCompetitions) {
            // 排除已参加的竞赛
            if (participatedIds.has(comp.id))
                continue;
            let score = 0;
            const reasons = [];
            // 学院匹配 +10
            if (collegeCompIds.has(comp.id)) {
                score += 10;
                reasons.push('学院推荐');
            }
            // 专业匹配 +15
            if (majorCompIds.has(comp.id)) {
                score += 15;
                reasons.push('专业推荐');
            }
            // 历史类别匹配 +2 per match
            const categoryCount = historyCategories.get(comp.category) || 0;
            if (categoryCount > 0) {
                score += 2 * categoryCount;
                reasons.push('参赛历史相关');
            }
            if (score > 0) {
                scored.push({
                    id: comp.id,
                    name: comp.name,
                    category: comp.category,
                    description: comp.description,
                    score,
                    reason: reasons.join('、'),
                });
            }
        }
        // 9. 按分数降序排序，取 limit 条
        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, limit);
    }
    /**
     * 默认推荐：按热度（参赛队伍数）降序排序
     */
    getDefaultRecommendations(limit: number = 10, excludeUserId?: number): RecommendedCompetition[] {
        const db = getDb();
        // 获取用户已参加的竞赛
        const participatedIds = excludeUserId ? this.getParticipatedCompetitionIds(excludeUserId) : new Set();
        // 按队伍数降序
        const rows = db.prepare(`
      SELECT c.id, c.name, c.category, c.description, COUNT(t.id) AS team_count
      FROM competitions c
      LEFT JOIN teams t ON t.competition_id = c.id
      GROUP BY c.id
      ORDER BY team_count DESC
      LIMIT @limit
    `).all({ limit: limit + participatedIds.size });
        const results = [];
        for (const row of rows) {
            if (participatedIds.has(row.id))
                continue;
            if (results.length >= limit)
                break;
            results.push({
                id: row.id,
                name: row.name,
                category: row.category,
                description: row.description,
                score: row.team_count,
                reason: '热门竞赛',
            });
        }
        return results;
    }
    /**
     * 获取用户已参加的竞赛ID集合
     */
    getParticipatedCompetitionIds(userId) {
        const db = getDb();
        const rows = db.prepare(`
      SELECT DISTINCT t.competition_id
      FROM team_members tm
      JOIN teams t ON t.id = tm.team_id
      WHERE tm.user_id = @userId
    `).all({ userId });
        return new Set(rows.map(r => r.competition_id));
    }
    /**
     * 获取用户参赛历史中的竞赛类别频率
     */
    getHistoryCategories(userId) {
        const db = getDb();
        const rows = db.prepare(`
      SELECT c.category, COUNT(*) AS cnt
      FROM team_members tm
      JOIN teams t ON t.id = tm.team_id
      JOIN competitions c ON c.id = t.competition_id
      WHERE tm.user_id = @userId
      GROUP BY c.category
    `).all({ userId });
        const map = new Map();
        rows.forEach(r => map.set(r.category, r.cnt));
        return map;
    }
}
export const recommendationService: RecommendationService = new RecommendationService();