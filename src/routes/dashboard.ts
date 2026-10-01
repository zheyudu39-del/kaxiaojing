/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/dashboard.ts

import { Router } from 'express';
import { dashboardService } from '../services/dashboardService';
import jsonwebtoken from 'jsonwebtoken';

const router = Router();
// GET /api/dashboard - 获取看板数据
router.get('/', (req, res) => {
    try {
        const publicData = dashboardService.getPublicStats();
        let personalizedData = null;
        // 尝试解析 token 获取个性化数据
        const authHeader = req.headers.authorization;
        if (authHeader) {
            try {
                const token = authHeader.split(' ')[1];
                const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET || 'competition-system-secret');
                personalizedData = dashboardService.getPersonalizedData(decoded.userId);
            }
            catch { }
        }
        res.json({ ...publicData, personalized: personalizedData });
    }
    catch (err) {
        res.status(500).json({ error: err.message || '获取看板数据失败' });
    }
});
export default router;
