/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/postService.ts

import { getDb } from '../db/database';
import { mentionService } from './mentionService';
import { notificationService } from './notificationService';
import { activityService, ActivityTypes } from './activityService';

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}
class PostService {
    createPost(userId, data) {
        if (!data.title?.trim())
            throw new Error('TITLE_EMPTY');
        if (!data.content?.trim())
            throw new Error('CONTENT_EMPTY');
        const db = getDb();
        const safeTitle = escapeHtml(data.title);
        const safeContent = escapeHtml(data.content);
        const result = db.prepare('INSERT INTO posts (user_id, title, content, competition_id, review_status) VALUES (@userId, @title, @content, @competitionId, @reviewStatus)').run({ userId, title: safeTitle, content: safeContent, competitionId: data.competition_id || null, reviewStatus: 'approved' });
        const postId = result.lastInsertRowid;
        mentionService.resolveAndNotify(data.content, userId, 'post', postId);
        // 记录用户动态
        activityService.record(userId, ActivityTypes.POST_CREATE, 'post', postId, data.title);
        return this.getPostDetail(postId);
    }
    listPosts(filters) {
        const db = getDb();
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 20;
        const offset = (page - 1) * pageSize;
        let where = "WHERE p.review_status = 'approved' AND p.deleted_at IS NULL";
        const params = { limit: pageSize, offset };
        if (filters.competition_id) {
            where += ' AND p.competition_id = @competitionId';
            params.competitionId = filters.competition_id;
        }
        if (filters.keyword) {
            where += ' AND (p.title LIKE @keyword OR p.content LIKE @keyword)';
            params.keyword = `%${filters.keyword}%`;
        }
        if (filters.userId) {
            params.currentUserId = filters.userId;
        }
        const isLikedSelect = filters.userId
            ? ', (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id AND user_id = @currentUserId) as is_liked'
            : '';
        const total = db.prepare(`SELECT COUNT(*) as count FROM posts p ${where}`).get(params);
        const posts = db.prepare(`
      SELECT p.id, p.title, p.user_id as author_id, u.username as author_username,
        p.competition_id, c.name as competition_name,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as like_count
        ${isLikedSelect},
        p.created_at
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN competitions c ON p.competition_id = c.id
      ${where}
      ORDER BY p.created_at DESC
      LIMIT @limit OFFSET @offset
    `).all(params);
        // Convert is_liked from count (0/1) to boolean when userId is provided
        if (filters.userId) {
            for (const post of posts) {
                post.is_liked = post.is_liked > 0;
            }
        }
        return { posts, total: total.count };
    }
    getPostDetail(postId) {
        const db = getDb();
        const post = db.prepare(`
      SELECT p.id, p.title, p.content, p.user_id as author_id, u.username as author_username,
        p.competition_id, c.name as competition_name, p.created_at
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN competitions c ON p.competition_id = c.id
      WHERE p.id = @postId AND p.deleted_at IS NULL
    `).get({ postId });
        if (!post)
            return null;
        const comments = db.prepare(`
      SELECT cm.id, cm.content, cm.user_id as author_id, u.username as author_username,
        cm.parent_id, cm.reply_to_user_id, ru.username as reply_to_username, cm.created_at
      FROM comments cm
      JOIN users u ON cm.user_id = u.id
      LEFT JOIN users ru ON cm.reply_to_user_id = ru.id
      WHERE cm.post_id = @postId
      ORDER BY cm.created_at ASC
    `).all({ postId });
        return { ...post, comments };
    }
    editPost(postId, userId, data) {
        const db = getDb();
        const post = db.prepare('SELECT id, user_id FROM posts WHERE id = @postId AND deleted_at IS NULL').get({ postId });
        if (!post)
            throw new Error('NOT_FOUND');
        if (post.user_id !== userId)
            throw new Error('FORBIDDEN');
        const updates = [];
        const params = { postId };
        if (data.title !== undefined) {
            if (!data.title.trim())
                throw new Error('TITLE_EMPTY');
            params.title = escapeHtml(data.title);
            updates.push('title = @title');
        }
        if (data.content !== undefined) {
            if (!data.content.trim())
                throw new Error('CONTENT_EMPTY');
            params.content = escapeHtml(data.content);
            updates.push('content = @content');
        }
        if (updates.length > 0) {
            updates.push("updated_at = datetime('now')");
            db.prepare(`UPDATE posts SET ${updates.join(', ')} WHERE id = @postId`).run(params);
        }
        return this.getPostDetail(postId);
    }
    deletePost(postId, userId) {
        const db = getDb();
        const post = db.prepare('SELECT id, user_id FROM posts WHERE id = @postId AND deleted_at IS NULL').get({ postId });
        if (!post)
            return false;
        if (post.user_id !== userId)
            throw new Error('FORBIDDEN');
        db.prepare("UPDATE posts SET deleted_at = datetime('now') WHERE id = @postId").run({ postId });
        return true;
    }
    addComment(postId, userId, content, parentId) {
        if (!content?.trim())
            throw new Error('COMMENT_EMPTY');
        const safeContent = escapeHtml(content);
        const db = getDb();
        const post = db.prepare('SELECT id, user_id FROM posts WHERE id = @postId AND deleted_at IS NULL').get({ postId });
        if (!post)
            throw new Error('NOT_FOUND');
        let replyToUserId = null;
        if (parentId) {
            const parentComment = db.prepare('SELECT id, user_id FROM comments WHERE id = @parentId AND post_id = @postId').get({ parentId, postId });
            if (!parentComment)
                throw new Error('NOT_FOUND');
            replyToUserId = parentComment.user_id;
        }
        // 用事务包裹评论写入，保证原子性；通知/推送放事务外
        let commentId = 0;
        db.runInTransaction(() => {
            const result = db.prepare('INSERT INTO comments (post_id, user_id, content, parent_id, reply_to_user_id) VALUES (@postId, @userId, @content, @parentId, @replyToUserId)').run({ postId, userId, content: safeContent, parentId: parentId || null, replyToUserId });
            commentId = result.lastInsertRowid;
        });
        // 以下通知/推送放在事务外
        mentionService.resolveAndNotify(content, userId, 'comment', commentId);
        if (post.user_id !== userId) {
            notificationService.createNotification(post.user_id, 'comment', '你的帖子收到了新评论', '有人评论了你的帖子', postId);
        }
        // 通知被回复的用户
        if (replyToUserId && replyToUserId !== userId && replyToUserId !== post.user_id) {
            notificationService.createNotification(replyToUserId, 'reply', '你的评论收到了回复', '有人回复了你的评论', postId);
        }
        return db.prepare(`
      SELECT cm.id, cm.content, cm.user_id as author_id, u.username as author_username,
        cm.parent_id, cm.reply_to_user_id, ru.username as reply_to_username, cm.created_at
      FROM comments cm JOIN users u ON cm.user_id = u.id
      LEFT JOIN users ru ON cm.reply_to_user_id = ru.id
      WHERE cm.id = @id
    `).get({ id: commentId });
    }
    editComment(commentId, userId, content) {
        if (!content?.trim())
            throw new Error('COMMENT_EMPTY');
        const db = getDb();
        const comment = db.prepare('SELECT id, user_id, created_at FROM comments WHERE id = @commentId').get({ commentId });
        if (!comment)
            throw new Error('NOT_FOUND');
        if (comment.user_id !== userId)
            throw new Error('FORBIDDEN');
        const safeContent = escapeHtml(content);
        db.prepare('UPDATE comments SET content = @content WHERE id = @commentId').run({ content: safeContent, commentId });
        return db.prepare(`
      SELECT cm.id, cm.content, cm.user_id as author_id, u.username as author_username, cm.created_at
      FROM comments cm JOIN users u ON cm.user_id = u.id WHERE cm.id = @id
    `).get({ id: commentId });
    }
    deleteComment(commentId, userId) {
        const db = getDb();
        const comment = db.prepare('SELECT id, user_id FROM comments WHERE id = @commentId').get({ commentId });
        if (!comment)
            throw new Error('NOT_FOUND');
        if (comment.user_id !== userId)
            throw new Error('FORBIDDEN');
        db.prepare('DELETE FROM comments WHERE id = @commentId').run({ commentId });
        return true;
    }
    toggleLike(postId, userId) {
        const db = getDb();
        const post = db.prepare('SELECT id FROM posts WHERE id = @postId AND deleted_at IS NULL').get({ postId });
        if (!post)
            throw new Error('NOT_FOUND');
        const existing = db.prepare('SELECT id FROM post_likes WHERE post_id = @postId AND user_id = @userId').get({ postId, userId });
        if (existing) {
            db.prepare('DELETE FROM post_likes WHERE post_id = @postId AND user_id = @userId').run({ postId, userId });
        }
        else {
            try {
                db.prepare('INSERT INTO post_likes (post_id, user_id) VALUES (@postId, @userId)').run({ postId, userId });
                // 记录点赞动态
                activityService.record(userId, ActivityTypes.POST_LIKE, 'post', postId);
            }
            catch (err) {
                if (err.message && err.message.includes('UNIQUE constraint failed')) {
                    throw new Error('DUPLICATE');
                }
                throw err;
            }
        }
        const count = db.prepare('SELECT COUNT(*) as c FROM post_likes WHERE post_id = @postId').get({ postId }).c;
        return { liked: !existing, likeCount: count };
    }
    getLikeCount(postId) {
        const db = getDb();
        return db.prepare('SELECT COUNT(*) as c FROM post_likes WHERE post_id = @postId').get({ postId }).c;
    }
    isLiked(postId, userId) {
        const db = getDb();
        return !!db.prepare('SELECT id FROM post_likes WHERE post_id = @postId AND user_id = @userId').get({ postId, userId });
    }
    // 帖子书签功能
    toggleBookmark(postId, userId) {
        const db = getDb();
        const post = db.prepare('SELECT id FROM posts WHERE id = @postId AND deleted_at IS NULL').get({ postId });
        if (!post)
            throw new Error('NOT_FOUND');
        const existing = db.prepare('SELECT id FROM post_bookmarks WHERE post_id = @postId AND user_id = @userId').get({ postId, userId });
        if (existing) {
            db.prepare('DELETE FROM post_bookmarks WHERE post_id = @postId AND user_id = @userId').run({ postId, userId });
            return { bookmarked: false };
        }
        else {
            db.prepare('INSERT INTO post_bookmarks (post_id, user_id) VALUES (@postId, @userId)').run({ postId, userId });
            return { bookmarked: true };
        }
    }
    isBookmarked(postId, userId) {
        const db = getDb();
        return !!db.prepare('SELECT id FROM post_bookmarks WHERE post_id = @postId AND user_id = @userId').get({ postId, userId });
    }
    getUserBookmarks(userId, page = 1, pageSize = 20) {
        const db = getDb();
        const offset = (page - 1) * pageSize;
        const total = db.prepare('SELECT COUNT(*) as count FROM post_bookmarks WHERE user_id = @userId').get({ userId });
        const bookmarks = db.prepare(`
      SELECT pb.id, pb.created_at as bookmarked_at, p.id as post_id, p.title, p.user_id as author_id, 
        u.username as author_username, p.created_at as post_created_at,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as like_count
      FROM post_bookmarks pb
      JOIN posts p ON pb.post_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE pb.user_id = @userId AND p.deleted_at IS NULL
      ORDER BY pb.created_at DESC
      LIMIT @limit OFFSET @offset
    `).all({ userId, limit: pageSize, offset });
        return { bookmarks, total: total.count };
    }
}
export const postService: PostService = new PostService();