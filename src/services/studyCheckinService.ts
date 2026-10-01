/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/studyCheckinService.ts

import { getDb } from '../db/database';

export class StudyCheckinService {
    // 创建训练计划
    createPlan(userId: number, data: {
        title: string;
        description?: string;
        competitionId?: number;
        dailyGoal?: string;
        startDate: string;
        endDate: string;
    }): any {
        const db = getDb();
        const result = db.prepare(`INSERT INTO study_plans (user_id, competition_id, title, description, daily_goal, start_date, end_date) VALUES (@userId, @competitionId, @title, @description, @dailyGoal, @startDate, @endDate)`).run({
            userId, competitionId: data.competitionId || null, title: data.title,
            description: data.description || '', dailyGoal: data.dailyGoal || '',
            startDate: data.startDate, endDate: data.endDate,
        });
        return this.getPlanById(result.lastInsertRowid);
    }
    // 获取用户的训练计划列表
    getUserPlans(userId: number, status?: string): any[] {
        const db = getDb();
        let sql = `SELECT sp.*, c.name as competition_name,
      (SELECT COUNT(*) FROM study_checkins sc WHERE sc.plan_id = sp.id) as checkin_count,
      (SELECT MAX(checkin_date) FROM study_checkins sc WHERE sc.plan_id = sp.id) as last_checkin
      FROM study_plans sp LEFT JOIN competitions c ON sp.competition_id = c.id
      WHERE sp.user_id = @userId`;
        const params = { userId };
        if (status) {
            sql += ' AND sp.status = @status';
            params.status = status;
        }
        sql += ' ORDER BY sp.created_at DESC';
        return db.prepare(sql).all(params);
    }
    getPlanById(planId: number): any {
        const db = getDb();
        return db.prepare(`SELECT sp.*, c.name as competition_name FROM study_plans sp LEFT JOIN competitions c ON sp.competition_id = c.id WHERE sp.id = @planId`).get({ planId });
    }
    // 更新计划状态
    updatePlanStatus(planId: number, userId: number, status: string): { changes: number; lastInsertRowid: number; } {
        const db = getDb();
        return db.prepare('UPDATE study_plans SET status = @status WHERE id = @planId AND user_id = @userId').run({ status, planId, userId });
    }
    // 打卡
    checkin(userId: number, planId: number, data: {
        content?: string;
        duration?: number;
        checkinDate: string;
    }): { id: number; } {
        const db = getDb();
        const result = db.prepare(`INSERT INTO study_checkins (user_id, plan_id, content, duration, checkin_date) VALUES (@userId, @planId, @content, @duration, @checkinDate)`).run({ userId, planId, content: data.content || '', duration: data.duration || 0, checkinDate: data.checkinDate });
        return { id: result.lastInsertRowid };
    }
    // 获取计划的打卡记录
    getPlanCheckins(planId: number, userId: number): any[] {
        const db = getDb();
        return db.prepare('SELECT * FROM study_checkins WHERE plan_id = @planId AND user_id = @userId ORDER BY checkin_date DESC').all({ planId, userId });
    }
    // 获取用户打卡统计
    getUserStats(userId: number): { totalCheckins: any; totalDuration: any; activePlans: any; streak: number; } {
        const db = getDb();
        const totalCheckins = db.prepare('SELECT COUNT(*) as count FROM study_checkins WHERE user_id = @userId').get({ userId });
        const totalDuration = db.prepare('SELECT COALESCE(SUM(duration), 0) as total FROM study_checkins WHERE user_id = @userId').get({ userId });
        const activePlans = db.prepare("SELECT COUNT(*) as count FROM study_plans WHERE user_id = @userId AND status = 'active'").get({ userId });
        // 连续打卡天数
        const recentCheckins = db.prepare('SELECT DISTINCT checkin_date FROM study_checkins WHERE user_id = @userId ORDER BY checkin_date DESC LIMIT 60').all({ userId });
        let streak = 0;
        const today = new Date().toISOString().split('T')[0];
        let checkDate = new Date(today);
        for (const row of recentCheckins) {
            const expected = checkDate.toISOString().split('T')[0];
            if (row.checkin_date === expected) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            }
            else
                break;
        }
        return { totalCheckins: totalCheckins?.count || 0, totalDuration: totalDuration?.total || 0, activePlans: activePlans?.count || 0, streak };
    }
    // 删除打卡记录
    deleteCheckin(checkinId: number, userId: number): { changes: number; lastInsertRowid: number; } {
        const db = getDb();
        return db.prepare('DELETE FROM study_checkins WHERE id = @checkinId AND user_id = @userId').run({ checkinId, userId });
    }
}