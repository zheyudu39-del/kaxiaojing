/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/resources.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { resourceUpload } from '../middleware/upload';
import { resourceService } from '../services/resourceService';
import multer from 'multer';

const router = Router();
// POST /api/resources — 上传资料
router.post('/', authMiddleware, (req, res, next) => {
    resourceUpload.single('file')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                res.status(400).json({ error: '文件大小不能超过 10MB' });
                return;
            }
            res.status(400).json({ error: err.message });
            return;
        }
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (!req.file) {
            res.status(400).json({ error: '请选择要上传的文件' });
            return;
        }
        try {
            const resource = resourceService.uploadResource(req.user.userId, {
                title: req.body.title,
                description: req.body.description,
                competition_id: parseInt(req.body.competition_id),
            }, req.file);
            res.status(201).json(resource);
        }
        catch (err) {
            if (err.message === 'TITLE_EMPTY') {
                res.status(400).json({ error: '标题不能为空' });
                return;
            }
            return next(err);
        }
    });
});
// GET /api/resources — 资料列表
router.get('/', (req, res) => {
    const { competition_id, keyword, page, pageSize } = req.query;
    res.json(resourceService.listResources({
        competition_id: competition_id ? Number(competition_id) : undefined,
        keyword: keyword,
        page: page ? Number(page) : 1,
        pageSize: pageSize ? Number(pageSize) : 20,
    }));
});
// GET /api/resources/:id/download — 下载资料
router.get('/:id/download', (req, res) => {
    const result = resourceService.downloadResource(parseInt(req.params.id));
    if (!result) {
        res.status(404).json({ error: '资料不存在' });
        return;
    }
    if (result.isExternal && result.externalUrl) {
        res.json({ redirect: result.externalUrl });
        return;
    }
    res.download(result.filePath, result.fileName);
});
// POST /api/resources/:id/rate — 评分
router.post('/:id/rate', authMiddleware, (req, res) => {
    try {
        const result = resourceService.rateResource(parseInt(req.params.id), req.user.userId, req.body.rating);
        res.json(result);
    }
    catch (err) {
        if (err.message === 'INVALID_RATING') {
            res.status(400).json({ error: '评分必须在1-5之间' });
            return;
        }
        if (err.message === 'NOT_FOUND') {
            res.status(404).json({ error: '资料不存在' });
            return;
        }
        if (err.message === 'DUPLICATE') {
            res.status(409).json({ error: '重复评分操作' });
            return;
        }
        throw err;
    }
});
// GET /api/resources/:id/rating — 获取评分
router.get('/:id/rating', (req, res) => {
    const userId = req.headers.authorization ? undefined : undefined; // simplified
    const result = resourceService.getResourceRating(parseInt(req.params.id));
    res.json(result);
});
// DELETE /api/resources/:id — 删除资料
router.delete('/:id', authMiddleware, (req, res) => {
    try {
        const deleted = resourceService.deleteResource(parseInt(req.params.id), req.user.userId);
        if (!deleted) {
            res.status(404).json({ error: '资料不存在' });
            return;
        }
        res.json({ message: '删除成功' });
    }
    catch (err) {
        if (err.message === 'FORBIDDEN') {
            res.status(403).json({ error: '无权删除此资料' });
            return;
        }
        throw err;
    }
});
export default router;
