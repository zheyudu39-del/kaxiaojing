/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/majors.ts

import { Router } from 'express';
import { collegeService } from '../services/collegeService';

const router = Router();
// GET /api/majors/:id/competitions
router.get('/:id/competitions', (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(404).json({ error: '专业不存在' });
            return;
        }
        const major = collegeService.getMajorById(id);
        if (!major) {
            res.status(404).json({ error: '专业不存在' });
            return;
        }
        const competitions = collegeService.getCompetitionsByMajorId(id);
        res.json({ competitions });
    }
    catch {
        res.status(500).json({ error: '服务器内部错误' });
    }
});
export default router;
