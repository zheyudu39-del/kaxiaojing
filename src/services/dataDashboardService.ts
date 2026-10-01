/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/dataDashboardService.ts

import { getDb } from '../db/database';

export class DataDashboardService {
    // 综合统计概览
    getOverview(): { totalUsers: any; totalCompetitions: any; totalTeams: any; totalPosts: any; totalRegistrations: any; totalAwards: any; } {
        const db = getDb();
        const users = db.prepare('SELECT COUNT(*) as count FROM users').get();
        const competitions = db.prepare('SELECT COUNT(*) as count FROM competitions').get();
        const teams = db.prepare('SELECT COUNT(*) as count FROM teams').get();
        const posts = db.prepare('SELECT COUNT(*) as count FROM posts').get();
        const registrations = db.prepare('SELECT COUNT(*) as count FROM registrations').get();
        const awards = db.prepare('SELECT COUNT(*) as count FROM awards').get();
        return {
            totalUsers: users?.count || 0, totalCompetitions: competitions?.count || 0,
            totalTeams: teams?.count || 0, totalPosts: posts?.count || 0,
            totalRegistrations: registrations?.count || 0, totalAwards: awards?.count || 0,
        };
    }
    // 按类别统计竞赛数量
    getCompetitionsByCategory(): any[] {
        const db = getDb();
        return db.prepare('SELECT category, COUNT(*) as count FROM competitions GROUP BY category ORDER BY count DESC').all();
    }
    // 按类别统计参赛人数
    getParticipantsByCategory(): any[] {
        const db = getDb();
        return db.prepare(`SELECT c.category, COUNT(DISTINCT r.user_id) as count FROM registrations r
       JOIN competitions c ON r.competition_id = c.id GROUP BY c.category ORDER BY count DESC`).all();
    }
    // 按学院统计参赛人数
    getParticipantsByCollege(): any[] {
        const db = getDb();
        return db.prepare(`SELECT COALESCE(u.college, '未设置') as college, COUNT(DISTINCT r.user_id) as count
       FROM registrations r JOIN users u ON r.user_id = u.id GROUP BY u.college ORDER BY count DESC LIMIT 15`).all();
    }
    // 获奖等级分布
    getAwardDistribution(): any[] {
        const db = getDb();
        return db.prepare('SELECT award_level as level, COUNT(*) as count FROM awards GROUP BY award_level ORDER BY count DESC').all();
    }
    // 月度注册趋势
    getMonthlyRegistrationTrend(): any[] {
        const db = getDb();
        return db.prepare(`SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count FROM registrations
       GROUP BY month ORDER BY month DESC LIMIT 12`).all().reverse();
    }
    // 月度用户增长趋势
    getMonthlyUserGrowth(): any[] {
        const db = getDb();
        return db.prepare(`SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count FROM users
       GROUP BY month ORDER BY month DESC LIMIT 12`).all().reverse();
    }
    // 热门竞赛排行（按报名人数）
    getHotCompetitions(limit: number = 10): any[] {
        const db = getDb();
        return db.prepare(`SELECT c.id, c.name, c.category, COUNT(r.id) as registration_count
       FROM competitions c LEFT JOIN registrations r ON c.id = r.competition_id
       GROUP BY c.id ORDER BY registration_count DESC LIMIT @limit`).all({ limit });
    }
    // 活跃用户排行
    getActiveUsers(limit: number = 10): any[] {
        const db = getDb();
        return db.prepare(`SELECT u.id, u.username, u.college,
       (SELECT COUNT(*) FROM registrations WHERE user_id = u.id) as reg_count,
       (SELECT COUNT(*) FROM awards WHERE user_id = u.id) as award_count,
       (SELECT COUNT(*) FROM posts WHERE user_id = u.id) as post_count
       FROM users u ORDER BY (reg_count + award_count + post_count) DESC LIMIT @limit`).all({ limit });
    }
}