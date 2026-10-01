/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/weeklyReportService.ts

import { getDb } from '../db/database';

export class WeeklyReportService {
    // 生成周报/月报
    generateReport(userId: number, type: 'week' | 'month'): { type: "week" | "month"; period: { start: string; end: string; }; summary: { checkinDays: any; totalStudyMinutes: any; newRegistrations: number; newAwards: number; postsWritten: any; questionsAsked: any; answersGiven: any; quizAttempts: any; avgQuizScore: number; streak: number; }; details: { checkins: any[]; registrations: any[]; awards: any[]; activePlans: any[]; }; } {
        const db = getDb();
        const now = new Date();
        let startDate;
        if (type === 'week') {
            const d = new Date(now);
            d.setDate(d.getDate() - 7);
            startDate = d.toISOString().split('T')[0];
        }
        else {
            const d = new Date(now);
            d.setMonth(d.getMonth() - 1);
            startDate = d.toISOString().split('T')[0];
        }
        const endDate = now.toISOString().split('T')[0];
        // 学习打卡统计
        const checkinStats = db.prepare(`
      SELECT COUNT(*) as count, COALESCE(SUM(duration), 0) as total_duration
      FROM study_checkins WHERE user_id = @userId AND checkin_date >= @startDate AND checkin_date <= @endDate
    `).get({ userId, startDate, endDate });
        // 打卡详情
        const checkinDetails = db.prepare(`
      SELECT sc.checkin_date, sc.content, sc.duration, sp.title as plan_title
      FROM study_checkins sc JOIN study_plans sp ON sc.plan_id = sp.id
      WHERE sc.user_id = @userId AND sc.checkin_date >= @startDate AND sc.checkin_date <= @endDate
      ORDER BY sc.checkin_date DESC
    `).all({ userId, startDate, endDate });
        // 新增报名
        const newRegistrations = db.prepare(`
      SELECT r.created_at, c.name as competition_name, c.category
      FROM registrations r JOIN competitions c ON r.competition_id = c.id
      WHERE r.user_id = @userId AND r.created_at >= @startDate
      ORDER BY r.created_at DESC
    `).all({ userId, startDate });
        // 新增获奖
        const newAwards = db.prepare(`
      SELECT a.award_level, a.created_at, c.name as competition_name
      FROM awards a JOIN competitions c ON a.competition_id = c.id
      WHERE a.user_id = @userId AND a.created_at >= @startDate
      ORDER BY a.created_at DESC
    `).all({ userId, startDate });
        // 发帖数
        const postCount = db.prepare(`
      SELECT COUNT(*) as count FROM posts WHERE user_id = @userId AND created_at >= @startDate
    `).get({ userId, startDate });
        // 问答贡献
        const qaStats = db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM qa_questions WHERE user_id = @userId AND created_at >= @startDate) as questions,
        (SELECT COUNT(*) FROM qa_answers WHERE user_id = @userId AND created_at >= @startDate) as answers
    `).get({ userId, startDate });
        // 模拟练习
        const quizStats = db.prepare(`
      SELECT COUNT(*) as attempts, COALESCE(AVG(score), 0) as avg_score
      FROM quiz_attempts WHERE user_id = @userId AND created_at >= @startDate
    `).get({ userId, startDate });
        // 活跃计划
        const activePlans = db.prepare(`
      SELECT sp.title, sp.daily_goal, c.name as competition_name,
        (SELECT COUNT(*) FROM study_checkins sc WHERE sc.plan_id = sp.id AND sc.checkin_date >= @startDate AND sc.checkin_date <= @endDate) as period_checkins
      FROM study_plans sp LEFT JOIN competitions c ON sp.competition_id = c.id
      WHERE sp.user_id = @userId AND sp.status = 'active'
    `).all({ userId, startDate, endDate });
        // 连续打卡天数
        const recentCheckins = db.prepare('SELECT DISTINCT checkin_date FROM study_checkins WHERE user_id = @userId ORDER BY checkin_date DESC LIMIT 60').all({ userId });
        let streak = 0;
        let checkDate = new Date(endDate);
        for (const row of recentCheckins) {
            const expected = checkDate.toISOString().split('T')[0];
            if (row.checkin_date === expected) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            }
            else
                break;
        }
        return {
            type,
            period: { start: startDate, end: endDate },
            summary: {
                checkinDays: checkinStats?.count || 0,
                totalStudyMinutes: checkinStats?.total_duration || 0,
                newRegistrations: newRegistrations.length,
                newAwards: newAwards.length,
                postsWritten: postCount?.count || 0,
                questionsAsked: qaStats?.questions || 0,
                answersGiven: qaStats?.answers || 0,
                quizAttempts: quizStats?.attempts || 0,
                avgQuizScore: Math.round(quizStats?.avg_score || 0),
                streak,
            },
            details: {
                checkins: checkinDetails,
                registrations: newRegistrations,
                awards: newAwards,
                activePlans,
            },
        };
    }
}