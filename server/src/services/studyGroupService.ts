/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/studyGroupService.ts

import { getDb } from '../db/database';

// 2. 学习小组/兴趣圈服务
export const studyGroupService = {
    // 创建学习小组
    create(data) {
        const db = getDb();
        // 用事务包裹 study_groups + study_group_members 两表写入，保证原子性
        let groupId = 0;
        db.runInTransaction(() => {
            const result = db.prepare(`
        INSERT INTO study_groups (name, description, category, creator_id)
        VALUES (@name, @description, @category, @creatorId)
      `).run({ name: data.name, description: data.description, category: data.category, creatorId: data.creatorId });
            groupId = result.lastInsertRowid;
            // 创建者自动加入
            db.prepare(`
        INSERT INTO study_group_members (group_id, user_id, role)
        VALUES (@groupId, @userId, 'admin')
      `).run({ groupId, userId: data.creatorId });
        });
        return groupId;
    },
    // 获取小组列表
    list(category, page = 1, limit = 20) {
        const db = getDb();
        const offset = (page - 1) * limit;
        let sql = `
      SELECT sg.*, u.username as creator_name,
        (SELECT COUNT(*) FROM study_group_members WHERE group_id = sg.id) as member_count
      FROM study_groups sg
      JOIN users u ON sg.creator_id = u.id
      WHERE sg.deleted_at IS NULL
    `;
        const params = { limit, offset };
        if (category) {
            sql += ' AND sg.category = @category';
            params.category = category;
        }
        sql += ' ORDER BY member_count DESC, sg.created_at DESC LIMIT @limit OFFSET @offset';
        return db.prepare(sql).all(params);
    },
    // 获取小组详情
    getById(groupId) {
        const db = getDb();
        return db.prepare(`
      SELECT sg.*, u.username as creator_name,
        (SELECT COUNT(*) FROM study_group_members WHERE group_id = sg.id) as member_count
      FROM study_groups sg
      JOIN users u ON sg.creator_id = u.id
      WHERE sg.id = @groupId AND sg.deleted_at IS NULL
    `).get({ groupId });
    },
    // 加入小组
    join(groupId, userId) {
        const db = getDb();
        return db.prepare(`
      INSERT OR IGNORE INTO study_group_members (group_id, user_id, role)
      VALUES (@groupId, @userId, 'member')
    `).run({ groupId, userId });
    },
    // 退出小组
    leave(groupId, userId) {
        const db = getDb();
        return db.prepare(`
      DELETE FROM study_group_members WHERE group_id = @groupId AND user_id = @userId AND role != 'admin'
    `).run({ groupId, userId });
    },
    // 获取小组成员
    getMembers(groupId) {
        const db = getDb();
        return db.prepare(`
      SELECT sgm.*, u.username, u.avatar_url, u.college, u.major
      FROM study_group_members sgm
      JOIN users u ON sgm.user_id = u.id
      WHERE sgm.group_id = @groupId
      ORDER BY sgm.role DESC, sgm.joined_at ASC
    `).all({ groupId });
    },
    // 检查是否是成员
    isMember(groupId, userId) {
        const db = getDb();
        const row = db.prepare(`
      SELECT id FROM study_group_members WHERE group_id = @groupId AND user_id = @userId
    `).get({ groupId, userId });
        return !!row;
    },
    // 获取用户加入的小组
    getUserGroups(userId) {
        const db = getDb();
        return db.prepare(`
      SELECT sg.*, sgm.role, sgm.joined_at,
        (SELECT COUNT(*) FROM study_group_members WHERE group_id = sg.id) as member_count
      FROM study_group_members sgm
      JOIN study_groups sg ON sgm.group_id = sg.id
      WHERE sgm.user_id = @userId AND sg.deleted_at IS NULL
      ORDER BY sgm.joined_at DESC
    `).all({ userId });
    },
    // 发送小组消息
    sendMessage(groupId, userId, content) {
        const db = getDb();
        return db.prepare(`
      INSERT INTO study_group_messages (group_id, user_id, content)
      VALUES (@groupId, @userId, @content)
    `).run({ groupId, userId, content });
    },
    // 获取小组消息
    getMessages(groupId, limit = 50, beforeId) {
        const db = getDb();
        let sql = `
      SELECT sgm.*, u.username, u.avatar_url
      FROM study_group_messages sgm
      JOIN users u ON sgm.user_id = u.id
      WHERE sgm.group_id = @groupId
    `;
        const params = { groupId, limit };
        if (beforeId) {
            sql += ' AND sgm.id < @beforeId';
            params.beforeId = beforeId;
        }
        sql += ' ORDER BY sgm.created_at DESC LIMIT @limit';
        return db.prepare(sql).all(params);
    }
};