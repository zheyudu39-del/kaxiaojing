/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/mentorService.ts

import { getDb } from '../db/database';

// 导师/学长匹配服务
export const mentorService = {
    // 获取导师列表
    getMentors(filters) {
        const db = getDb();
        let sql = `
      SELECT m.*, u.username, u.avatar_url, u.college, u.major,
        (SELECT COUNT(*) FROM mentor_requests WHERE mentor_id = m.user_id AND status = 'approved') as mentee_count,
        (SELECT AVG(rating) FROM mentor_reviews WHERE mentor_id = m.user_id) as avg_rating
      FROM mentors m
      JOIN users u ON m.user_id = u.id
      WHERE m.is_active = 1
    `;
        const params = {};
        if (filters?.competitionId) {
            sql += ` AND m.competition_ids LIKE '%' || @competitionId || '%'`;
            params.competitionId = filters.competitionId.toString();
        }
        if (filters?.skill) {
            sql += ` AND m.skills LIKE '%' || @skill || '%'`;
            params.skill = filters.skill;
        }
        sql += ` ORDER BY avg_rating DESC NULLS LAST, mentee_count DESC`;
        return db.prepare(sql).all(params);
    },
    // 获取导师详情
    getMentorById(mentorId) {
        const db = getDb();
        return db.prepare(`
      SELECT m.*, u.username, u.avatar_url, u.college, u.major, u.bio,
        (SELECT COUNT(*) FROM mentor_requests WHERE mentor_id = m.user_id AND status = 'approved') as mentee_count,
        (SELECT AVG(rating) FROM mentor_reviews WHERE mentor_id = m.user_id) as avg_rating,
        (SELECT COUNT(*) FROM mentor_reviews WHERE mentor_id = m.user_id) as review_count
      FROM mentors m
      JOIN users u ON m.user_id = u.id
      WHERE m.id = @mentorId
    `).get({ mentorId });
    },
    // 申请成为导师
    applyMentor(userId, data) {
        const db = getDb();
        return db.prepare(`
      INSERT INTO mentors (user_id, competition_ids, skills, introduction, achievements, available_time, max_mentees)
      VALUES (@userId, @competitionIds, @skills, @introduction, @achievements, @availableTime, @maxMentees)
    `).run({
            userId,
            competitionIds: JSON.stringify(data.competitionIds),
            skills: JSON.stringify(data.skills),
            introduction: data.introduction,
            achievements: data.achievements,
            availableTime: data.availableTime,
            maxMentees: data.maxMentees
        });
    },
    // 检查用户是否已是导师
    isMentor(userId) {
        const db = getDb();
        const result = db.prepare('SELECT id FROM mentors WHERE user_id = @userId').get({ userId });
        return !!result;
    },
    // 获取用户的导师信息
    getUserMentorInfo(userId) {
        const db = getDb();
        return db.prepare('SELECT * FROM mentors WHERE user_id = @userId').get({ userId });
    },
    // 申请指导
    requestMentor(menteeId, mentorUserId, message, competitionId) {
        const db = getDb();
        return db.prepare(`
      INSERT INTO mentor_requests (mentee_id, mentor_id, competition_id, message)
      VALUES (@menteeId, @mentorUserId, @competitionId, @message)
    `).run({ menteeId, mentorUserId: mentorUserId, competitionId: competitionId || null, message });
    },
    // 获取导师收到的申请
    getMentorRequests(mentorUserId) {
        const db = getDb();
        return db.prepare(`
      SELECT r.*, u.username, u.avatar_url, u.college, u.major,
        c.name as competition_name
      FROM mentor_requests r
      JOIN users u ON r.mentee_id = u.id
      LEFT JOIN competitions c ON r.competition_id = c.id
      WHERE r.mentor_id = @mentorUserId
      ORDER BY r.created_at DESC
    `).all({ mentorUserId });
    },
    // 获取用户发出的申请
    getUserRequests(menteeId) {
        const db = getDb();
        return db.prepare(`
      SELECT r.*, u.username as mentor_name, u.avatar_url as mentor_avatar,
        c.name as competition_name
      FROM mentor_requests r
      JOIN mentors m ON r.mentor_id = m.user_id
      JOIN users u ON m.user_id = u.id
      LEFT JOIN competitions c ON r.competition_id = c.id
      WHERE r.mentee_id = @menteeId
      ORDER BY r.created_at DESC
    `).all({ menteeId });
    },
    // 处理申请
    handleRequest(requestId, status, mentorUserId) {
        const db = getDb();
        // 验证是否是该导师的申请
        const request = db.prepare('SELECT * FROM mentor_requests WHERE id = @requestId AND mentor_id = @mentorUserId').get({ requestId, mentorUserId });
        if (!request)
            return null;
        return db.prepare(`
      UPDATE mentor_requests SET status = @status, updated_at = datetime('now')
      WHERE id = @requestId
    `).run({ requestId, status });
    },
    // 获取我的学员
    getMyMentees(mentorUserId) {
        const db = getDb();
        return db.prepare(`
      SELECT r.*, u.username, u.avatar_url, u.college, u.major,
        c.name as competition_name
      FROM mentor_requests r
      JOIN users u ON r.mentee_id = u.id
      LEFT JOIN competitions c ON r.competition_id = c.id
      WHERE r.mentor_id = @mentorUserId AND r.status = 'approved'
      ORDER BY r.updated_at DESC
    `).all({ mentorUserId });
    },
    // 获取我的导师
    getMyMentors(menteeId) {
        const db = getDb();
        return db.prepare(`
      SELECT r.*, u.username as mentor_name, u.avatar_url as mentor_avatar,
        u.college as mentor_college, m.introduction,
        c.name as competition_name
      FROM mentor_requests r
      JOIN mentors m ON r.mentor_id = m.user_id
      JOIN users u ON m.user_id = u.id
      LEFT JOIN competitions c ON r.competition_id = c.id
      WHERE r.mentee_id = @menteeId AND r.status = 'approved'
      ORDER BY r.updated_at DESC
    `).all({ menteeId });
    },
    // 评价导师
    reviewMentor(menteeId, mentorUserId, rating, content) {
        const db = getDb();
        return db.prepare(`
      INSERT INTO mentor_reviews (mentee_id, mentor_id, rating, content)
      VALUES (@menteeId, @mentorUserId, @rating, @content)
    `).run({ menteeId, mentorUserId, rating, content });
    },
    // 获取导师评价
    getMentorReviews(mentorUserId) {
        const db = getDb();
        return db.prepare(`
      SELECT r.*, u.username, u.avatar_url
      FROM mentor_reviews r
      JOIN users u ON r.mentee_id = u.id
      WHERE r.mentor_id = @mentorUserId
      ORDER BY r.created_at DESC
    `).all({ mentorUserId });
    },
    // 更新导师状态
    updateMentorStatus(userId, isActive) {
        const db = getDb();
        return db.prepare('UPDATE mentors SET is_active = @isActive WHERE user_id = @userId').run({ userId, isActive: isActive ? 1 : 0 });
    }
};