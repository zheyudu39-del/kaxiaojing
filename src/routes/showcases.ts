/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/showcases.ts

import { Router } from 'express';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';
import { showcaseService } from '../services/showcaseService';

const router = Router();
// 获取作品列表
router.get('/', (req, res) => {
    const { competition_id, award_level, year, page = '1', limit = '20' } = req.query;
    const showcases = showcaseService.list({
        competitionId: competition_id ? parseInt(competition_id) : undefined,
        awardLevel: award_level,
        year: year ? parseInt(year) : undefined
    }, parseInt(page), parseInt(limit));
    res.json({ showcases });
});
// 获取我的作品 - 必须在 /:showcaseId 之前
router.get('/user/my', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const showcases = showcaseService.getUserShowcases(userId);
    res.json({ showcases });
});
// 提交作品
router.post('/', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const { competition_id, title, description, award_level, award_year, team_members, project_url, image_urls } = req.body;
    if (!competition_id || !title || !award_level || !award_year) {
        res.status(400).json({ error: '缺少必要参数' });
        return;
    }
    const result = showcaseService.submit(userId, {
        competitionId: competition_id,
        title,
        description: description || '',
        awardLevel: award_level,
        awardYear: award_year,
        teamMembers: team_members,
        projectUrl: project_url,
        imageUrls: image_urls
    });
    res.json({ success: true, showcase_id: result.lastInsertRowid });
});
// 获取作品详情
router.get('/:showcaseId', optionalAuthMiddleware, (req, res) => {
    const showcaseId = parseInt(req.params.showcaseId);
    const userId = req.user?.id;
    const showcase = showcaseService.getById(showcaseId);
    if (!showcase) {
        res.status(404).json({ error: '作品不存在' });
        return;
    }
    const isLiked = userId ? showcaseService.isLiked(showcaseId, userId) : false;
    res.json({ ...showcase, is_liked: isLiked });
});
// 点赞作品
router.post('/:showcaseId/like', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const showcaseId = parseInt(req.params.showcaseId);
    showcaseService.like(showcaseId, userId);
    res.json({ success: true });
});
// 取消点赞
router.delete('/:showcaseId/like', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const showcaseId = parseInt(req.params.showcaseId);
    showcaseService.unlike(showcaseId, userId);
    res.json({ success: true });
});
export default router;
