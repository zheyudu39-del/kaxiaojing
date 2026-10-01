/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/dataDashboard.ts

import { Router } from 'express';
import { DataDashboardService } from '../services/dataDashboardService';

const router = Router();
const service = new DataDashboardService();
// 综合概览
router.get('/overview', (req, res) => {
    try {
        res.json(service.getOverview());
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 按类别统计竞赛
router.get('/competitions-by-category', (req, res) => {
    try {
        res.json(service.getCompetitionsByCategory());
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 按类别统计参赛人数
router.get('/participants-by-category', (req, res) => {
    try {
        res.json(service.getParticipantsByCategory());
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 按学院统计
router.get('/participants-by-college', (req, res) => {
    try {
        res.json(service.getParticipantsByCollege());
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 获奖分布
router.get('/award-distribution', (req, res) => {
    try {
        res.json(service.getAwardDistribution());
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 月度报名趋势
router.get('/registration-trend', (req, res) => {
    try {
        res.json(service.getMonthlyRegistrationTrend());
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 用户增长趋势
router.get('/user-growth', (req, res) => {
    try {
        res.json(service.getMonthlyUserGrowth());
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 热门竞赛
router.get('/hot-competitions', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        res.json(service.getHotCompetitions(limit));
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 活跃用户
router.get('/active-users', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        res.json(service.getActiveUsers(limit));
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
export default router;
