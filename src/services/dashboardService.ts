/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/dashboardService.ts

import { getDb } from '../db/database';

export class DashboardService {
    getPublicStats(): { total_users: any; total_competitions: any; total_teams: any; upcoming_competitions: any[]; latest_posts: any[]; } {
        const db = getDb();
        const totalUsers = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
        const totalCompetitions = db.prepare('SELECT COUNT(*) as c FROM competitions').get().c;
        const totalTeams = db.prepare('SELECT COUNT(*) as c FROM teams').get().c;
        const currentMonth = new Date().getMonth() + 1;
        const upcomingCompetitions = db.prepare('SELECT id, name, category, reg_start_month, reg_end_month FROM competitions WHERE reg_start_month >= @month OR (reg_start_month <= @month AND (reg_end_month >= @month OR reg_end_month IS NULL)) ORDER BY reg_start_month LIMIT 10').all({ month: currentMonth });
        const latestPosts = db.prepare('SELECT p.id, p.title, p.created_at, u.username FROM posts p JOIN users u ON u.id = p.user_id ORDER BY p.created_at DESC LIMIT 5').all();
        return { total_users: totalUsers, total_competitions: totalCompetitions, total_teams: totalTeams, upcoming_competitions: upcomingCompetitions, latest_posts: latestPosts };
    }
    getPersonalizedData(userId: number): { expiring_favorites: any[]; recent_participations: any[]; team_activity: any[]; followed_posts: any[]; recommended_competitions: any[]; } {
        const db = getDb();
        const currentMonth = new Date().getMonth() + 1;
        const expiringFavorites = db.prepare('SELECT c.id, c.name, c.category, c.reg_end_month FROM favorites f JOIN competitions c ON c.id = f.competition_id WHERE f.user_id = @userId AND c.reg_end_month IS NOT NULL AND c.reg_end_month >= @month ORDER BY c.reg_end_month LIMIT 5').all({ userId, month: currentMonth });
        const recentParticipations = db.prepare('SELECT c.id, c.name, c.category, t.name as team_name, tm.joined_at FROM team_members tm JOIN teams t ON t.id = tm.team_id JOIN competitions c ON c.id = t.competition_id WHERE tm.user_id = @userId ORDER BY tm.joined_at DESC LIMIT 5').all({ userId });
        // 我的队伍最新动态（最近加入的成员）
        const teamActivity = db.prepare(`
      SELECT t.id as team_id, t.name as team_name, c.name as competition_name,
        u.username as new_member, tm2.joined_at
      FROM team_members tm
      JOIN teams t ON t.id = tm.team_id
      JOIN competitions c ON c.id = t.competition_id
      JOIN team_members tm2 ON tm2.team_id = t.id AND tm2.user_id != @userId
      JOIN users u ON u.id = tm2.user_id
      WHERE tm.user_id = @userId
      ORDER BY tm2.joined_at DESC LIMIT 5
    `).all({ userId });
        // 关注的人最新帖子
        const followedPosts = db.prepare(`
      SELECT p.id, p.title, p.created_at, u.username, u.avatar_url
      FROM posts p
      JOIN users u ON u.id = p.user_id
      JOIN follows f ON f.followee_id = p.user_id
      WHERE f.follower_id = @userId AND p.deleted_at IS NULL AND p.review_status = 'approved'
      ORDER BY p.created_at DESC LIMIT 5
    `).all({ userId });
        // 推荐竞赛（基于用户参赛类别）
        const recommendedCompetitions = db.prepare(`
      SELECT DISTINCT c.id, c.name, c.category, c.reg_start_month, c.reg_end_month,
        '与你参赛类别相关' as reason
      FROM competitions c
      WHERE c.deleted_at IS NULL AND c.category IN (
        SELECT DISTINCT c2.category FROM team_members tm
        JOIN teams t ON t.id = tm.team_id
        JOIN competitions c2 ON c2.id = t.competition_id
        WHERE tm.user_id = @userId
      )
      AND c.id NOT IN (SELECT t.competition_id FROM team_members tm JOIN teams t ON t.id = tm.team_id WHERE tm.user_id = @userId)
      ORDER BY c.reg_start_month LIMIT 5
    `).all({ userId });
        return { expiring_favorites: expiringFavorites, recent_participations: recentParticipations,
            team_activity: teamActivity, followed_posts: followedPosts, recommended_competitions: recommendedCompetitions };
    }
}
export const dashboardService: DashboardService = new DashboardService();