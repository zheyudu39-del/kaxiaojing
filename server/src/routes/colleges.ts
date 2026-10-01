/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/colleges.ts

import { Router } from 'express';
import { collegeService } from '../services/collegeService';

const router = Router();
// GET /api/colleges
router.get('/', (_req, res) => {
    try {
        const colleges = collegeService.listColleges();
        res.json({ colleges });
    }
    catch {
        res.status(500).json({ error: '服务器内部错误' });
    }
});
// GET /api/colleges/:id/majors
router.get('/:id/majors', (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(404).json({ error: '学院不存在' });
            return;
        }
        const college = collegeService.getCollegeById(id);
        if (!college) {
            res.status(404).json({ error: '学院不存在' });
            return;
        }
        const majors = collegeService.getMajorsByCollegeId(id);
        res.json({ majors });
    }
    catch {
        res.status(500).json({ error: '服务器内部错误' });
    }
});
// GET /api/colleges/:id/competitions
router.get('/:id/competitions', (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(404).json({ error: '学院不存在' });
            return;
        }
        const college = collegeService.getCollegeById(id);
        if (!college) {
            res.status(404).json({ error: '学院不存在' });
            return;
        }
        const competitions = collegeService.getCompetitionsByCollegeId(id);
        res.json({ competitions });
    }
    catch {
        res.status(500).json({ error: '服务器内部错误' });
    }
});
export default router;
