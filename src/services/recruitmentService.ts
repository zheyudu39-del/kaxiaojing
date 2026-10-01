/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/recruitmentService.ts

import { getDb } from '../db/database';

class RecruitmentService {
    createPost(userId, data) {
        const db = getDb();
        for (const field of ['competition_id', 'team_name', 'description', 'contact']) {
            if (!data[field])
                throw new Error(`MISSING:${field}`);
        }
        const result = db.prepare(`
      INSERT INTO recruitments (user_id, competition_id, team_name, skills, description, contact, deadline, review_status)
      VALUES (@userId, @competitionId, @teamName, @skills, @description, @contact, @deadline, 'approved')
    `).run({
            userId, competitionId: data.competition_id, teamName: data.team_name,
            skills: JSON.stringify(data.skills || []), description: data.description, contact: data.contact,
            deadline: data.deadline || null,
        });
        return this.getPostDetail(result.lastInsertRowid);
    }
    listPosts(filters) {
        const db = getDb();
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 20;
        const offset = (page - 1) * pageSize;
        let where = filters.includesClosed ? "WHERE r.review_status = 'approved' AND r.deleted_at IS NULL" : "WHERE r.status = 'open' AND r.review_status = 'approved' AND r.deleted_at IS NULL";
        const params = { limit: pageSize, offset };
        if (filters.competition_id) {
            where += ' AND r.competition_id = @competitionId';
            params.competitionId = filters.competition_id;
        }
        if (filters.skill) {
            where += ' AND r.skills LIKE @skill';
            params.skill = `%${filters.skill}%`;
        }
        const total = db.prepare(`SELECT COUNT(*) as count FROM recruitments r ${where}`).get(params);
        const posts = db.prepare(`
      SELECT r.*, u.username as author_username, c.name as competition_name
      FROM recruitments r
      JOIN users u ON r.user_id = u.id
      JOIN competitions c ON r.competition_id = c.id
      ${where}
      ORDER BY r.created_at DESC
      LIMIT @limit OFFSET @offset
    `).all(params);
        return { posts: posts.map((p) => ({ ...p, skills: JSON.parse(p.skills || '[]') })), total: total.count };
    }
    getPostDetail(postId) {
        const db = getDb();
        const post = db.prepare(`
      SELECT r.*, u.username as author_username, c.name as competition_name
      FROM recruitments r
      JOIN users u ON r.user_id = u.id
      JOIN competitions c ON r.competition_id = c.id
      WHERE r.id = @postId AND r.deleted_at IS NULL
    `).get({ postId });
        if (!post)
            return null;
        return { ...post, skills: JSON.parse(post.skills || '[]') };
    }
    closePost(postId, userId) {
        const db = getDb();
        const post = db.prepare('SELECT id, user_id FROM recruitments WHERE id = @postId AND deleted_at IS NULL').get({ postId });
        if (!post)
            return false;
        if (post.user_id !== userId)
            throw new Error('FORBIDDEN');
        db.prepare("UPDATE recruitments SET status = 'closed' WHERE id = @postId").run({ postId });
        return true;
    }
    deletePost(postId, userId) {
        const db = getDb();
        const post = db.prepare('SELECT id, user_id FROM recruitments WHERE id = @postId AND deleted_at IS NULL').get({ postId });
        if (!post)
            return false;
        if (post.user_id !== userId)
            throw new Error('FORBIDDEN');
        db.prepare("UPDATE recruitments SET deleted_at = datetime('now') WHERE id = @postId").run({ postId });
        return true;
    }
    // === 申请加入 ===
    applyToRecruitment(recruitmentId, userId, msg) {
        const db = getDb();
        const post = db.prepare('SELECT id, user_id, status FROM recruitments WHERE id = @recruitmentId AND deleted_at IS NULL').get({ recruitmentId });
        if (!post)
            throw new Error('NOT_FOUND');
        if (post.status !== 'open')
            throw new Error('CLOSED');
        if (post.user_id === userId)
            throw new Error('SELF_APPLY');
        const existing = db.prepare('SELECT id FROM recruitment_applications WHERE recruitment_id = @recruitmentId AND user_id = @userId').get({ recruitmentId, userId });
        if (existing)
            throw new Error('ALREADY_APPLIED');
        db.prepare('INSERT INTO recruitment_applications (recruitment_id, user_id, message) VALUES (@recruitmentId, @userId, @msg)')
            .run({ recruitmentId, userId, msg: msg || '' });
        return true;
    }
    listApplications(recruitmentId, userId) {
        const db = getDb();
        const post = db.prepare('SELECT user_id FROM recruitments WHERE id = @recruitmentId').get({ recruitmentId });
        if (!post || post.user_id !== userId)
            throw new Error('FORBIDDEN');
        return db.prepare(`
      SELECT ra.*, u.username as applicant_username
      FROM recruitment_applications ra JOIN users u ON ra.user_id = u.id
      WHERE ra.recruitment_id = @recruitmentId ORDER BY ra.created_at DESC
    `).all({ recruitmentId });
    }
    handleApplication(applicationId, userId, action) {
        const db = getDb();
        const app = db.prepare(`
      SELECT ra.*, r.user_id as owner_id FROM recruitment_applications ra
      JOIN recruitments r ON ra.recruitment_id = r.id WHERE ra.id = @applicationId
    `).get({ applicationId });
        if (!app)
            throw new Error('NOT_FOUND');
        if (app.owner_id !== userId)
            throw new Error('FORBIDDEN');
        db.prepare('UPDATE recruitment_applications SET status = @action WHERE id = @applicationId').run({ action, applicationId });
        return true;
    }
}
export const recruitmentService: RecruitmentService = new RecruitmentService();