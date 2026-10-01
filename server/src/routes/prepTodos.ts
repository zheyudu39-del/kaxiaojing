/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/prepTodos.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { prepTodoService } from '../services/prepTodoService';

const router = Router();
// 获取我的待办列表
router.get('/', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const todos = prepTodoService.getUserTodos(userId, {
        completed: req.query.completed === 'true' ? true : req.query.completed === 'false' ? false : undefined,
        competition_id: req.query.competition_id ? parseInt(req.query.competition_id) : undefined,
        certificate_id: req.query.certificate_id ? parseInt(req.query.certificate_id) : undefined
    });
    res.json(todos);
});
// 获取今日待办
router.get('/today', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const todos = prepTodoService.getTodayTodos(userId);
    res.json(todos);
});
// 获取统计
router.get('/stats', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const stats = prepTodoService.getStats(userId);
    res.json(stats);
});
// 创建待办
router.post('/', authMiddleware, (req, res) => {
    try {
        const userId = req.user.userId;
        const todo = prepTodoService.create(userId, req.body);
        res.status(201).json(todo);
    }
    catch (err) {
        if (err.message === 'TITLE_EMPTY') {
            res.status(400).json({ error: '标题不能为空' });
        }
        else {
            res.status(500).json({ error: '创建失败' });
        }
    }
});
// 更新待办
router.patch('/:id', authMiddleware, (req, res) => {
    try {
        const userId = req.user.userId;
        const id = parseInt(req.params.id);
        const todo = prepTodoService.update(id, userId, req.body);
        if (!todo) {
            res.status(404).json({ error: '待办不存在' });
            return;
        }
        res.json(todo);
    }
    catch (err) {
        if (err.message === 'TITLE_EMPTY') {
            res.status(400).json({ error: '标题不能为空' });
        }
        else {
            res.status(500).json({ error: '更新失败' });
        }
    }
});
// 切换完成状态
router.post('/:id/toggle', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const id = parseInt(req.params.id);
    const todo = prepTodoService.toggleComplete(id, userId);
    if (!todo) {
        res.status(404).json({ error: '待办不存在' });
        return;
    }
    res.json(todo);
});
// 删除待办
router.delete('/:id', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const id = parseInt(req.params.id);
    const success = prepTodoService.delete(id, userId);
    if (!success) {
        res.status(404).json({ error: '待办不存在' });
        return;
    }
    res.json({ success: true });
});
export default router;
