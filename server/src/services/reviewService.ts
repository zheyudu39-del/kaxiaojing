/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/reviewService.ts

import { getDb } from '../db/database';

// ===== 类型定义（自 .d.ts 还原）=====
interface ReviewItem {
    content_type: 'award' | 'certificate' | 'avatar' | 'teacher_cert';
    content_id: number;
    title: string;
    submitter_id: number;
    submitter_name: string;
    review_status: 'pending' | 'approved' | 'rejected';
    review_comment: string | null;
    reviewed_by: number | null;
    reviewed_at: string | null;
    proof_image_url: string | null;
    created_at: string;
}
interface ReviewListParams {
    content_type?: string;
    status?: string;
    page: number;
    pageSize: number;
}
interface ReviewStats {
    total_pending: number;
    award_pending: number;
    certificate_pending: number;
    avatar_pending: number;
    teacher_cert_pending: number;
}

const CONTENT_TYPE_LABELS = {
    award: '获奖认证',
    certificate: '证书认证',
    avatar: '头像审核',
    teacher_cert: '教师认证',
};
const TABLE_MAP = {
    award: 'awards',
    certificate: 'cert_study_plans',
    teacher_cert: 'teacher_certifications',
};
class ReviewService {
    listReviewItems(params) {
        const db = getDb();
        const status = params.status || 'pending';
        const contentType = params.content_type;
        const offset = (params.page - 1) * params.pageSize;
        const subQueries = [];
        // awards
        if (!contentType || contentType === 'award') {
            subQueries.push(`
        SELECT 'award' as content_type, a.id as content_id,
          c.name || ' - ' || a.award_level as title,
          a.user_id as submitter_id, u.username as submitter_name,
          a.review_status, a.review_comment, a.reviewed_by, a.reviewed_at,
          a.proof_image_url, a.created_at
        FROM awards a
        JOIN users u ON a.user_id = u.id
        JOIN competitions c ON a.competition_id = c.id
        WHERE a.review_status = @status
      `);
        }
        // cert_study_plans
        if (!contentType || contentType === 'certificate') {
            subQueries.push(`
        SELECT 'certificate' as content_type, csp.id as content_id,
          cert.name as title,
          csp.user_id as submitter_id, u.username as submitter_name,
          csp.review_status, csp.review_comment, csp.reviewed_by, csp.reviewed_at,
          csp.proof_image_url, csp.created_at
        FROM cert_study_plans csp
        JOIN users u ON csp.user_id = u.id
        JOIN certificates cert ON csp.certificate_id = cert.id
        WHERE csp.review_status = @status
      `);
        }
        // avatar review
        if (!contentType || contentType === 'avatar') {
            subQueries.push(`
        SELECT 'avatar' as content_type, u.id as content_id,
          u.username || ' 的头像' as title,
          u.id as submitter_id, u.username as submitter_name,
          u.avatar_review_status as review_status, NULL as review_comment, NULL as reviewed_by, NULL as reviewed_at,
          u.pending_avatar_url as proof_image_url, u.created_at
        FROM users u
        WHERE u.avatar_review_status = @status AND u.pending_avatar_url IS NOT NULL
      `);
        }
        // teacher_cert review
        if (!contentType || contentType === 'teacher_cert') {
            subQueries.push(`
        SELECT 'teacher_cert' as content_type, tc.id as content_id,
          u.username || ' - 教师认证' as title,
          tc.user_id as submitter_id, u.username as submitter_name,
          tc.review_status, tc.review_comment, tc.reviewed_by, tc.reviewed_at,
          tc.cert_image_url as proof_image_url, tc.created_at
        FROM teacher_certifications tc
        JOIN users u ON tc.user_id = u.id
        WHERE tc.review_status = @status
      `);
        }
        if (subQueries.length === 0) {
            return { items: [], total: 0 };
        }
        const unionSql = subQueries.join(' UNION ALL ');
        const countSql = `SELECT COUNT(*) as count FROM (${unionSql})`;
        const totalResult = db.prepare(countSql).get({ status });
        // 必须再包一层 SELECT *：按单类型筛选时 UNION 只剩一个子查询，
        // 此时 ORDER BY created_at 会直接作用在带 JOIN 的查询上，
        // 而 awards / users / competitions 都有 created_at 列 →
        // sql.js 报 "ambiguous column name: created_at" 并返回 500。
        // 包成派生表后 ORDER BY 只面对输出列，不再歧义。
        const dataSql = `SELECT * FROM (${unionSql}) ORDER BY created_at DESC LIMIT @limit OFFSET @offset`;
        const items = db.prepare(dataSql).all({ status, limit: params.pageSize, offset });
        return { items, total: totalResult.count };
    }
    getReviewDetail(contentType, contentId) {
        const db = getDb();
        switch (contentType) {
            case 'award': {
                return db.prepare(`
          SELECT 'award' as content_type, a.id as content_id,
            c.name || ' - ' || a.award_level as title,
            a.user_id as submitter_id, u.username as submitter_name,
            a.review_status, a.review_comment, a.reviewed_by, a.reviewed_at,
            a.proof_image_url, a.created_at,
            a.competition_id, c.name as competition_name, a.award_level, a.award_date
          FROM awards a
          JOIN users u ON a.user_id = u.id
          JOIN competitions c ON a.competition_id = c.id
          WHERE a.id = @id
        `).get({ id: contentId }) || null;
            }
            case 'certificate': {
                return db.prepare(`
          SELECT 'certificate' as content_type, csp.id as content_id,
            cert.name as title,
            csp.user_id as submitter_id, u.username as submitter_name,
            csp.review_status, csp.review_comment, csp.reviewed_by, csp.reviewed_at,
            csp.proof_image_url, csp.created_at,
            csp.certificate_id, cert.name as certificate_name, csp.target_date, csp.status as plan_status, csp.notes
          FROM cert_study_plans csp
          JOIN users u ON csp.user_id = u.id
          JOIN certificates cert ON csp.certificate_id = cert.id
          WHERE csp.id = @id
        `).get({ id: contentId }) || null;
            }
            case 'avatar': {
                return db.prepare(`
          SELECT 'avatar' as content_type, u.id as content_id,
            u.username || ' 的头像' as title,
            u.id as submitter_id, u.username as submitter_name,
            u.avatar_review_status as review_status, NULL as review_comment, NULL as reviewed_by, NULL as reviewed_at,
            u.pending_avatar_url as proof_image_url, u.created_at,
            u.avatar_url as current_avatar_url, u.pending_avatar_url
          FROM users u
          WHERE u.id = @id
        `).get({ id: contentId }) || null;
            }
            case 'teacher_cert': {
                return db.prepare(`
          SELECT 'teacher_cert' as content_type, tc.id as content_id,
            u.username || ' - 教师认证' as title,
            tc.user_id as submitter_id, u.username as submitter_name,
            tc.review_status, tc.review_comment, tc.reviewed_by, tc.reviewed_at,
            tc.cert_image_url as proof_image_url, tc.created_at,
            tc.real_name, tc.college
          FROM teacher_certifications tc
          JOIN users u ON tc.user_id = u.id
          WHERE tc.id = @id
        `).get({ id: contentId }) || null;
            }
            default:
                return null;
        }
    }
    approveItem(contentType, contentId, reviewerId) {
        const db = getDb();
        if (contentType === 'avatar') {
            const user = db.prepare('SELECT id, pending_avatar_url, avatar_review_status FROM users WHERE id = @id').get({ id: contentId });
            if (!user)
                throw new Error('NOT_FOUND');
            if (user.avatar_review_status !== 'pending')
                throw new Error('ALREADY_REVIEWED');
            db.prepare(`
        UPDATE users SET avatar_url = pending_avatar_url, avatar_review_status = 'approved', pending_avatar_url = NULL
        WHERE id = @id
      `).run({ id: contentId });
            db.prepare('INSERT INTO notifications (user_id, type, title, content, is_read) VALUES (@userId, @type, @title, @content, 0)').run({ userId: contentId, type: 'review_approved', title: '头像审核通过', content: '您上传的头像已通过审核' });
            db.prepare('INSERT INTO system_logs (user_id, action, target, detail) VALUES (@userId, @action, @target, @detail)').run({ userId: reviewerId, action: 'review_approve', target: `avatar:${contentId}`, detail: '通过头像审核' });
            return;
        }
        const table = TABLE_MAP[contentType];
        if (!table)
            throw new Error('INVALID_CONTENT_TYPE');
        const item = db.prepare(`SELECT id, user_id, review_status FROM ${table} WHERE id = @id`).get({ id: contentId });
        if (!item)
            throw new Error('NOT_FOUND');
        if (item.review_status !== 'pending')
            throw new Error('ALREADY_REVIEWED');
        const now = new Date().toISOString();
        db.prepare(`
      UPDATE ${table} SET review_status = 'approved', reviewed_by = @reviewerId, reviewed_at = @now
      WHERE id = @id
    `).run({ id: contentId, reviewerId, now });
        // 教师认证通过时，更新用户角色为 teacher
        if (contentType === 'teacher_cert') {
            db.prepare("UPDATE users SET role = 'teacher' WHERE id = @userId").run({ userId: item.user_id });
        }
        const label = CONTENT_TYPE_LABELS[contentType] || contentType;
        db.prepare('INSERT INTO notifications (user_id, type, title, content, is_read) VALUES (@userId, @type, @title, @content, 0)').run({ userId: item.user_id, type: 'review_approved', title: '审核通过', content: `您提交的${label}已通过审核` });
        db.prepare('INSERT INTO system_logs (user_id, action, target, detail) VALUES (@userId, @action, @target, @detail)').run({ userId: reviewerId, action: 'review_approve', target: `${contentType}:${contentId}`, detail: `通过${label}审核` });
    }
    rejectItem(contentType, contentId, reviewerId, comment) {
        const db = getDb();
        if (contentType === 'avatar') {
            const user = db.prepare('SELECT id, avatar_review_status FROM users WHERE id = @id').get({ id: contentId });
            if (!user)
                throw new Error('NOT_FOUND');
            if (user.avatar_review_status !== 'pending')
                throw new Error('ALREADY_REVIEWED');
            db.prepare(`
        UPDATE users SET avatar_review_status = 'rejected', pending_avatar_url = NULL
        WHERE id = @id
      `).run({ id: contentId });
            db.prepare('INSERT INTO notifications (user_id, type, title, content, is_read) VALUES (@userId, @type, @title, @content, 0)').run({ userId: contentId, type: 'review_rejected', title: '头像审核未通过', content: `您上传的头像未通过审核，原因：${comment}` });
            db.prepare('INSERT INTO system_logs (user_id, action, target, detail) VALUES (@userId, @action, @target, @detail)').run({ userId: reviewerId, action: 'review_reject', target: `avatar:${contentId}`, detail: `拒绝头像审核，理由：${comment}` });
            return;
        }
        const table = TABLE_MAP[contentType];
        if (!table)
            throw new Error('INVALID_CONTENT_TYPE');
        const item = db.prepare(`SELECT id, user_id, review_status FROM ${table} WHERE id = @id`).get({ id: contentId });
        if (!item)
            throw new Error('NOT_FOUND');
        if (item.review_status !== 'pending')
            throw new Error('ALREADY_REVIEWED');
        const now = new Date().toISOString();
        db.prepare(`
      UPDATE ${table} SET review_status = 'rejected', review_comment = @comment, reviewed_by = @reviewerId, reviewed_at = @now
      WHERE id = @id
    `).run({ id: contentId, comment, reviewerId, now });
        const label = CONTENT_TYPE_LABELS[contentType] || contentType;
        db.prepare('INSERT INTO notifications (user_id, type, title, content, is_read) VALUES (@userId, @type, @title, @content, 0)').run({ userId: item.user_id, type: 'review_rejected', title: '审核未通过', content: `您提交的${label}未通过审核，原因：${comment}` });
        db.prepare('INSERT INTO system_logs (user_id, action, target, detail) VALUES (@userId, @action, @target, @detail)').run({ userId: reviewerId, action: 'review_reject', target: `${contentType}:${contentId}`, detail: `拒绝${label}审核，理由：${comment}` });
    }
    batchApprove(items, reviewerId) {
        let success = 0;
        let failed = 0;
        for (const item of items) {
            try {
                this.approveItem(item.content_type, item.content_id, reviewerId);
                success++;
            }
            catch {
                failed++;
            }
        }
        return { success, failed };
    }
    getReviewStats() {
        const db = getDb();
        const awardCount = db.prepare("SELECT COUNT(*) as count FROM awards WHERE review_status = 'pending'").get().count;
        const certCount = db.prepare("SELECT COUNT(*) as count FROM cert_study_plans WHERE review_status = 'pending'").get().count;
        const avatarCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE avatar_review_status = 'pending' AND pending_avatar_url IS NOT NULL").get().count;
        const teacherCertCount = db.prepare("SELECT COUNT(*) as count FROM teacher_certifications WHERE review_status = 'pending'").get().count;
        return {
            total_pending: awardCount + certCount + avatarCount + teacherCertCount,
            award_pending: awardCount,
            certificate_pending: certCount,
            avatar_pending: avatarCount,
            teacher_cert_pending: teacherCertCount,
        };
    }
}
export const reviewService: ReviewService = new ReviewService();