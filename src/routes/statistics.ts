/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/statistics.ts

import { Router } from 'express';
import { statisticsService } from '../services/statisticsService';

const router = Router();
router.get('/overview', (_req, res) => {
    res.json(statisticsService.getOverview());
});
router.get('/college-participation', (_req, res) => {
    res.json(statisticsService.getCollegeParticipation());
});
router.get('/competition-popularity', (_req, res) => {
    res.json(statisticsService.getCompetitionPopularity());
});
router.get('/monthly-trend', (_req, res) => {
    res.json(statisticsService.getMonthlyTrend());
});
router.get('/competition/:id', (req, res) => {
    const data = statisticsService.getCompetitionDetail(parseInt(req.params.id));
    if (!data) {
        res.status(404).json({ error: '竞赛不存在' });
        return;
    }
    res.json(data);
});
router.get('/ranking-by-college', (_req, res) => {
    res.json(statisticsService.getRankingByCollege());
});
router.get('/ranking-by-category', (_req, res) => {
    res.json(statisticsService.getRankingByCategory());
});
// 图表数据接口
router.get('/registration-trend', (_req, res) => {
    res.json(statisticsService.getRegistrationTrend());
});
router.get('/participants-by-category', (_req, res) => {
    res.json(statisticsService.getParticipantsByCategory());
});
router.get('/award-distribution', (_req, res) => {
    res.json(statisticsService.getAwardDistribution());
});
router.get('/awards-by-college', (req, res) => {
    const { start, end } = req.query;
    const timeRange = start || end ? { start: start, end: end } : undefined;
    res.json(statisticsService.getAwardsByCollege(timeRange));
});
router.get('/awards-by-competition', (req, res) => {
    const { start, end } = req.query;
    const timeRange = start || end ? { start: start, end: end } : undefined;
    res.json(statisticsService.getAwardsByCompetition(timeRange));
});
export default router;
