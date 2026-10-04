/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/admin.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { adminService } from '../services/adminService';
import { notificationService } from '../services/notificationService';
import { reviewService } from '../services/reviewService';
import { proofUpload } from '../middleware/upload';
import { validate } from '../middleware/validate';
import { paginationSchema, createCompetitionSchema, updateUserRoleSchema, createAwardSchema, batchAwardsSchema, announcementSchema, rejectReviewSchema, batchApproveSchema } from '../schemas/admin';

const router = Router();
router.use(authMiddleware, adminMiddleware);
// GET /api/admin/competitions — 竞赛管理列表（含分页和total）
router.get('/competitions', validate({ query: paginationSchema }), (req, res, next) => {
    try {
        const { getDb } = require('../db/database');
        const db = getDb();
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 20;
        const offset = (page - 1) * pageSize;
        const totalResult = db.prepare('SELECT COUNT(*) as count FROM competitions WHERE deleted_at IS NULL').get();
        const competitions = db.prepare('SELECT * FROM competitions WHERE deleted_at IS NULL ORDER BY id LIMIT @pageSize OFFSET @offset').all({ pageSize, offset });
        res.json({ competitions, total: totalResult.count });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/admin/competitions — 新增竞赛
router.post('/competitions', validate({ body: createCompetitionSchema }), (req, res, next) => {
    try {
        const id = adminService.createCompetition(req.body);
        res.status(201).json({ id, message: '竞赛创建成功' });
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/admin/competitions/:id — 更新竞赛
router.put('/competitions/:id', (req, res, next) => {
    try {
        adminService.updateCompetition(parseInt(req.params.id), req.body);
        res.json({ message: '更新成功' });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/users — 用户管理列表
router.get('/users', validate({ query: paginationSchema }), (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 20;
        res.json(adminService.listUsers(page, pageSize));
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/admin/users/:id/role — 修改用户角色
router.put('/users/:id/role', validate({ body: updateUserRoleSchema }), (req, res, next) => {
    try {
        adminService.updateUserRole(parseInt(req.params.id), req.body.role);
        res.json({ message: '角色更新成功' });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/awards — 获奖管理列表
router.get('/awards', validate({ query: paginationSchema }), (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 20;
        res.json(adminService.listAwards(page, pageSize));
    }
    catch (err) {
        next(err);
    }
});
// POST /api/admin/awards — 录入获奖记录
router.post('/awards', validate({ body: createAwardSchema }), (req, res, next) => {
    try {
        adminService.addAward(req.body);
        res.status(201).json({ message: '获奖记录添加成功' });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/admin/awards/batch — 批量导入获奖记录
router.post('/awards/batch', validate({ body: batchAwardsSchema }), (req, res, next) => {
    try {
        const result = adminService.batchAddAwards(req.body.awards);
        res.json({ message: `批量导入完成：成功 ${result.success} 条，失败 ${result.failed} 条`, ...result });
    }
    catch (err) {
        next(err);
    }
});
// DELETE /api/admin/awards/:id — 删除获奖记录
router.delete('/awards/:id', (req, res, next) => {
    try {
        adminService.deleteAward(parseInt(req.params.id));
        res.json({ message: '删除成功' });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/admin/announcements — 发布系统公告
router.post('/announcements', validate({ body: announcementSchema }), (req, res, next) => {
    try {
        const { title, content } = req.body;
        notificationService.createBroadcast(title, content);
        adminService.addLog(req.user.userId, '发布公告', title, content, req.ip || '');
        res.status(201).json({ message: '公告发布成功' });
    }
    catch (err) {
        next(err);
    }
});
// DELETE /api/admin/competitions/:id — 删除竞赛
router.delete('/competitions/:id', (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        adminService.deleteCompetition(id);
        adminService.addLog(req.user.userId, '删除竞赛', `竞赛ID:${id}`, '', req.ip || '');
        res.json({ message: '竞赛删除成功' });
    }
    catch (err) {
        if (err.message === 'NOT_FOUND') {
            res.status(404).json({ error: '竞赛不存在' });
            return;
        }
        next(err);
    }
});
// GET /api/admin/logs — 系统日志
router.get('/logs', validate({ query: paginationSchema }), (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 30;
        const keyword = req.query.keyword;
        const action = req.query.action;
        res.json(adminService.listLogs(page, pageSize, keyword, action));
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/dashboard-stats — 管理面板数据看板
router.get('/dashboard-stats', (_req, res, next) => {
    try {
        const stats = adminService.getDashboardStats();
        res.json(stats);
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/export — 数据库导出（支持 token query param 用于浏览器直接下载）
router.get('/export', (_req, res, next) => {
    try {
        const data = adminService.exportDatabase();
        res.setHeader('Content-Disposition', `attachment; filename=db-export-${Date.now()}.json`);
        res.json(data);
    }
    catch (err) {
        next(err);
    }
});
// --- 审核管理路由 ---
// 真正可审核的内容类型 —— 必须与 reviewService 的 TABLE_MAP + avatar 特例保持一致。
// 曾多写了 post/resource/recruitment：这三类内容创建时直接写入 review_status='approved'
// （见 postService/resourceService/recruitmentService），从不进入审核队列，
// 列在合法类型里只会让前端下拉给出永远 400 的选项。
const VALID_CONTENT_TYPES = ['award', 'certificate', 'avatar', 'teacher_cert'];
/**
 * 内容类型别名归一化。
 * service 层用的是**单数**（award / certificate / teacher_cert），
 * 而前端下拉历史版本用的是**复数**，cert_study_plans 更是另一个词。
 * 两边不一致会让「列表筛选」静默失效、「通过/拒绝」按钮 400，
 * 因此在入口统一归一化，兼容新旧两种写法。
 */
const CONTENT_TYPE_ALIASES: Record<string, string> = {
    awards: 'award',
    certificates: 'certificate',
    teacher_certs: 'teacher_cert',
    cert_study_plans: 'certificate',
    certPlans: 'certificate',
};
function normalizeContentType(value: unknown): string | undefined {
    if (typeof value !== 'string' || !value)
        return undefined;
    return CONTENT_TYPE_ALIASES[value] || value;
}
// GET /api/admin/reviews — 审核列表
router.get('/reviews', (req, res, next) => {
    try {
        // 兼容两种参数名：前端（api/stats.ts 的 adminApi.reviews）发的是 type，
        // 而本路由历史实现只认 content_type，导致筛选被静默忽略、
        // 列表混入其它类型的内容，进而让「通过」按钮带着错误的 type 去审核而 400。
        const content_type = normalizeContentType(req.query.content_type || req.query.type);
        if (content_type && !VALID_CONTENT_TYPES.includes(content_type)) {
            res.status(400).json({ error: '无效的内容类型' });
            return;
        }
        const status = req.query.status || 'pending';
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 20;
        const result = reviewService.listReviewItems({ content_type, status, page, pageSize });
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/reviews/stats — 审核统计
router.get('/reviews/stats', (_req, res, next) => {
    try {
        const stats = reviewService.getReviewStats();
        res.json(stats);
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/reviews/:type/:id — 审核详情
router.get('/reviews/:type/:id', (req, res, next) => {
    try {
        const type = normalizeContentType(req.params.type);
        const id = req.params.id;
        if (!VALID_CONTENT_TYPES.includes(type)) {
            res.status(400).json({ error: '无效的内容类型' });
            return;
        }
        const detail = reviewService.getReviewDetail(type, parseInt(id));
        if (!detail) {
            res.status(404).json({ error: '审核项不存在' });
            return;
        }
        res.json(detail);
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/admin/reviews/:type/:id/approve — 通过审核
router.put('/reviews/:type/:id/approve', (req, res, next) => {
    try {
        const type = normalizeContentType(req.params.type);
        const id = req.params.id;
        if (!VALID_CONTENT_TYPES.includes(type)) {
            res.status(400).json({ error: '无效的内容类型' });
            return;
        }
        reviewService.approveItem(type, parseInt(id), req.user.userId);
        res.json({ message: '审核通过' });
    }
    catch (err) {
        if (err.message === 'NOT_FOUND') {
            res.status(404).json({ error: '审核项不存在' });
            return;
        }
        if (err.message === 'ALREADY_REVIEWED') {
            res.status(400).json({ error: '该内容已审核' });
            return;
        }
        if (err.message === 'INVALID_CONTENT_TYPE') {
            res.status(400).json({ error: '无效的内容类型' });
            return;
        }
        next(err);
    }
});
// PUT /api/admin/reviews/:type/:id/reject — 拒绝审核
router.put('/reviews/:type/:id/reject', validate({ body: rejectReviewSchema }), (req, res, next) => {
    try {
        const type = normalizeContentType(req.params.type);
        const id = req.params.id;
        if (!VALID_CONTENT_TYPES.includes(type)) {
            res.status(400).json({ error: '无效的内容类型' });
            return;
        }
        reviewService.rejectItem(type, parseInt(id), req.user.userId, req.body.comment);
        res.json({ message: '已拒绝' });
    }
    catch (err) {
        if (err.message === 'NOT_FOUND') {
            res.status(404).json({ error: '审核项不存在' });
            return;
        }
        if (err.message === 'ALREADY_REVIEWED') {
            res.status(400).json({ error: '该内容已审核' });
            return;
        }
        if (err.message === 'INVALID_CONTENT_TYPE') {
            res.status(400).json({ error: '无效的内容类型' });
            return;
        }
        next(err);
    }
});
// POST /api/admin/reviews/batch-approve — 批量通过
router.post('/reviews/batch-approve', validate({ body: batchApproveSchema }), (req, res, next) => {
    try {
        const result = reviewService.batchApprove(req.body.items, req.user.userId);
        res.json({ message: `批量审核完成：成功 ${result.success} 条，失败 ${result.failed} 条`, ...result });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/admin/upload/proof — 证明材料图片上传
router.post('/upload/proof', proofUpload.single('proof'), (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: '请上传图片文件' });
            return;
        }
        const fileUrl = `/uploads/proofs/${req.file.filename}`;
        res.json({ url: fileUrl });
    }
    catch (err) {
        next(err);
    }
});
// --- 软删除恢复路由 ---
const SOFT_DELETE_TYPES = ['competitions', 'posts', 'resources', 'recruitments'];
const SAFE_TABLE_MAP = {
    competitions: 'competitions',
    posts: 'posts',
    resources: 'resources',
    recruitments: 'recruitments',
};
// PUT /api/admin/:type/:id/restore — 恢复软删除记录
router.put('/:type/:id/restore', (req, res, next) => {
    try {
        const type = normalizeContentType(req.params.type);
        const id = req.params.id;
        if (!SOFT_DELETE_TYPES.includes(type)) {
            res.status(400).json({ error: '无效的资源类型，仅支持: competitions, posts, resources, recruitments' });
            return;
        }
        const { getDb } = require('../db/database');
        const db = getDb();
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            res.status(400).json({ error: '无效的 ID' });
            return;
        }
        const tableName = SAFE_TABLE_MAP[type];
        const record = db.prepare(`SELECT id FROM ${tableName} WHERE id = @id AND deleted_at IS NOT NULL`).get({ id: numericId });
        if (!record) {
            res.status(404).json({ error: '未找到已删除的记录' });
            return;
        }
        db.prepare(`UPDATE ${tableName} SET deleted_at = NULL WHERE id = @id`).run({ id: numericId });
        res.json({ message: '恢复成功' });
    }
    catch (err) {
        next(err);
    }
});
export default router;
