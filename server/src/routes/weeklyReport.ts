/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/weeklyReport.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { WeeklyReportService } from '../services/weeklyReportService';

const router = Router();
const service = new WeeklyReportService();
// 获取周报
router.get('/weekly', authMiddleware, (req, res) => {
    try {
        const report = service.generateReport(req.user.userId, 'week');
        res.json(report);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 获取月报
router.get('/monthly', authMiddleware, (req, res) => {
    try {
        const report = service.generateReport(req.user.userId, 'month');
        res.json(report);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
export default router;
