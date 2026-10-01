/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/activityService.ts

import { getDb } from '../db/database';

// ===== 类型定义（自 .d.ts 还原）=====
export interface UserActivity {
    id: number;
    user_id: number;
    activity_type: string;
    target_type: string | null;
    target_id: number | null;
    content: string;
    created_at: string;
}

// 活动类型
export const ActivityTypes = {
    POST_CREATE: 'post_create',
    POST_LIKE: 'post_like',
    POST_COMMENT: 'post_comment',
    TEAM_JOIN: 'team_join',
    TEAM_CREATE: 'team_create',
    COMPETITION_REGISTER: 'competition_register',
    COMPETITION_FAVORITE: 'competition_favorite',
    AWARD_ADD: 'award_add',
    CERT_PLAN_CREATE: 'cert_plan_create',
    CERT_CHECKIN: 'cert_checkin',
    FOLLOW_USER: 'follow_user',
    RESOURCE_UPLOAD: 'resource_upload'
};
class ActivityService {
    record(userId, activityType, targetType, targetId, content) {
        const db = getDb();
        db.prepare(`
      INSERT INTO user_activities (user_id, activity_type, target_type, target_id, content)
      VALUES (@userId, @activityType, @targetType, @targetId, @content)
    `).run({
            userId,
            activityType,
            targetType: targetType || null,
            targetId: targetId || null,
            content: content || ''
        });
    }
    getUserActivities(userId, page = 1, pageSize = 20) {
        const db = getDb();
        const offset = (page - 1) * pageSize;
        const total = db.prepare('SELECT COUNT(*) as count FROM user_activities WHERE user_id = @userId').get({ userId });
        const activities = db.prepare(`
      SELECT a.*, u.username, u.avatar_url
      FROM user_activities a
      JOIN users u ON a.user_id = u.id
      WHERE a.user_id = @userId
      ORDER BY a.created_at DESC
      LIMIT @limit OFFSET @offset
    `).all({ userId, limit: pageSize, offset });
        return { activities, total: total.count };
    }
    // 获取关注用户的动态
    getFollowingActivities(userId, page = 1, pageSize = 20) {
        const db = getDb();
        const offset = (page - 1) * pageSize;
        const total = db.prepare(`
      SELECT COUNT(*) as count FROM user_activities a
      WHERE a.user_id IN (SELECT followee_id FROM follows WHERE follower_id = @userId)
    `).get({ userId });
        const activities = db.prepare(`
      SELECT a.*, u.username, u.avatar_url
      FROM user_activities a
      JOIN users u ON a.user_id = u.id
      WHERE a.user_id IN (SELECT followee_id FROM follows WHERE follower_id = @userId)
      ORDER BY a.created_at DESC
      LIMIT @limit OFFSET @offset
    `).all({ userId, limit: pageSize, offset });
        return { activities, total: total.count };
    }
    // 获取活动详情（带关联数据）
    getActivityWithDetails(activityId) {
        const db = getDb();
        const activity = db.prepare(`
      SELECT a.*, u.username, u.avatar_url
      FROM user_activities a
      JOIN users u ON a.user_id = u.id
      WHERE a.id = @activityId
    `).get({ activityId });
        if (!activity)
            return null;
        // 根据类型获取关联数据
        if (activity.target_type === 'post' && activity.target_id) {
            activity.target = db.prepare('SELECT id, title FROM posts WHERE id = @id AND deleted_at IS NULL').get({ id: activity.target_id });
        }
        else if (activity.target_type === 'competition' && activity.target_id) {
            activity.target = db.prepare('SELECT id, name FROM competitions WHERE id = @id').get({ id: activity.target_id });
        }
        else if (activity.target_type === 'team' && activity.target_id) {
            activity.target = db.prepare('SELECT id, name FROM teams WHERE id = @id').get({ id: activity.target_id });
        }
        else if (activity.target_type === 'user' && activity.target_id) {
            activity.target = db.prepare('SELECT id, username, avatar_url FROM users WHERE id = @id').get({ id: activity.target_id });
        }
        else if (activity.target_type === 'certificate' && activity.target_id) {
            activity.target = db.prepare('SELECT id, name FROM certificates WHERE id = @id').get({ id: activity.target_id });
        }
        return activity;
    }
    // 删除用户活动（用于撤销操作时）
    deleteActivity(userId, activityType, targetType, targetId) {
        const db = getDb();
        let where = 'user_id = @userId AND activity_type = @activityType';
        const params = { userId, activityType };
        if (targetType) {
            where += ' AND target_type = @targetType';
            params.targetType = targetType;
        }
        if (targetId) {
            where += ' AND target_id = @targetId';
            params.targetId = targetId;
        }
        db.prepare(`DELETE FROM user_activities WHERE ${where}`).run(params);
    }
}
export const activityService: ActivityService = new ActivityService();