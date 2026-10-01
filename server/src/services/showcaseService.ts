/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/showcaseService.ts

import { getDb } from '../db/database';

// 7. 往届获奖作品展示服务
export const showcaseService = {
    // 提交作品展示
    submit(userId, data) {
        const db = getDb();
        return db.prepare(`
      INSERT INTO award_showcases (user_id, competition_id, title, description, award_level, award_year, team_members, project_url, image_urls)
      VALUES (@userId, @competitionId, @title, @description, @awardLevel, @awardYear, @teamMembers, @projectUrl, @imageUrls)
    `).run({
            userId,
            competitionId: data.competitionId,
            title: data.title,
            description: data.description,
            awardLevel: data.awardLevel,
            awardYear: data.awardYear,
            teamMembers: data.teamMembers || null,
            projectUrl: data.projectUrl || null,
            imageUrls: data.imageUrls || null
        });
    },
    // 获取作品列表
    list(filters, page = 1, limit = 20) {
        const db = getDb();
        const offset = (page - 1) * limit;
        let sql = `
      SELECT s.*, c.name as competition_name, c.category, u.username, u.avatar_url,
        (SELECT COUNT(*) FROM showcase_likes WHERE showcase_id = s.id) as like_count
      FROM award_showcases s
      JOIN competitions c ON s.competition_id = c.id
      JOIN users u ON s.user_id = u.id
      WHERE s.review_status = 'approved'
    `;
        const params = { limit, offset };
        if (filters.competitionId) {
            sql += ' AND s.competition_id = @competitionId';
            params.competitionId = filters.competitionId;
        }
        if (filters.awardLevel) {
            sql += ' AND s.award_level = @awardLevel';
            params.awardLevel = filters.awardLevel;
        }
        if (filters.year) {
            sql += ' AND s.award_year = @year';
            params.year = filters.year;
        }
        sql += ' ORDER BY s.award_year DESC, like_count DESC LIMIT @limit OFFSET @offset';
        return db.prepare(sql).all(params);
    },
    // 获取作品详情
    getById(showcaseId) {
        const db = getDb();
        return db.prepare(`
      SELECT s.*, c.name as competition_name, c.category, u.username, u.avatar_url,
        (SELECT COUNT(*) FROM showcase_likes WHERE showcase_id = s.id) as like_count
      FROM award_showcases s
      JOIN competitions c ON s.competition_id = c.id
      JOIN users u ON s.user_id = u.id
      WHERE s.id = @showcaseId
    `).get({ showcaseId });
    },
    // 点赞作品
    like(showcaseId, userId) {
        const db = getDb();
        return db.prepare(`
      INSERT OR IGNORE INTO showcase_likes (showcase_id, user_id) VALUES (@showcaseId, @userId)
    `).run({ showcaseId, userId });
    },
    // 取消点赞
    unlike(showcaseId, userId) {
        const db = getDb();
        return db.prepare(`
      DELETE FROM showcase_likes WHERE showcase_id = @showcaseId AND user_id = @userId
    `).run({ showcaseId, userId });
    },
    // 检查是否已点赞
    isLiked(showcaseId, userId) {
        const db = getDb();
        const row = db.prepare(`
      SELECT id FROM showcase_likes WHERE showcase_id = @showcaseId AND user_id = @userId
    `).get({ showcaseId, userId });
        return !!row;
    },
    // 获取用户提交的作品
    getUserShowcases(userId) {
        const db = getDb();
        return db.prepare(`
      SELECT s.*, c.name as competition_name
      FROM award_showcases s
      JOIN competitions c ON s.competition_id = c.id
      WHERE s.user_id = @userId
      ORDER BY s.created_at DESC
    `).all({ userId });
    }
};