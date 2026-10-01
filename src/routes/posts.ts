/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/posts.ts

import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { postService } from '../services/postService';
import { validate } from '../middleware/validate';
import { AppError } from '../middleware/errorHandler';
import { authService } from '../services/authService';
import { proofUpload } from '../middleware/upload';

const router = Router();
// --- Zod Schemas ---
const createPostSchema = z.object({
    title: z.string({ error: '帖子标题不能为空' }).min(1, '帖子标题不能为空'),
    content: z.string({ error: '帖子内容不能为空' }).min(1, '帖子内容不能为空'),
    competition_id: z.number().optional(),
});
const listPostsQuerySchema = z.object({
    competition_id: z.string().optional().transform(v => v ? Number(v) : undefined),
    keyword: z.string().optional(),
    page: z.string().optional().transform(v => v ? Number(v) : 1),
    pageSize: z.string().optional().transform(v => v ? Number(v) : 20),
});
const postIdParamsSchema = z.object({
    id: z.string().regex(/^\d+$/, '无效的帖子ID').transform(Number),
});
const addCommentSchema = z.object({
    content: z.string({ error: '评论内容不能为空' }).min(1, '评论内容不能为空'),
    parent_id: z.number().optional(),
});
const editPostSchema = z.object({
    title: z.string().optional(),
    content: z.string().optional(),
});
const commentParamsSchema = z.object({
    id: z.string().regex(/^\d+$/, '无效的帖子ID').transform(Number),
    commentId: z.string().regex(/^\d+$/, '无效的评论ID').transform(Number),
});
/**
 * Map postService error messages to AppError instances.
 */
function mapPostError(err) {
    if (err instanceof Error) {
        switch (err.message) {
            case 'TITLE_EMPTY':
                throw new AppError(400, 'VALIDATION_ERROR', '帖子标题不能为空');
            case 'CONTENT_EMPTY':
                throw new AppError(400, 'VALIDATION_ERROR', '帖子内容不能为空');
            case 'COMMENT_EMPTY':
                throw new AppError(400, 'VALIDATION_ERROR', '评论内容不能为空');
            case 'NOT_FOUND':
                throw new AppError(404, 'NOT_FOUND', '帖子不存在');
            case 'FORBIDDEN':
                throw new AppError(403, 'FORBIDDEN', '无权执行此操作');
            case 'DUPLICATE':
                throw new AppError(409, 'CONFLICT', '重复操作');
        }
    }
    throw err;
}
// GET /api/posts/users/search — 搜索用户（用于@提及）
router.get('/users/search', (req, res) => {
    const keyword = req.query.keyword;
    if (!keyword || keyword.length < 1) {
        res.json({ users: [] });
        return;
    }
    const { getDb } = require('../db/database');
    const db = getDb();
    const users = db.prepare('SELECT id, username, avatar_url FROM users WHERE username LIKE @kw LIMIT 10').all({ kw: `%${keyword}%` });
    res.json({ users });
});
// GET /api/posts/bookmarks — 获取用户收藏的帖子
router.get('/bookmarks', authMiddleware, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const result = postService.getUserBookmarks(req.user.userId, page, pageSize);
    res.json(result);
});
// POST /api/posts/upload-image — 帖子图片上传
router.post('/upload-image', authMiddleware, proofUpload.single('image'), (req, res) => {
    if (!req.file) {
        res.status(400).json({ error: '请上传图片' });
        return;
    }
    const url = `/uploads/proofs/${req.file.filename}`;
    res.json({ url });
});
// POST /api/posts — 创建帖子
router.post('/', authMiddleware, validate({ body: createPostSchema }), (req, res, next) => {
    try {
        const post = postService.createPost(req.user.userId, req.body);
        res.status(201).json(post);
    }
    catch (err) {
        mapPostError(err);
    }
});
// GET /api/posts — 帖子列表
router.get('/', validate({ query: listPostsQuerySchema }), (req, res) => {
    // Optional auth: try to extract userId from token if present, but don't require it
    let userId;
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const parts = authHeader.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            try {
                const payload = authService.verifyToken(parts[1]);
                userId = payload.userId;
            }
            catch {
                // Token invalid or expired — ignore, treat as anonymous
            }
        }
    }
    const { competition_id, keyword, page, pageSize } = req.query;
    const result = postService.listPosts({
        competition_id,
        keyword,
        page: page ?? 1,
        pageSize: pageSize ?? 20,
        userId,
    });
    res.json(result);
});
// GET /api/posts/:id — 帖子详情
router.get('/:id', validate({ params: postIdParamsSchema }), (req, res) => {
    const post = postService.getPostDetail(req.params.id);
    if (!post) {
        throw new AppError(404, 'NOT_FOUND', '帖子不存在');
    }
    res.json(post);
});
// PUT /api/posts/:id — 编辑帖子
router.put('/:id', authMiddleware, validate({ params: postIdParamsSchema, body: editPostSchema }), (req, res, next) => {
    try {
        const post = postService.editPost(req.params.id, req.user.userId, req.body);
        res.json(post);
    }
    catch (err) {
        mapPostError(err);
    }
});
// POST /api/posts/:id/bookmark — 收藏/取消收藏帖子
router.post('/:id/bookmark', authMiddleware, validate({ params: postIdParamsSchema }), (req, res, next) => {
    try {
        const result = postService.toggleBookmark(req.params.id, req.user.userId);
        res.json(result);
    }
    catch (err) {
        mapPostError(err);
    }
});
// POST /api/posts/:id/comments — 添加评论
router.post('/:id/comments', authMiddleware, validate({ params: postIdParamsSchema, body: addCommentSchema }), (req, res, next) => {
    try {
        const comment = postService.addComment(req.params.id, req.user.userId, req.body.content, req.body.parent_id);
        res.status(201).json(comment);
    }
    catch (err) {
        mapPostError(err);
    }
});
// POST /api/posts/:id/like — 点赞/取消点赞
router.post('/:id/like', authMiddleware, validate({ params: postIdParamsSchema }), (req, res, next) => {
    try {
        const result = postService.toggleLike(req.params.id, req.user.userId);
        res.json(result);
    }
    catch (err) {
        mapPostError(err);
    }
});
// DELETE /api/posts/:id — 删除帖子
router.delete('/:id', authMiddleware, validate({ params: postIdParamsSchema }), (req, res, next) => {
    try {
        const deleted = postService.deletePost(req.params.id, req.user.userId);
        if (!deleted) {
            throw new AppError(404, 'NOT_FOUND', '帖子不存在');
        }
        res.json({ message: '删除成功' });
    }
    catch (err) {
        if (err instanceof AppError)
            throw err;
        mapPostError(err);
    }
});
// PUT /api/posts/:id/comments/:commentId — 编辑评论
router.put('/:id/comments/:commentId', authMiddleware, validate({ params: commentParamsSchema, body: addCommentSchema }), (req, res, next) => {
    try {
        const comment = postService.editComment(req.params.commentId, req.user.userId, req.body.content);
        res.json(comment);
    }
    catch (err) {
        if (err instanceof AppError)
            throw err;
        mapPostError(err);
    }
});
// DELETE /api/posts/:id/comments/:commentId — 删除评论
router.delete('/:id/comments/:commentId', authMiddleware, validate({ params: commentParamsSchema }), (req, res, next) => {
    try {
        postService.deleteComment(req.params.commentId, req.user.userId);
        res.json({ message: '删除成功' });
    }
    catch (err) {
        if (err instanceof AppError)
            throw err;
        mapPostError(err);
    }
});
export default router;
