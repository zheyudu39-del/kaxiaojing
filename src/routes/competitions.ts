/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/competitions.ts

import { Router } from 'express';
import { competitionService } from '../services/competitionService';
import { authMiddleware } from '../middleware/auth';
import { getDb } from '../db/database';

const router = Router();
// GET /api/competitions/categories
// Must be defined before /:id to avoid matching "categories" as an id
router.get('/categories', (_req, res) => {
    try {
        const categories = competitionService.getCategories();
        res.json({ categories });
    }
    catch {
        res.status(500).json({ error: '服务器内部错误' });
    }
});
// GET /api/competitions/deadline-soon — 即将截止报名
router.get('/deadline-soon', (_req, res) => {
    try {
        res.json({ competitions: competitionService.getDeadlineSoon() });
    }
    catch {
        res.status(500).json({ error: '服务器内部错误' });
    }
});
// GET /api/competitions
router.get('/', (req, res) => {
    try {
        const { category, month, keyword } = req.query;
        const filters = {};
        if (typeof category === 'string' && category.trim()) {
            filters.category = category.trim();
        }
        if (month !== undefined && month !== null && month !== '') {
            const monthNum = parseInt(month, 10);
            if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
                filters.month = monthNum;
            }
        }
        if (typeof keyword === 'string' && keyword.trim()) {
            filters.keyword = keyword.trim();
        }
        if (req.query.page)
            filters.page = parseInt(req.query.page, 10) || 1;
        if (req.query.pageSize)
            filters.pageSize = Math.min(parseInt(req.query.pageSize, 10) || 20, 100);
        const result = competitionService.list(filters);
        res.json({ competitions: result.competitions, total: result.total, page: result.page, pageSize: result.pageSize });
    }
    catch {
        res.status(500).json({ error: '服务器内部错误' });
    }
});
// GET /api/competitions/:id
router.get('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(404).json({ error: '竞赛不存在' });
            return;
        }
        const competition = competitionService.getById(id);
        if (!competition) {
            res.status(404).json({ error: '竞赛不存在' });
            return;
        }
        // Get teams for this competition (TeamService doesn't exist yet, query directly)
        const db = getDb();
        const teams = db.prepare(`
      SELECT t.id, t.name, t.description, t.leader_id, t.created_at,
             (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count
      FROM teams t
      WHERE t.competition_id = @competitionId
    `).all({ competitionId: id });
        res.json({ competition, teams });
    }
    catch {
        res.status(500).json({ error: '服务器内部错误' });
    }
});
// GET /api/competitions/:id/related — 相关竞赛推荐
router.get('/:id/related', (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        res.json({ competitions: competitionService.getRelated(id) });
    }
    catch {
        res.status(500).json({ error: '服务器内部错误' });
    }
});
// POST /api/competitions - 教师/管理员发布竞赛
router.post('/', authMiddleware, (req, res) => {
    try {
        const role = req.user?.role;
        if (role !== 'teacher' && role !== 'admin') {
            res.status(403).json({ error: '需要教师认证后才能发布竞赛' });
            return;
        }
        const { name, category, description, target_audience, fee, format, reg_start_month, reg_end_month, requirements, registration_url, qq_group } = req.body;
        if (!name || !category || !reg_start_month) {
            res.status(400).json({ error: '请填写竞赛名称、类别和报名开始月份' });
            return;
        }
        const db = getDb();
        const result = db.prepare(`
      INSERT INTO competitions (name, category, description, target_audience, fee, format, reg_start_month, reg_end_month, requirements, registration_url, qq_group)
      VALUES (@name, @category, @description, @target_audience, @fee, @format, @reg_start_month, @reg_end_month, @requirements, @registration_url, @qq_group)
    `).run({
            name, category,
            description: description || '',
            target_audience: target_audience || '',
            fee: fee || '',
            format: format || 'individual',
            reg_start_month: parseInt(reg_start_month),
            reg_end_month: reg_end_month ? parseInt(reg_end_month) : null,
            requirements: requirements || '',
            registration_url: registration_url || null,
            qq_group: qq_group || null,
        });
        const competition = db.prepare('SELECT * FROM competitions WHERE id = @id').get({ id: result.lastInsertRowid });
        res.status(201).json(competition);
    }
    catch (err) {
        res.status(500).json({ error: err.message || '发布失败' });
    }
});
export default router;
