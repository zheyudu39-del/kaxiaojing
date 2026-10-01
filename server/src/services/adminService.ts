/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/adminService.ts

import { getDb } from '../db/database';

class AdminService {
    updateCompetition(id, data) {
        const db = getDb();
        const fields = [];
        const params = { id };
        for (const key of ['name', 'category', 'description', 'target_audience', 'fee', 'format', 'reg_start_month', 'reg_end_month', 'requirements']) {
            if (data[key] !== undefined) {
                fields.push(`${key} = @${key}`);
                params[key] = data[key];
            }
        }
        if (fields.length === 0)
            return;
        db.prepare(`UPDATE competitions SET ${fields.join(', ')} WHERE id = @id`).run(params);
    }
    createCompetition(data) {
        const db = getDb();
        if (!data.name || !data.category || !data.reg_start_month) {
            throw new Error('MISSING_FIELDS');
        }
        const result = db.prepare(`
      INSERT INTO competitions (name, category, description, target_audience, fee, format, reg_start_month, reg_end_month, requirements)
      VALUES (@name, @category, @description, @targetAudience, @fee, @format, @regStartMonth, @regEndMonth, @requirements)
    `).run({
            name: data.name, category: data.category, description: data.description || '',
            targetAudience: data.target_audience || '', fee: data.fee || '', format: data.format || 'individual',
            regStartMonth: data.reg_start_month, regEndMonth: data.reg_end_month || null, requirements: data.requirements || '',
        });
        return result.lastInsertRowid;
    }
    listUsers(page = 1, pageSize = 20) {
        const db = getDb();
        const offset = (page - 1) * pageSize;
        const total = db.prepare('SELECT COUNT(*) as count FROM users').get();
        const users = db.prepare('SELECT id, username, email, role, college, major, created_at FROM users ORDER BY id LIMIT @limit OFFSET @offset').all({ limit: pageSize, offset });
        return { users, total: total.count };
    }
    updateUserRole(userId, role) {
        if (role !== 'user' && role !== 'teacher' && role !== 'admin')
            throw new Error('INVALID_ROLE');
        const db = getDb();
        db.prepare('UPDATE users SET role = @role WHERE id = @id').run({ id: userId, role });
    }
    listAwards(page = 1, pageSize = 20) {
        const db = getDb();
        const offset = (page - 1) * pageSize;
        const total = db.prepare('SELECT COUNT(*) as count FROM awards').get();
        const awards = db.prepare(`
      SELECT a.id, a.user_id, u.username, a.competition_id, c.name as competition_name,
        a.award_level, a.award_date, a.created_at
      FROM awards a
      JOIN users u ON a.user_id = u.id
      JOIN competitions c ON a.competition_id = c.id
      ORDER BY a.created_at DESC
      LIMIT @limit OFFSET @offset
    `).all({ limit: pageSize, offset });
        return { awards, total: total.count };
    }
    addAward(data) {
        const db = getDb();
        db.prepare('INSERT INTO awards (user_id, competition_id, award_level, award_date, review_status, proof_image_url) VALUES (@userId, @competitionId, @awardLevel, @awardDate, @reviewStatus, @proofImageUrl)').run({ userId: data.user_id, competitionId: data.competition_id, awardLevel: data.award_level, awardDate: data.award_date, reviewStatus: 'approved', proofImageUrl: data.proof_image_url || null });
    }
    batchAddAwards(awards) {
        const db = getDb();
        let success = 0, failed = 0;
        // 用事务包裹批量插入，减少多次刷盘；单条失败记录警告并继续
        db.runInTransaction(() => {
            for (const a of awards) {
                try {
                    db.prepare('INSERT INTO awards (user_id, competition_id, award_level, award_date, review_status, proof_image_url) VALUES (@userId, @competitionId, @awardLevel, @awardDate, @reviewStatus, @proofImageUrl)').run({ userId: a.user_id, competitionId: a.competition_id, awardLevel: a.award_level, awardDate: a.award_date, reviewStatus: 'approved', proofImageUrl: a.proof_image_url || null });
                    success++;
                }
                catch (err) {
                    console.warn('[AdminService] batchAddAwards 单条插入失败:', err, a);
                    failed++;
                }
            }
        });
        return { success, failed };
    }
    deleteAward(id) {
        const db = getDb();
        db.prepare('DELETE FROM awards WHERE id = @id').run({ id });
    }
    deleteCompetition(id) {
        const db = getDb();
        const comp = db.prepare('SELECT id FROM competitions WHERE id = @id AND deleted_at IS NULL').get({ id });
        if (!comp)
            throw new Error('NOT_FOUND');
        db.prepare("UPDATE competitions SET deleted_at = datetime('now') WHERE id = @id").run({ id });
    }
    addLog(userId, action, target, detail, ip = '') {
        const db = getDb();
        db.prepare('INSERT INTO system_logs (user_id, action, target, detail, ip) VALUES (@userId, @action, @target, @detail, @ip)')
            .run({ userId, action, target, detail, ip });
    }
    listLogs(page = 1, pageSize = 30, keyword, action) {
        const db = getDb();
        const offset = (page - 1) * pageSize;
        let where = 'WHERE 1=1';
        const params = { limit: pageSize, offset };
        if (keyword) {
            where += ' AND (u.username LIKE @keyword OR sl.action LIKE @keyword OR sl.target LIKE @keyword OR sl.detail LIKE @keyword)';
            params.keyword = `%${keyword}%`;
        }
        if (action) {
            where += ' AND sl.action LIKE @action';
            params.action = `%${action}%`;
        }
        const total = db.prepare(`SELECT COUNT(*) as count FROM system_logs sl LEFT JOIN users u ON sl.user_id = u.id ${where}`).get(params).count;
        const logs = db.prepare(`
      SELECT sl.id, sl.user_id, u.username, sl.action, sl.target, sl.detail, sl.ip, sl.created_at
      FROM system_logs sl LEFT JOIN users u ON sl.user_id = u.id
      ${where}
      ORDER BY sl.created_at DESC LIMIT @limit OFFSET @offset
    `).all(params);
        return { logs, total };
    }
    getDashboardStats() {
        const db = getDb();
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const totalUsers = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
        const todayNewUsers = db.prepare("SELECT COUNT(*) as c FROM users WHERE date(created_at) = @today").get({ today }).c;
        const totalPosts = db.prepare("SELECT COUNT(*) as c FROM posts WHERE deleted_at IS NULL").get().c;
        const todayNewPosts = db.prepare("SELECT COUNT(*) as c FROM posts WHERE deleted_at IS NULL AND date(created_at) = @today").get({ today }).c;
        const totalTeams = db.prepare('SELECT COUNT(*) as c FROM teams').get().c;
        const totalAwards = db.prepare('SELECT COUNT(*) as c FROM awards').get().c;
        const totalCompetitions = db.prepare("SELECT COUNT(*) as c FROM competitions WHERE deleted_at IS NULL").get().c;
        // 待审核数量
        let pendingReviews = 0;
        try {
            const awardPending = db.prepare("SELECT COUNT(*) as c FROM awards WHERE review_status = 'pending'").get().c;
            const certPending = db.prepare("SELECT COUNT(*) as c FROM certificates WHERE review_status = 'pending'").get().c;
            pendingReviews = awardPending + certPending;
        }
        catch { /* tables may not exist */ }
        // 最近7天每日新增用户
        const weeklyUsers = db.prepare(`
      SELECT date(created_at) as day, COUNT(*) as count
      FROM users WHERE created_at >= date('now', '-7 days')
      GROUP BY date(created_at) ORDER BY day
    `).all();
        // 最近7天每日新增帖子
        const weeklyPosts = db.prepare(`
      SELECT date(created_at) as day, COUNT(*) as count
      FROM posts WHERE deleted_at IS NULL AND created_at >= date('now', '-7 days')
      GROUP BY date(created_at) ORDER BY day
    `).all();
        // 活跃用户（最近7天有发帖或评论的用户数）
        const activeUsers = db.prepare(`
      SELECT COUNT(DISTINCT user_id) as c FROM (
        SELECT user_id FROM posts WHERE deleted_at IS NULL AND created_at >= date('now', '-7 days')
        UNION
        SELECT user_id FROM comments WHERE created_at >= date('now', '-7 days')
      )
    `).get().c;
        return {
            total_users: totalUsers,
            today_new_users: todayNewUsers,
            total_posts: totalPosts,
            today_new_posts: todayNewPosts,
            total_teams: totalTeams,
            total_awards: totalAwards,
            total_competitions: totalCompetitions,
            pending_reviews: pendingReviews,
            active_users_7d: activeUsers,
            weekly_users: weeklyUsers,
            weekly_posts: weeklyPosts,
        };
    }
    exportDatabase() {
        const db = getDb();
        const tables = ['users', 'competitions', 'teams', 'team_members', 'awards', 'posts', 'comments', 'certificates', 'registrations'];
        const result = {};
        for (const t of tables) {
            try {
                // users 表排除敏感字段（password_hash / reset_token 等），避免导出泄漏
                if (t === 'users') {
                    result[t] = db.prepare('SELECT id, username, email, role, college, major, created_at FROM users').all();
                }
                else {
                    result[t] = db.prepare(`SELECT * FROM ${t}`).all();
                }
            }
            catch {
                result[t] = [];
            }
        }
        result.export_time = new Date().toISOString();
        return result;
    }
}
export const adminService: AdminService = new AdminService();