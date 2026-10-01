/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/smartRecommendService.ts

import { getDb } from '../db/database';

// 智能竞赛推荐服务
export const smartRecommendService = {
    // 获取个性化推荐
    getRecommendations(userId, limit = 10) {
        const db = getDb();
        // 获取用户信息
        const user = db.prepare('SELECT college, major FROM users WHERE id = @userId').get({ userId });
        // 获取用户技能
        const skills = db.prepare('SELECT skill FROM user_skills WHERE user_id = @userId').all({ userId });
        const userSkills = skills.map(s => s.skill);
        // 获取用户已参加的竞赛
        const participated = db.prepare(`
      SELECT DISTINCT competition_id FROM registrations WHERE user_id = @userId
    `).all({ userId });
        const participatedIds = participated.map(p => p.competition_id);
        // 获取用户收藏的竞赛类别
        const favoriteCategories = db.prepare(`
      SELECT c.category, COUNT(*) as count
      FROM favorites f
      JOIN competitions c ON f.competition_id = c.id
      WHERE f.user_id = @userId
      GROUP BY c.category
      ORDER BY count DESC
    `).all({ userId });
        // 获取用户获奖的竞赛类别
        const awardCategories = db.prepare(`
      SELECT c.category, COUNT(*) as count
      FROM awards a
      JOIN competitions c ON a.competition_id = c.id
      WHERE a.user_id = @userId AND a.review_status = 'approved'
      GROUP BY c.category
      ORDER BY count DESC
    `).all({ userId });
        // 构建推荐分数
        const recommendations = [];
        // 获取所有竞赛
        const competitions = db.prepare(`
      SELECT c.*, 
        (SELECT AVG(difficulty) FROM competition_ratings WHERE competition_id = c.id) as avg_difficulty,
        (SELECT AVG(value) FROM competition_ratings WHERE competition_id = c.id) as avg_value,
        (SELECT AVG(recommend) FROM competition_ratings WHERE competition_id = c.id) as avg_recommend,
        (SELECT COUNT(*) FROM registrations WHERE competition_id = c.id) as participant_count
      FROM competitions c
      WHERE c.deleted_at IS NULL
    `).all();
        for (const comp of competitions) {
            // 跳过已参加的
            if (participatedIds.includes(comp.id))
                continue;
            let score = 0;
            const reasons = [];
            // 1. 类别匹配（基于收藏）
            const favCat = favoriteCategories.find(fc => fc.category === comp.category);
            if (favCat) {
                score += favCat.count * 10;
                reasons.push('与你收藏的竞赛类别相同');
            }
            // 2. 类别匹配（基于获奖）
            const awardCat = awardCategories.find(ac => ac.category === comp.category);
            if (awardCat) {
                score += awardCat.count * 15;
                reasons.push('你在该类别有获奖经历');
            }
            // 3. 学院匹配
            if (user?.college && comp.target_audience?.includes(user.college)) {
                score += 20;
                reasons.push('适合你的学院');
            }
            // 4. 专业匹配
            if (user?.major && comp.target_audience?.includes(user.major)) {
                score += 25;
                reasons.push('适合你的专业');
            }
            // 5. 技能匹配
            if (userSkills.length > 0 && comp.requirements) {
                const matchedSkills = userSkills.filter(skill => comp.requirements.toLowerCase().includes(skill.toLowerCase()));
                if (matchedSkills.length > 0) {
                    score += matchedSkills.length * 10;
                    reasons.push(`匹配你的技能: ${matchedSkills.join(', ')}`);
                }
            }
            // 6. 热门度加成
            if (comp.participant_count > 50) {
                score += 5;
                reasons.push('热门竞赛');
            }
            // 7. 高评分加成
            if (comp.avg_recommend && comp.avg_recommend >= 4) {
                score += 10;
                reasons.push('用户推荐度高');
            }
            // 8. 报名时间匹配（当前月份在报名期内）
            const currentMonth = new Date().getMonth() + 1;
            if (comp.reg_start_month <= currentMonth &&
                (!comp.reg_end_month || comp.reg_end_month >= currentMonth)) {
                score += 15;
                reasons.push('正在报名中');
            }
            if (score > 0) {
                recommendations.push({
                    ...comp,
                    score,
                    reasons: reasons.slice(0, 3) // 最多显示3个理由
                });
            }
        }
        // 按分数排序
        recommendations.sort((a, b) => b.score - a.score);
        return recommendations.slice(0, limit);
    },
    // 获取相似竞赛推荐
    getSimilarCompetitions(competitionId, limit = 5) {
        const db = getDb();
        const competition = db.prepare('SELECT * FROM competitions WHERE id = @competitionId').get({ competitionId });
        if (!competition)
            return [];
        return db.prepare(`
      SELECT c.*,
        (SELECT COUNT(*) FROM registrations WHERE competition_id = c.id) as participant_count
      FROM competitions c
      WHERE c.id != @competitionId
        AND c.deleted_at IS NULL
        AND c.category = @category
      ORDER BY participant_count DESC
      LIMIT @limit
    `).all({ competitionId, category: competition.category, limit });
    },
    // 获取热门竞赛
    getTrendingCompetitions(limit = 10) {
        const db = getDb();
        // 最近30天报名最多的竞赛
        return db.prepare(`
      SELECT c.*,
        COUNT(r.id) as recent_registrations,
        (SELECT AVG(recommend) FROM competition_ratings WHERE competition_id = c.id) as avg_recommend
      FROM competitions c
      LEFT JOIN registrations r ON c.id = r.competition_id 
        AND r.created_at >= date('now', '-30 days')
      WHERE c.deleted_at IS NULL
      GROUP BY c.id
      ORDER BY recent_registrations DESC, avg_recommend DESC
      LIMIT @limit
    `).all({ limit });
    },
    // 获取即将截止报名的竞赛
    getDeadlineSoon(limit = 10) {
        const db = getDb();
        const currentMonth = new Date().getMonth() + 1;
        return db.prepare(`
      SELECT c.*,
        (SELECT COUNT(*) FROM registrations WHERE competition_id = c.id) as participant_count
      FROM competitions c
      WHERE c.deleted_at IS NULL
        AND c.reg_end_month IS NOT NULL
        AND c.reg_end_month >= @currentMonth
        AND c.reg_end_month <= @currentMonth + 1
      ORDER BY c.reg_end_month ASC
      LIMIT @limit
    `).all({ currentMonth, limit });
    }
};