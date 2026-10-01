/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/teamMatchService.ts

import { getDb } from '../db/database';

// ===== 类型定义（自 .d.ts 还原）=====
export interface MatchedUser {
    id: number;
    username: string;
    college: string | null;
    major: string | null;
    avatar_url: string | null;
    score: number;
    common_categories: string[];
    skills: string[];
}

export class TeamMatchService {
    getMatches(userId: number, competitionId?: number, limit: number = 20): MatchedUser[] {
        const db = getDb();
        // 获取当前用户信息
        const user = db.prepare('SELECT college, major FROM users WHERE id = @userId').get({ userId });
        if (!user)
            return [];
        // 获取当前用户技能集
        const userSkills = db.prepare('SELECT skill FROM user_skills WHERE user_id = @userId')
            .all({ userId });
        const userSkillSet = new Set(userSkills.map(s => s.skill));
        // 获取用户参赛类别
        const userCategories = db.prepare(`
      SELECT DISTINCT c.category FROM team_members tm
      JOIN teams t ON t.id = tm.team_id JOIN competitions c ON c.id = t.competition_id
      WHERE tm.user_id = @userId
    `).all({ userId });
        const userCatSet = new Set(userCategories.map(r => r.category));
        // 获取同队用户ID
        const teammateIds = new Set();
        const teammates = db.prepare(`
      SELECT DISTINCT tm2.user_id FROM team_members tm1
      JOIN team_members tm2 ON tm2.team_id = tm1.team_id
      WHERE tm1.user_id = @userId AND tm2.user_id != @userId
    `).all({ userId });
        teammates.forEach(r => teammateIds.add(r.user_id));
        // 目标竞赛类别和所需技能
        let targetCategory = null;
        const competitionRequiredSkills = new Set();
        if (competitionId) {
            const comp = db.prepare('SELECT category FROM competitions WHERE id = @competitionId AND deleted_at IS NULL').get({ competitionId });
            targetCategory = comp?.category || null;
            // 从该竞赛的招募帖中提取所需技能
            const recruitments = db.prepare('SELECT skills FROM recruitments WHERE competition_id = @competitionId AND deleted_at IS NULL').all({ competitionId });
            for (const rec of recruitments) {
                try {
                    const parsed = JSON.parse(rec.skills || '[]');
                    parsed.forEach(s => competitionRequiredSkills.add(s));
                }
                catch {
                    // ignore parse errors
                }
            }
        }
        // 获取所有其他用户
        const allUsers = db.prepare('SELECT id, username, college, major, avatar_url FROM users WHERE id != @userId').all({ userId });
        const results = [];
        for (const u of allUsers) {
            if (teammateIds.has(u.id))
                continue;
            let score = 0;
            if (user.college && u.college === user.college)
                score += 3;
            if (user.major && u.major === user.major)
                score += 5;
            // 共同参赛类别
            const otherCats = db.prepare(`
        SELECT DISTINCT c.category FROM team_members tm
        JOIN teams t ON t.id = tm.team_id JOIN competitions c ON c.id = t.competition_id
        WHERE tm.user_id = @uid
      `).all({ uid: u.id });
            const commonCats = [];
            for (const oc of otherCats) {
                if (userCatSet.has(oc.category)) {
                    commonCats.push(oc.category);
                    score += 2;
                }
                if (targetCategory && oc.category === targetCategory)
                    score += 4;
            }
            // 技能匹配评分：获取候选用户技能，计算共同技能
            const otherSkills = db.prepare('SELECT skill FROM user_skills WHERE user_id = @uid')
                .all({ uid: u.id });
            const candidateSkillList = otherSkills.map(s => s.skill);
            const commonSkills = [];
            for (const s of candidateSkillList) {
                if (userSkillSet.has(s)) {
                    commonSkills.push(s);
                    score += 3; // 每个共同技能 +3 分
                }
            }
            // 当指定目标竞赛时，拥有该竞赛所需技能的用户额外加分
            if (competitionId && competitionRequiredSkills.size > 0) {
                for (const s of candidateSkillList) {
                    if (competitionRequiredSkills.has(s)) {
                        score += 2; // 拥有竞赛所需技能额外 +2
                    }
                }
            }
            // 团队规模平衡评分：未加入团队的用户 +2 分
            const teamCount = db.prepare('SELECT COUNT(*) as cnt FROM team_members WHERE user_id = @uid').get({ uid: u.id });
            if (teamCount.cnt === 0)
                score += 2;
            if (score > 0 || results.length < limit) {
                results.push({
                    id: u.id,
                    username: u.username,
                    college: u.college,
                    major: u.major,
                    avatar_url: u.avatar_url,
                    score,
                    common_categories: commonCats,
                    skills: candidateSkillList,
                });
            }
        }
        results.sort((a, b) => b.score - a.score);
        return results.slice(0, limit);
    }
}
export const teamMatchService: TeamMatchService = new TeamMatchService();