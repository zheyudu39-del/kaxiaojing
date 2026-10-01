/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/favoriteService.ts

import { getDb } from '../db/database';

class FavoriteService {
    addFavorite(userId, competitionId) {
        const db = getDb();
        const comp = db.prepare('SELECT id FROM competitions WHERE id = @id').get({ id: competitionId });
        if (!comp)
            throw new Error('NOT_FOUND');
        const existing = db.prepare('SELECT id FROM favorites WHERE user_id = @userId AND competition_id = @competitionId')
            .get({ userId, competitionId });
        if (existing)
            throw new Error('DUPLICATE');
        try {
            db.prepare('INSERT INTO favorites (user_id, competition_id) VALUES (@userId, @competitionId)')
                .run({ userId, competitionId });
        }
        catch (err) {
            if (err.message && err.message.includes('UNIQUE constraint failed')) {
                throw new Error('DUPLICATE');
            }
            throw err;
        }
    }
    removeFavorite(userId, competitionId) {
        const db = getDb();
        const result = db.prepare('DELETE FROM favorites WHERE user_id = @userId AND competition_id = @competitionId')
            .run({ userId, competitionId });
        if (result.changes === 0)
            throw new Error('NOT_FOUND');
    }
    getFavorites(userId, page = 1, pageSize = 20) {
        const db = getDb();
        const offset = (page - 1) * pageSize;
        const favorites = db.prepare(`
      SELECT f.competition_id, c.name as competition_name, c.category, c.reg_start_month, c.reg_end_month, f.created_at as favorited_at
      FROM favorites f
      JOIN competitions c ON f.competition_id = c.id
      WHERE f.user_id = @userId
      ORDER BY f.created_at DESC
      LIMIT @pageSize OFFSET @offset
    `).all({ userId, pageSize, offset });
        // 获取每个收藏的标签
        for (const fav of favorites) {
            const tags = db.prepare('SELECT tag FROM favorite_tags WHERE user_id = @userId AND competition_id = @compId')
                .all({ userId, compId: fav.competition_id });
            fav.tags = tags.map(t => t.tag);
        }
        return favorites;
    }
    isFavorited(userId, competitionId) {
        const db = getDb();
        const row = db.prepare('SELECT id FROM favorites WHERE user_id = @userId AND competition_id = @competitionId')
            .get({ userId, competitionId });
        return !!row;
    }
    generateReminders() {
        const db = getDb();
        const currentMonth = new Date().getMonth() + 1;
        const favs = db.prepare(`
      SELECT f.user_id, f.competition_id, c.name as competition_name
      FROM favorites f
      JOIN competitions c ON f.competition_id = c.id
      WHERE c.reg_start_month = @month
    `).all({ month: currentMonth });
        let count = 0;
        for (const fav of favs) {
            const existing = db.prepare(`
        SELECT id FROM notifications
        WHERE user_id = @userId AND type = 'competition_reminder' AND related_id = @competitionId
      `).get({ userId: fav.user_id, competitionId: fav.competition_id });
            if (!existing) {
                db.prepare(`
          INSERT INTO notifications (user_id, type, title, content, related_id)
          VALUES (@userId, 'competition_reminder', @title, @content, @competitionId)
        `).run({
                    userId: fav.user_id,
                    title: '竞赛报名提醒',
                    content: `您收藏的竞赛「${fav.competition_name}」本月开始报名`,
                    competitionId: fav.competition_id,
                });
                count++;
            }
        }
        return count;
    }
    // 标签管理
    addTag(userId, competitionId, tag) {
        const db = getDb();
        const fav = db.prepare('SELECT id FROM favorites WHERE user_id = @userId AND competition_id = @competitionId')
            .get({ userId, competitionId });
        if (!fav)
            throw new Error('NOT_FAVORITED');
        try {
            db.prepare('INSERT INTO favorite_tags (user_id, competition_id, tag) VALUES (@userId, @competitionId, @tag)')
                .run({ userId, competitionId, tag: tag.trim() });
        }
        catch (err) {
            if (err.message && err.message.includes('UNIQUE constraint failed')) {
                throw new Error('TAG_EXISTS');
            }
            throw err;
        }
    }
    removeTag(userId, competitionId, tag) {
        const db = getDb();
        const result = db.prepare('DELETE FROM favorite_tags WHERE user_id = @userId AND competition_id = @competitionId AND tag = @tag')
            .run({ userId, competitionId, tag });
        if (result.changes === 0)
            throw new Error('TAG_NOT_FOUND');
    }
    getTags(userId, competitionId) {
        const db = getDb();
        const tags = db.prepare('SELECT tag FROM favorite_tags WHERE user_id = @userId AND competition_id = @competitionId')
            .all({ userId, competitionId });
        return tags.map(t => t.tag);
    }
    getAllUserTags(userId) {
        const db = getDb();
        const tags = db.prepare('SELECT DISTINCT tag FROM favorite_tags WHERE user_id = @userId ORDER BY tag')
            .all({ userId });
        return tags.map(t => t.tag);
    }
    getFavoritesByTag(userId, tag) {
        const db = getDb();
        return db.prepare(`
      SELECT f.competition_id, c.name as competition_name, c.category, c.reg_start_month, c.reg_end_month, f.created_at as favorited_at
      FROM favorites f
      JOIN competitions c ON f.competition_id = c.id
      JOIN favorite_tags ft ON ft.user_id = f.user_id AND ft.competition_id = f.competition_id
      WHERE f.user_id = @userId AND ft.tag = @tag
      ORDER BY f.created_at DESC
    `).all({ userId, tag });
    }
}
export const favoriteService: FavoriteService = new FavoriteService();