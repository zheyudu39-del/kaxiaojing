/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/favorites.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { favoriteService } from '../services/favoriteService';

const router = Router();
// POST /api/favorites — 收藏竞赛
router.post('/', authMiddleware, (req, res) => {
    const { competition_id } = req.body;
    if (!competition_id) {
        res.status(400).json({ error: '缺少竞赛ID' });
        return;
    }
    try {
        favoriteService.addFavorite(req.user.userId, competition_id);
        res.status(201).json({ message: '收藏成功' });
    }
    catch (err) {
        if (err.message === 'NOT_FOUND') {
            res.status(404).json({ error: '竞赛不存在' });
            return;
        }
        if (err.message === 'DUPLICATE') {
            res.status(409).json({ error: '该竞赛已在收藏列表中' });
            return;
        }
        throw err;
    }
});
// DELETE /api/favorites/:competitionId — 取消收藏
router.delete('/:competitionId', authMiddleware, (req, res) => {
    const competitionId = parseInt(req.params.competitionId);
    if (isNaN(competitionId)) {
        res.status(400).json({ error: '无效的竞赛ID' });
        return;
    }
    try {
        favoriteService.removeFavorite(req.user.userId, competitionId);
        res.json({ message: '取消收藏成功' });
    }
    catch (err) {
        if (err.message === 'NOT_FOUND') {
            res.status(404).json({ error: '未收藏该竞赛' });
            return;
        }
        throw err;
    }
});
// GET /api/favorites — 获取收藏列表
router.get('/', authMiddleware, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const favorites = favoriteService.getFavorites(req.user.userId, page, pageSize);
    res.json({ favorites });
});
// GET /api/favorites/check/:competitionId — 检查是否已收藏
router.get('/check/:competitionId', authMiddleware, (req, res) => {
    const competitionId = parseInt(req.params.competitionId);
    if (isNaN(competitionId)) {
        res.status(400).json({ error: '无效的竞赛ID' });
        return;
    }
    const is_favorited = favoriteService.isFavorited(req.user.userId, competitionId);
    res.json({ is_favorited });
});
// GET /api/favorites/tags — 获取用户所有标签
router.get('/tags', authMiddleware, (req, res) => {
    const tags = favoriteService.getAllUserTags(req.user.userId);
    res.json({ tags });
});
// GET /api/favorites/by-tag/:tag — 按标签筛选收藏
router.get('/by-tag/:tag', authMiddleware, (req, res) => {
    const tag = req.params.tag;
    const favorites = favoriteService.getFavoritesByTag(req.user.userId, tag);
    res.json({ favorites });
});
// POST /api/favorites/:competitionId/tags — 添加标签
router.post('/:competitionId/tags', authMiddleware, (req, res) => {
    const competitionId = parseInt(req.params.competitionId);
    const { tag } = req.body;
    if (isNaN(competitionId)) {
        res.status(400).json({ error: '无效的竞赛ID' });
        return;
    }
    if (!tag || !tag.trim()) {
        res.status(400).json({ error: '标签不能为空' });
        return;
    }
    try {
        favoriteService.addTag(req.user.userId, competitionId, tag);
        res.status(201).json({ message: '标签添加成功' });
    }
    catch (err) {
        if (err.message === 'NOT_FAVORITED') {
            res.status(400).json({ error: '请先收藏该竞赛' });
            return;
        }
        if (err.message === 'TAG_EXISTS') {
            res.status(409).json({ error: '该标签已存在' });
            return;
        }
        throw err;
    }
});
// DELETE /api/favorites/:competitionId/tags/:tag — 删除标签
router.delete('/:competitionId/tags/:tag', authMiddleware, (req, res) => {
    const competitionId = parseInt(req.params.competitionId);
    const tag = req.params.tag;
    if (isNaN(competitionId)) {
        res.status(400).json({ error: '无效的竞赛ID' });
        return;
    }
    try {
        favoriteService.removeTag(req.user.userId, competitionId, tag);
        res.json({ message: '标签删除成功' });
    }
    catch (err) {
        if (err.message === 'TAG_NOT_FOUND') {
            res.status(404).json({ error: '标签不存在' });
            return;
        }
        throw err;
    }
});
// GET /api/favorites/:competitionId/tags — 获取某收藏的标签
router.get('/:competitionId/tags', authMiddleware, (req, res) => {
    const competitionId = parseInt(req.params.competitionId);
    if (isNaN(competitionId)) {
        res.status(400).json({ error: '无效的竞赛ID' });
        return;
    }
    const tags = favoriteService.getTags(req.user.userId, competitionId);
    res.json({ tags });
});
export default router;
