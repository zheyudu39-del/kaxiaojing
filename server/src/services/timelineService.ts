/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/timelineService.ts

import { getDb } from '../db/database';

// 竞赛时间线服务
export const timelineService = {
    // 获取用户竞赛时间线
    getUserTimeline(userId) {
        const db = getDb();
        // 获取各类事件
        const registrations = db.prepare(`
      SELECT 'registration' as event_type, r.created_at as event_date,
        c.id as competition_id, c.name as competition_name, c.category,
        NULL as award_level, NULL as team_name
      FROM registrations r
      JOIN competitions c ON r.competition_id = c.id
      WHERE r.user_id = @userId AND r.status = 'registered'
    `).all({ userId });
        const awards = db.prepare(`
      SELECT 'award' as event_type, a.award_date as event_date,
        c.id as competition_id, c.name as competition_name, c.category,
        a.award_level, NULL as team_name
      FROM awards a
      JOIN competitions c ON a.competition_id = c.id
      WHERE a.user_id = @userId AND a.review_status = 'approved'
    `).all({ userId });
        const teamJoins = db.prepare(`
      SELECT 'team_join' as event_type, tm.joined_at as event_date,
        c.id as competition_id, c.name as competition_name, c.category,
        NULL as award_level, t.name as team_name
      FROM team_members tm
      JOIN teams t ON tm.team_id = t.id
      JOIN competitions c ON t.competition_id = c.id
      WHERE tm.user_id = @userId
    `).all({ userId });
        const teamCreations = db.prepare(`
      SELECT 'team_create' as event_type, t.created_at as event_date,
        c.id as competition_id, c.name as competition_name, c.category,
        NULL as award_level, t.name as team_name
      FROM teams t
      JOIN competitions c ON t.competition_id = c.id
      WHERE t.leader_id = @userId
    `).all({ userId });
        // 合并并按时间排序
        const timeline = [...registrations, ...awards, ...teamJoins, ...teamCreations]
            .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
        return timeline;
    },
    // 获取用户竞赛统计
    getUserStats(userId) {
        const db = getDb();
        const totalCompetitions = db.prepare(`
      SELECT COUNT(DISTINCT competition_id) as count FROM registrations WHERE user_id = @userId
    `).get({ userId });
        const totalAwards = db.prepare(`
      SELECT COUNT(*) as count FROM awards WHERE user_id = @userId AND review_status = 'approved'
    `).get({ userId });
        const awardsByLevel = db.prepare(`
      SELECT award_level, COUNT(*) as count
      FROM awards
      WHERE user_id = @userId AND review_status = 'approved'
      GROUP BY award_level
    `).all({ userId });
        const teamCount = db.prepare(`
      SELECT COUNT(DISTINCT team_id) as count FROM team_members WHERE user_id = @userId
    `).get({ userId });
        const categoryStats = db.prepare(`
      SELECT c.category, COUNT(DISTINCT r.competition_id) as count
      FROM registrations r
      JOIN competitions c ON r.competition_id = c.id
      WHERE r.user_id = @userId
      GROUP BY c.category
    `).all({ userId });
        return {
            totalCompetitions: totalCompetitions.count,
            totalAwards: totalAwards.count,
            awardsByLevel,
            teamCount: teamCount.count,
            categoryStats
        };
    },
    // 获取用户成长曲线数据（按月统计）
    getGrowthData(userId) {
        const db = getDb();
        // 获取最近12个月的数据
        const months = [];
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        }
        const registrationsByMonth = db.prepare(`
      SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count
      FROM registrations
      WHERE user_id = @userId AND created_at >= date('now', '-12 months')
      GROUP BY month
    `).all({ userId });
        const awardsByMonth = db.prepare(`
      SELECT strftime('%Y-%m', award_date) as month, COUNT(*) as count
      FROM awards
      WHERE user_id = @userId AND review_status = 'approved' AND award_date >= date('now', '-12 months')
      GROUP BY month
    `).all({ userId });
        // 构建完整的月度数据
        const regMap = new Map(registrationsByMonth.map(r => [r.month, r.count]));
        const awardMap = new Map(awardsByMonth.map(a => [a.month, a.count]));
        return months.map(month => ({
            month,
            registrations: regMap.get(month) || 0,
            awards: awardMap.get(month) || 0
        }));
    },
    // 获取用户里程碑
    getMilestones(userId) {
        const db = getDb();
        const milestones = [];
        // 第一次参赛
        const firstReg = db.prepare(`
      SELECT r.created_at, c.name as competition_name
      FROM registrations r
      JOIN competitions c ON r.competition_id = c.id
      WHERE r.user_id = @userId
      ORDER BY r.created_at ASC
      LIMIT 1
    `).get({ userId });
        if (firstReg) {
            milestones.push({ type: 'first_competition', ...firstReg });
        }
        // 第一次获奖
        const firstAward = db.prepare(`
      SELECT a.award_date, a.award_level, c.name as competition_name
      FROM awards a
      JOIN competitions c ON a.competition_id = c.id
      WHERE a.user_id = @userId AND a.review_status = 'approved'
      ORDER BY a.award_date ASC
      LIMIT 1
    `).get({ userId });
        if (firstAward) {
            milestones.push({ type: 'first_award', ...firstAward });
        }
        // 第一次组队
        const firstTeam = db.prepare(`
      SELECT t.created_at, t.name as team_name, c.name as competition_name
      FROM teams t
      JOIN competitions c ON t.competition_id = c.id
      WHERE t.leader_id = @userId
      ORDER BY t.created_at ASC
      LIMIT 1
    `).get({ userId });
        if (firstTeam) {
            milestones.push({ type: 'first_team', ...firstTeam });
        }
        // 最高奖项
        const bestAward = db.prepare(`
      SELECT a.award_date, a.award_level, c.name as competition_name
      FROM awards a
      JOIN competitions c ON a.competition_id = c.id
      WHERE a.user_id = @userId AND a.review_status = 'approved'
      ORDER BY 
        CASE a.award_level 
          WHEN '特等奖' THEN 1
          WHEN '一等奖' THEN 2
          WHEN '金奖' THEN 2
          WHEN '二等奖' THEN 3
          WHEN '银奖' THEN 3
          WHEN '三等奖' THEN 4
          WHEN '铜奖' THEN 4
          ELSE 5
        END ASC
      LIMIT 1
    `).get({ userId });
        if (bestAward) {
            milestones.push({ type: 'best_award', ...bestAward });
        }
        return milestones;
    }
};