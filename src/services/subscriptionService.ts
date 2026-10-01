/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/subscriptionService.ts

import { getDb } from '../db/database';

// 1. 竞赛提醒订阅服务
export const subscriptionService = {
    // 订阅竞赛提醒
    subscribe(userId, competitionId, reminderDays = 3) {
        const db = getDb();
        return db.prepare(`
      INSERT OR REPLACE INTO competition_subscriptions (user_id, competition_id, reminder_days)
      VALUES (@userId, @competitionId, @reminderDays)
    `).run({ userId, competitionId, reminderDays });
    },
    // 取消订阅
    unsubscribe(userId, competitionId) {
        const db = getDb();
        return db.prepare(`
      DELETE FROM competition_subscriptions WHERE user_id = @userId AND competition_id = @competitionId
    `).run({ userId, competitionId });
    },
    // 获取用户订阅列表
    getUserSubscriptions(userId) {
        const db = getDb();
        return db.prepare(`
      SELECT cs.*, c.name, c.category, c.reg_start_month, c.reg_end_month
      FROM competition_subscriptions cs
      JOIN competitions c ON cs.competition_id = c.id
      WHERE cs.user_id = @userId
      ORDER BY cs.created_at DESC
    `).all({ userId });
    },
    // 检查是否已订阅
    isSubscribed(userId, competitionId) {
        const db = getDb();
        const row = db.prepare(`
      SELECT id FROM competition_subscriptions WHERE user_id = @userId AND competition_id = @competitionId
    `).get({ userId, competitionId });
        return !!row;
    },
    // 获取需要发送提醒的订阅（用于定时任务）
    getPendingReminders() {
        const db = getDb();
        const currentMonth = new Date().getMonth() + 1;
        return db.prepare(`
      SELECT cs.*, c.name, c.reg_end_month, u.email, u.username
      FROM competition_subscriptions cs
      JOIN competitions c ON cs.competition_id = c.id
      JOIN users u ON cs.user_id = u.id
      WHERE cs.is_notified = 0
        AND c.reg_end_month IS NOT NULL
        AND c.reg_end_month >= @currentMonth
        AND c.reg_end_month <= @currentMonth + 1
    `).all({ currentMonth });
    },
    // 标记已通知
    markNotified(subscriptionId) {
        const db = getDb();
        return db.prepare(`
      UPDATE competition_subscriptions SET is_notified = 1 WHERE id = @subscriptionId
    `).run({ subscriptionId });
    }
};