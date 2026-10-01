/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/search.ts

import { Router } from 'express';
import { searchService } from '../services/searchService';

const router = Router();
// GET /api/search?keyword=xxx&types=competition,post,resource
router.get('/', (req, res) => {
    try {
        const keyword = req.query.keyword;
        if (!keyword || !keyword.trim()) {
            res.status(400).json({ error: '请提供搜索关键词' });
            return;
        }
        const typesParam = req.query.types;
        const types = typesParam
            ? typesParam.split(',').map(t => t.trim()).filter(Boolean)
            : undefined;
        const results = searchService.search(keyword, types);
        res.json({ results });
    }
    catch (err) {
        res.status(500).json({ error: err.message || '搜索失败' });
    }
});
export default router;
