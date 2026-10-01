/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/follows.ts

import { Router } from 'express';
import { z } from 'zod';
import { followService } from '../services/followService';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AppError } from '../middleware/errorHandler';

const router = Router();
// --- Zod Schemas ---
const userIdParamsSchema = z.object({
    userId: z.string().regex(/^\d+$/, '无效的用户ID').transform(Number),
});
const paginationQuerySchema = z.object({
    page: z.preprocess((v) => v ?? '1', z.string().regex(/^\d+$/).transform(Number)),
    pageSize: z.preprocess((v) => v ?? '20', z.string().regex(/^\d+$/).transform(Number)),
});
// POST /api/follows/:userId - Follow a user
router.post('/:userId', authMiddleware, validate({ params: userIdParamsSchema }), (req, res, next) => {
    try {
        const followeeId = req.params.userId;
        followService.follow(req.user.userId, followeeId);
        res.status(201).json({ message: '关注成功' });
    }
    catch (err) {
        if (err instanceof AppError)
            throw err;
        throw new AppError(500, 'INTERNAL_ERROR', '关注操作失败');
    }
});
// DELETE /api/follows/:userId - Unfollow a user
router.delete('/:userId', authMiddleware, validate({ params: userIdParamsSchema }), (req, res, next) => {
    try {
        const followeeId = req.params.userId;
        followService.unfollow(req.user.userId, followeeId);
        res.json({ message: '已取消关注' });
    }
    catch (err) {
        if (err instanceof AppError)
            throw err;
        throw new AppError(500, 'INTERNAL_ERROR', '取消关注操作失败');
    }
});
// GET /api/follows/following - Get current user's following list
router.get('/following', authMiddleware, validate({ query: paginationQuerySchema }), (req, res, next) => {
    try {
        const { page, pageSize } = req.query;
        const result = followService.getFollowing(req.user.userId, page, pageSize);
        res.json(result);
    }
    catch (err) {
        if (err instanceof AppError)
            throw err;
        throw new AppError(500, 'INTERNAL_ERROR', '获取关注列表失败');
    }
});
// GET /api/follows/followers - Get current user's followers list
router.get('/followers', authMiddleware, validate({ query: paginationQuerySchema }), (req, res, next) => {
    try {
        const { page, pageSize } = req.query;
        const result = followService.getFollowers(req.user.userId, page, pageSize);
        res.json(result);
    }
    catch (err) {
        if (err instanceof AppError)
            throw err;
        throw new AppError(500, 'INTERNAL_ERROR', '获取粉丝列表失败');
    }
});
// GET /api/follows/:userId/following - Get a specific user's following list (public)
router.get('/:userId/following', validate({ params: userIdParamsSchema, query: paginationQuerySchema }), (req, res, next) => {
    try {
        const userId = req.params.userId;
        const { page, pageSize } = req.query;
        const result = followService.getFollowing(userId, page, pageSize);
        res.json(result);
    }
    catch (err) {
        if (err instanceof AppError)
            throw err;
        throw new AppError(500, 'INTERNAL_ERROR', '获取关注列表失败');
    }
});
// GET /api/follows/:userId/followers - Get a specific user's followers list (public)
router.get('/:userId/followers', validate({ params: userIdParamsSchema, query: paginationQuerySchema }), (req, res, next) => {
    try {
        const userId = req.params.userId;
        const { page, pageSize } = req.query;
        const result = followService.getFollowers(userId, page, pageSize);
        res.json(result);
    }
    catch (err) {
        if (err instanceof AppError)
            throw err;
        throw new AppError(500, 'INTERNAL_ERROR', '获取粉丝列表失败');
    }
});
// GET /api/follows/check/:userId - Check if current user follows a specific user (alias for status)
router.get('/check/:userId', authMiddleware, validate({ params: userIdParamsSchema }), (req, res, next) => {
    try {
        const followeeId = req.params.userId;
        const is_following = followService.isFollowing(req.user.userId, followeeId);
        res.json({ is_following });
    }
    catch (err) {
        if (err instanceof AppError)
            throw err;
        throw new AppError(500, 'INTERNAL_ERROR', '获取关注状态失败');
    }
});
// GET /api/follows/:userId/counts - Get follow counts for a user (public)
router.get('/:userId/counts', validate({ params: userIdParamsSchema }), (req, res, next) => {
    try {
        const userId = req.params.userId;
        const counts = followService.getFollowCounts(userId);
        res.json(counts);
    }
    catch (err) {
        if (err instanceof AppError)
            throw err;
        throw new AppError(500, 'INTERNAL_ERROR', '获取关注统计失败');
    }
});
// GET /api/follows/:userId/status - Check if current user follows a specific user
router.get('/:userId/status', authMiddleware, validate({ params: userIdParamsSchema }), (req, res, next) => {
    try {
        const followeeId = req.params.userId;
        const isFollowing = followService.isFollowing(req.user.userId, followeeId);
        res.json({ isFollowing });
    }
    catch (err) {
        if (err instanceof AppError)
            throw err;
        throw new AppError(500, 'INTERNAL_ERROR', '获取关注状态失败');
    }
});
export default router;
