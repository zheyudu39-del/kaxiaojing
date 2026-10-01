/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/followService.ts

import { getDb } from '../db/database';
import { AppError } from '../middleware/errorHandler';
import { notificationService } from './notificationService';

// ===== 类型定义（自 .d.ts 还原）=====
export interface FollowUser {
    id: number;
    username: string;
    avatar_url: string | null;
    bio: string | null;
}

export class FollowService {
    follow(followerId: number, followeeId: number): void {
        if (followerId === followeeId) {
            throw new AppError(400, 'VALIDATION_ERROR', '不能关注自己');
        }
        const db = getDb();
        // Check if already following
        const existing = db.prepare('SELECT id FROM follows WHERE follower_id = @followerId AND followee_id = @followeeId').get({ followerId, followeeId });
        if (existing) {
            throw new AppError(409, 'CONFLICT', '已经关注了该用户');
        }
        db.prepare('INSERT INTO follows (follower_id, followee_id) VALUES (@followerId, @followeeId)').run({ followerId, followeeId });
        // Send notification to the followee
        const follower = db.prepare('SELECT username FROM users WHERE id = @id').get({ id: followerId });
        notificationService.createNotification(followeeId, 'new_follower', '新的关注者', `用户 ${follower?.username || followerId} 关注了你`, followerId);
    }
    unfollow(followerId: number, followeeId: number): void {
        const db = getDb();
        const result = db.prepare('DELETE FROM follows WHERE follower_id = @followerId AND followee_id = @followeeId').run({ followerId, followeeId });
        if (result.changes === 0) {
            throw new AppError(404, 'NOT_FOUND', '未关注该用户');
        }
    }
    getFollowing(userId: number, page: number, pageSize: number): { users: FollowUser[]; total: number; } {
        const db = getDb();
        const offset = (page - 1) * pageSize;
        const totalResult = db.prepare('SELECT COUNT(*) as count FROM follows WHERE follower_id = @userId').get({ userId });
        const users = db.prepare(`
      SELECT u.id, u.username, u.avatar_url, u.bio
      FROM follows f
      INNER JOIN users u ON f.followee_id = u.id
      WHERE f.follower_id = @userId
      ORDER BY f.created_at DESC
      LIMIT @limit OFFSET @offset
    `).all({ userId, limit: pageSize, offset });
        return { users, total: totalResult.count };
    }
    getFollowers(userId: number, page: number, pageSize: number): { users: FollowUser[]; total: number; } {
        const db = getDb();
        const offset = (page - 1) * pageSize;
        const totalResult = db.prepare('SELECT COUNT(*) as count FROM follows WHERE followee_id = @userId').get({ userId });
        const users = db.prepare(`
      SELECT u.id, u.username, u.avatar_url, u.bio
      FROM follows f
      INNER JOIN users u ON f.follower_id = u.id
      WHERE f.followee_id = @userId
      ORDER BY f.created_at DESC
      LIMIT @limit OFFSET @offset
    `).all({ userId, limit: pageSize, offset });
        return { users, total: totalResult.count };
    }
    isFollowing(followerId: number, followeeId: number): boolean {
        const db = getDb();
        const result = db.prepare('SELECT id FROM follows WHERE follower_id = @followerId AND followee_id = @followeeId').get({ followerId, followeeId });
        return !!result;
    }
    getFollowCounts(userId: number): { following: number; followers: number; } {
        const db = getDb();
        const following = db.prepare('SELECT COUNT(*) as count FROM follows WHERE follower_id = @userId').get({ userId });
        const followers = db.prepare('SELECT COUNT(*) as count FROM follows WHERE followee_id = @userId').get({ userId });
        return { following: following.count, followers: followers.count };
    }
}
export const followService: FollowService = new FollowService();