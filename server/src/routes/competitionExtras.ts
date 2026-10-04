/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/competitionExtras.ts

import { Router } from 'express';
import { difficultyService } from '../services/difficultyService';
import { prepPlanService } from '../services/prepPlanService';
import { authMiddleware } from '../middleware/auth';
import { proofUpload } from '../middleware/upload';
import { getDb } from '../db/database';

const router = Router();
// 角色检查：teacher 或 admin
function requireTeacherOrAdmin(req, res, next) {
    const role = req.user?.role;
    if (role !== 'teacher' && role !== 'admin') {
        res.status(403).json({ error: '需要教师或管理员权限' });
        return;
    }
    next();
}
// GET /api/competitions/:id/timeline - 获取竞赛阶段
router.get('/:id/timeline', (req, res) => {
    try {
        const db = getDb();
        const compId = parseInt(req.params.id);
        const stages = db.prepare(`
      SELECT * FROM competition_stages 
      WHERE competition_id = @compId 
      ORDER BY sort_order, start_month
    `).all({ compId });
        res.json({ stages });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// GET /api/competitions/:id/difficulty
router.get('/:id/difficulty', (req, res) => {
    try {
        const analysis = difficultyService.getDifficultyAnalysis(parseInt(req.params.id));
        if (!analysis)
            return res.status(404).json({ error: '竞赛不存在' });
        res.json(analysis);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// GET /api/competitions/:id/prep-plan
router.get('/:id/prep-plan', (req, res) => {
    try {
        const plan = prepPlanService.generatePlan(parseInt(req.params.id));
        res.json(plan);
    }
    catch (err) {
        if (err.message === '竞赛不存在')
            return res.status(404).json({ error: err.message });
        res.status(500).json({ error: err.message });
    }
});
// GET /api/competitions/:id/group-info - 获取竞赛交流群信息
router.get('/:id/group-info', (req, res) => {
    try {
        const db = getDb();
        const id = parseInt(req.params.id);
        const comp = db.prepare('SELECT qq_group, wechat_qrcode_url, registration_url FROM competitions WHERE id = @id').get({ id });
        if (!comp) {
            res.status(404).json({ error: '竞赛不存在' });
            return;
        }
        res.json({ qq_group: comp.qq_group, wechat_qrcode_url: comp.wechat_qrcode_url, registration_url: comp.registration_url });
    }
    catch {
        res.status(500).json({ error: '服务器内部错误' });
    }
});
// PUT /api/competitions/:id/group-info - 更新竞赛交流群信息
router.put('/:id/group-info', authMiddleware, requireTeacherOrAdmin, proofUpload.single('wechat_qrcode'), (req, res) => {
    try {
        const db = getDb();
        const id = parseInt(req.params.id);
        const comp = db.prepare('SELECT id FROM competitions WHERE id = @id').get({ id });
        if (!comp) {
            res.status(404).json({ error: '竞赛不存在' });
            return;
        }
        const qqGroup = req.body.qq_group || null;
        let wechatQrcodeUrl = req.body.wechat_qrcode_url || null;
        if (req.file) {
            wechatQrcodeUrl = `/uploads/proofs/${req.file.filename}`;
        }
        db.prepare('UPDATE competitions SET qq_group = @qqGroup, wechat_qrcode_url = @wechatQrcodeUrl WHERE id = @id')
            .run({ id, qqGroup, wechatQrcodeUrl });
        res.json({ message: '交流群信息已更新' });
    }
    catch {
        res.status(500).json({ error: '服务器内部错误' });
    }
});
// PUT /api/competitions/:id/registration-url - 更新官网报名链接
router.put('/:id/registration-url', authMiddleware, requireTeacherOrAdmin, (req, res) => {
    try {
        const db = getDb();
        const id = parseInt(req.params.id);
        const comp = db.prepare('SELECT id FROM competitions WHERE id = @id').get({ id });
        if (!comp) {
            res.status(404).json({ error: '竞赛不存在' });
            return;
        }
        const { registration_url } = req.body;
        if (registration_url) {
            try {
                new URL(registration_url);
            }
            catch {
                res.status(400).json({ error: '链接格式不正确，请输入有效的URL' });
                return;
            }
        }
        db.prepare('UPDATE competitions SET registration_url = @url WHERE id = @id')
            .run({ id, url: registration_url || null });
        res.json({ message: '报名链接已更新' });
    }
    catch {
        res.status(500).json({ error: '服务器内部错误' });
    }
});
// === 竞赛获奖名单 ===
// GET /api/competitions/:id/awards - 获取竞赛获奖名单
router.get('/:id/awards', (req, res) => {
    try {
        const db = getDb();
        const compId = parseInt(req.params.id);
        const awards = db.prepare(`
      SELECT a.id, a.user_id, u.username, u.college, a.award_level, a.award_date,
        u.avatar_url
      FROM awards a
      JOIN users u ON a.user_id = u.id
      WHERE a.competition_id = @compId AND a.review_status = 'approved'
      ORDER BY a.award_date DESC, a.id DESC
    `).all({ compId });
        res.json({ awards });
    }
    catch (err) {
        res.status(500).json({ error: err.message || '服务器内部错误' });
    }
});
// === 竞赛阶段管理 CRUD ===
// === 竞赛评价系统 ===
// GET /api/competitions/:id/reviews - 获取竞赛评价列表
router.get('/:id/reviews', (req, res) => {
    try {
        const db = getDb();
        const compId = parseInt(req.params.id);
        const reviews = db.prepare(`
      SELECT cr.id, cr.user_id, u.username, u.avatar_url, cr.rating, cr.content, cr.created_at
      FROM competition_reviews cr
      JOIN users u ON cr.user_id = u.id
      WHERE cr.competition_id = @compId
      ORDER BY cr.created_at DESC
    `).all({ compId });
        const stats = db.prepare(`
      SELECT COUNT(*) as total, AVG(rating) as avg_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as r5,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as r4,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as r3,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as r2,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as r1
      FROM competition_reviews WHERE competition_id = @compId
    `).get({ compId });
        res.json({
            reviews,
            stats: {
                total: stats.total || 0,
                avg_rating: stats.avg_rating ? Math.round(stats.avg_rating * 10) / 10 : 0,
                distribution: { 5: stats.r5 || 0, 4: stats.r4 || 0, 3: stats.r3 || 0, 2: stats.r2 || 0, 1: stats.r1 || 0 }
            }
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message || '服务器内部错误' });
    }
});
// POST /api/competitions/:id/reviews - 提交评价
router.post('/:id/reviews', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        const compId = parseInt(req.params.id);
        const userId = req.user.userId;
        const { rating, content } = req.body;
        if (!rating || rating < 1 || rating > 5) {
            res.status(400).json({ error: '评分必须在1-5之间' });
            return;
        }
        const comp = db.prepare('SELECT id FROM competitions WHERE id = @id').get({ id: compId });
        if (!comp) {
            res.status(404).json({ error: '竞赛不存在' });
            return;
        }
        const existing = db.prepare('SELECT id FROM competition_reviews WHERE competition_id = @compId AND user_id = @userId').get({ compId, userId });
        if (existing) {
            db.prepare('UPDATE competition_reviews SET rating = @rating, content = @content WHERE competition_id = @compId AND user_id = @userId')
                .run({ compId, userId, rating, content: content || '' });
            res.json({ message: '评价已更新' });
        }
        else {
            db.prepare('INSERT INTO competition_reviews (competition_id, user_id, rating, content) VALUES (@compId, @userId, @rating, @content)')
                .run({ compId, userId, rating, content: content || '' });
            res.status(201).json({ message: '评价已提交' });
        }
    }
    catch (err) {
        res.status(500).json({ error: err.message || '服务器内部错误' });
    }
});
// DELETE /api/competitions/:id/reviews - 删除自己的评价
router.delete('/:id/reviews', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        const compId = parseInt(req.params.id);
        const userId = req.user.userId;
        const result = db.prepare('DELETE FROM competition_reviews WHERE competition_id = @compId AND user_id = @userId').run({ compId, userId });
        if (result.changes === 0) {
            res.status(404).json({ error: '评价不存在' });
            return;
        }
        res.json({ message: '评价已删除' });
    }
    catch (err) {
        res.status(500).json({ error: err.message || '服务器内部错误' });
    }
});
// GET /api/competitions/:id/my-review - 获取当前用户的评价
router.get('/:id/my-review', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        const compId = parseInt(req.params.id);
        const userId = req.user.userId;
        const review = db.prepare('SELECT id, rating, content, created_at FROM competition_reviews WHERE competition_id = @compId AND user_id = @userId').get({ compId, userId });
        res.json({ review: review || null });
    }
    catch (err) {
        res.status(500).json({ error: err.message || '服务器内部错误' });
    }
});
// POST /api/competitions/:id/stages - 新增阶段
router.post('/:id/stages', authMiddleware, requireTeacherOrAdmin, (req, res) => {
    try {
        const db = getDb();
        const compId = parseInt(req.params.id);
        const comp = db.prepare('SELECT id FROM competitions WHERE id = @id').get({ id: compId });
        if (!comp) {
            res.status(404).json({ error: '竞赛不存在' });
            return;
        }
        const { stage_name, start_month, end_month, description, sort_order } = req.body;
        if (!stage_name || !start_month || !end_month) {
            res.status(400).json({ error: '阶段名称、开始月份、结束月份为必填项' });
            return;
        }
        const result = db.prepare('INSERT INTO competition_stages (competition_id, stage_name, start_month, end_month, description, sort_order) VALUES (@compId, @stageName, @startMonth, @endMonth, @desc, @sortOrder)').run({ compId, stageName: stage_name, startMonth: start_month, endMonth: end_month, desc: description || '', sortOrder: sort_order || 0 });
        res.status(201).json({ id: result.lastInsertRowid, message: '阶段添加成功' });
    }
    catch (err) {
        res.status(500).json({ error: err.message || '服务器内部错误' });
    }
});
// PUT /api/competitions/:id/stages/:stageId - 更新阶段
router.put('/:id/stages/:stageId', authMiddleware, requireTeacherOrAdmin, (req, res) => {
    try {
        const db = getDb();
        const stageId = parseInt(req.params.stageId);
        const stage = db.prepare('SELECT id FROM competition_stages WHERE id = @id AND competition_id = @compId').get({ id: stageId, compId: parseInt(req.params.id) });
        if (!stage) {
            res.status(404).json({ error: '阶段不存在' });
            return;
        }
        const { stage_name, start_month, end_month, description, sort_order } = req.body;
        // 与 POST /:id/stages 保持一致：这三列在表里是 NOT NULL，
        // 不校验会让缺失字段一路走到 UPDATE，触发约束错误变成 500
        if (!stage_name || !start_month || !end_month) {
            res.status(400).json({ error: '阶段名称、开始月份、结束月份为必填项' });
            return;
        }
        db.prepare('UPDATE competition_stages SET stage_name = @stageName, start_month = @startMonth, end_month = @endMonth, description = @desc, sort_order = @sortOrder WHERE id = @id').run({ id: stageId, stageName: stage_name, startMonth: start_month, endMonth: end_month, desc: description || '', sortOrder: sort_order || 0 });
        res.json({ message: '阶段更新成功' });
    }
    catch (err) {
        res.status(500).json({ error: err.message || '服务器内部错误' });
    }
});
// DELETE /api/competitions/:id/stages/:stageId - 删除阶段
router.delete('/:id/stages/:stageId', authMiddleware, requireTeacherOrAdmin, (req, res) => {
    try {
        const db = getDb();
        const stageId = parseInt(req.params.stageId);
        const stage = db.prepare('SELECT id FROM competition_stages WHERE id = @id AND competition_id = @compId').get({ id: stageId, compId: parseInt(req.params.id) });
        if (!stage) {
            res.status(404).json({ error: '阶段不存在' });
            return;
        }
        db.prepare('DELETE FROM competition_stages WHERE id = @id').run({ id: stageId });
        res.json({ message: '阶段删除成功' });
    }
    catch (err) {
        res.status(500).json({ error: err.message || '服务器内部错误' });
    }
});
export default router;
