/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/certificates.ts

import { Router } from 'express';
import { certificateService } from '../services/certificateService';

const router = Router();
// GET /api/certificates — 证书列表
router.get('/', (req, res) => {
    const category = req.query.category;
    const keyword = req.query.keyword;
    const difficulty = req.query.difficulty;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const certificates = certificateService.list({ category, keyword, difficulty, page, pageSize });
    res.json({ certificates });
});
// GET /api/certificates/categories — 证书分类
router.get('/categories', (_req, res) => {
    const categories = certificateService.getCategories();
    res.json({ categories });
});
// GET /api/certificates/:id — 证书详情
router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        res.status(400).json({ error: '无效的证书ID' });
        return;
    }
    const cert = certificateService.getById(id);
    if (!cert) {
        res.status(404).json({ error: '证书不存在' });
        return;
    }
    res.json(cert);
});
export default router;
