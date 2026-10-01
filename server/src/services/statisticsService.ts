/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/statisticsService.ts

import { getDb } from '../db/database';

class StatisticsService {
    // 按月份+类别的报名趋势数据（用于折线图）
    getRegistrationTrend() {
        const db = getDb();
        return db.prepare(`
      SELECT strftime('%Y-%m', t.created_at) as month, c.category, COUNT(*) as count
      FROM teams t
      JOIN competitions c ON t.competition_id = c.id
      WHERE c.deleted_at IS NULL
      GROUP BY month, c.category
      ORDER BY month ASC
    `).all();
    }
    // 按竞赛类别的参赛人数统计（用于柱状图）
    getParticipantsByCategory() {
        const db = getDb();
        return db.prepare(`
      SELECT c.category, COUNT(DISTINCT tm.user_id) as count
      FROM team_members tm
      JOIN teams t ON tm.team_id = t.id
      JOIN competitions c ON t.competition_id = c.id
      WHERE c.deleted_at IS NULL
      GROUP BY c.category
      ORDER BY count DESC
    `).all();
    }
    // 获奖等级分布（用于饼图）
    getAwardDistribution() {
        const db = getDb();
        return db.prepare(`
      SELECT award_level as level, COUNT(*) as count
      FROM awards
      GROUP BY award_level
      ORDER BY count DESC
    `).all();
    }
    // 按学院的获奖统计
    getAwardsByCollege(timeRange) {
        const db = getDb();
        let where = "WHERE u.college IS NOT NULL AND u.college != ''";
        const params = {};
        if (timeRange?.start) {
            where += ' AND a.award_date >= @start';
            params.start = timeRange.start;
        }
        if (timeRange?.end) {
            where += ' AND a.award_date <= @end';
            params.end = timeRange.end;
        }
        return db.prepare(`
      SELECT u.college, a.award_level as level, COUNT(*) as count
      FROM awards a
      JOIN users u ON a.user_id = u.id
      ${where}
      GROUP BY u.college, a.award_level
      ORDER BY count DESC
    `).all(params);
    }
    // 按竞赛的获奖率
    getAwardsByCompetition(timeRange) {
        const db = getDb();
        let where = 'WHERE c.deleted_at IS NULL';
        const params = {};
        if (timeRange?.start) {
            where += ' AND a.award_date >= @start';
            params.start = timeRange.start;
        }
        if (timeRange?.end) {
            where += ' AND a.award_date <= @end';
            params.end = timeRange.end;
        }
        const results = db.prepare(`
      SELECT c.name,
        (SELECT COUNT(DISTINCT tm.user_id) FROM team_members tm JOIN teams t ON tm.team_id = t.id WHERE t.competition_id = c.id) as participants,
        COUNT(a.id) as awards
      FROM competitions c
      LEFT JOIN awards a ON c.id = a.competition_id
      ${where}
      GROUP BY c.id
      HAVING participants > 0
      ORDER BY awards DESC
      LIMIT 20
    `).all(params);
        return results.map(r => ({
            ...r,
            rate: r.participants > 0 ? Math.round((r.awards / r.participants) * 100) : 0
        }));
    }
    getOverview() {
        const db = getDb();
        const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
        const totalTeams = db.prepare('SELECT COUNT(*) as count FROM teams').get().count;
        const totalParticipations = db.prepare('SELECT COUNT(*) as count FROM team_members').get().count;
        const totalPosts = db.prepare('SELECT COUNT(*) as count FROM posts WHERE deleted_at IS NULL').get().count;
        const totalAwards = db.prepare('SELECT COUNT(*) as count FROM awards').get().count;
        const totalResources = db.prepare('SELECT COUNT(*) as count FROM resources WHERE deleted_at IS NULL').get().count;
        const totalRecruitments = db.prepare('SELECT COUNT(*) as count FROM recruitments WHERE deleted_at IS NULL').get().count;
        const totalCertificates = db.prepare('SELECT COUNT(*) as count FROM certificates').get().count;
        // 获奖等级分布
        const awardDistribution = db.prepare(`
      SELECT award_level, COUNT(*) as count FROM awards GROUP BY award_level ORDER BY count DESC LIMIT 10
    `).all();
        return { total_users: totalUsers, total_teams: totalTeams, total_participations: totalParticipations,
            total_posts: totalPosts, total_awards: totalAwards, total_resources: totalResources,
            total_recruitments: totalRecruitments, total_certificates: totalCertificates,
            award_distribution: awardDistribution };
    }
    getCollegeParticipation() {
        const db = getDb();
        return db.prepare(`
      SELECT u.college, COUNT(DISTINCT t.id) as team_count
      FROM teams t
      JOIN users u ON t.leader_id = u.id
      WHERE u.college IS NOT NULL AND u.college != ''
      GROUP BY u.college
      ORDER BY team_count DESC
    `).all();
    }
    getCompetitionPopularity() {
        const db = getDb();
        return db.prepare(`
      SELECT c.id, c.name, c.category, COUNT(t.id) as team_count,
        (SELECT COUNT(*) FROM team_members tm JOIN teams t2 ON tm.team_id = t2.id WHERE t2.competition_id = c.id) as participant_count
      FROM competitions c
      LEFT JOIN teams t ON c.id = t.competition_id
      WHERE c.deleted_at IS NULL
      GROUP BY c.id
      HAVING team_count > 0
      ORDER BY team_count DESC
    `).all();
    }
    getMonthlyTrend() {
        const db = getDb();
        return db.prepare(`
      SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as team_count
      FROM teams
      GROUP BY month
      ORDER BY month ASC
    `).all();
    }
    getCompetitionDetail(competitionId) {
        const db = getDb();
        const comp = db.prepare('SELECT id, name, category FROM competitions WHERE id = @id AND deleted_at IS NULL').get({ id: competitionId });
        if (!comp)
            return null;
        const teamCount = db.prepare('SELECT COUNT(*) as count FROM teams WHERE competition_id = @id').get({ id: competitionId }).count;
        const participantCount = db.prepare(`
      SELECT COUNT(*) as count FROM team_members tm
      JOIN teams t ON tm.team_id = t.id WHERE t.competition_id = @id
    `).get({ id: competitionId }).count;
        const collegeDistribution = db.prepare(`
      SELECT u.college, COUNT(DISTINCT t.id) as team_count
      FROM teams t JOIN users u ON t.leader_id = u.id
      WHERE t.competition_id = @id AND u.college IS NOT NULL AND u.college != ''
      GROUP BY u.college ORDER BY team_count DESC
    `).all({ id: competitionId });
        return { ...comp, team_count: teamCount, participant_count: participantCount, college_distribution: collegeDistribution };
    }
    getRankingByCollege() {
        const db = getDb();
        return db.prepare(`
      SELECT u.college, COUNT(DISTINCT a.id) as award_count,
        COUNT(DISTINCT tm.user_id) as participant_count,
        SUM(CASE WHEN a.award_level LIKE '%一等%' OR a.award_level LIKE '%金%' THEN 1 ELSE 0 END) as gold_count
      FROM users u
      LEFT JOIN awards a ON u.id = a.user_id
      LEFT JOIN team_members tm ON u.id = tm.user_id
      WHERE u.college IS NOT NULL AND u.college != ''
      GROUP BY u.college
      ORDER BY award_count DESC
    `).all();
    }
    getRankingByCategory() {
        const db = getDb();
        return db.prepare(`
      SELECT c.category, COUNT(DISTINCT t.id) as team_count,
        COUNT(DISTINCT a.id) as award_count,
        (SELECT COUNT(*) FROM team_members tm2 JOIN teams t2 ON tm2.team_id = t2.id JOIN competitions c2 ON t2.competition_id = c2.id WHERE c2.category = c.category) as participant_count
      FROM competitions c
      LEFT JOIN teams t ON c.id = t.competition_id
      LEFT JOIN awards a ON c.id = a.competition_id
      WHERE c.deleted_at IS NULL
      GROUP BY c.category
      ORDER BY team_count DESC
    `).all();
    }
}
export const statisticsService: StatisticsService = new StatisticsService();