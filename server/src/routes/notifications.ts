/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/notifications.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { notificationService } from '../services/notificationService';

const router = Router();
// GET /api/notifications — 获取通知列表
router.get('/', authMiddleware, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const result = notificationService.getNotifications(req.user.userId, page, pageSize);
    res.json(result);
});
// GET /api/notifications/unread-count — 获取未读数量
router.get('/unread-count', authMiddleware, (req, res) => {
    const count = notificationService.getUnreadCount(req.user.userId);
    res.json({ unread_count: count });
});
// PUT /api/notifications/read-all — 标记全部已读
router.put('/read-all', authMiddleware, (req, res) => {
    notificationService.markAllAsRead(req.user.userId);
    res.json({ message: '全部标记为已读' });
});
// PUT /api/notifications/:id/read — 标记单条已读
router.put('/:id/read', authMiddleware, (req, res) => {
    try {
        const result = notificationService.markAsRead(parseInt(req.params.id), req.user.userId);
        if (!result) {
            res.status(404).json({ error: '通知不存在' });
            return;
        }
        res.json({ message: '已标记为已读' });
    }
    catch (err) {
        if (err.message === 'FORBIDDEN') {
            res.status(403).json({ error: '无权操作此通知' });
            return;
        }
        throw err;
    }
});
// DELETE /api/notifications/batch — 批量删除通知（必须在 /:id 之前定义）
router.delete('/batch', authMiddleware, (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({ error: '请选择要删除的通知' });
        return;
    }
    if (ids.length > 100) {
        res.status(400).json({ error: '单次最多删除100条' });
        return;
    }
    const count = notificationService.deleteNotifications(ids, req.user.userId);
    res.json({ message: `已删除 ${count} 条通知`, deleted_count: count });
});
// DELETE /api/notifications/all — 删除所有通知（必须在 /:id 之前定义）
router.delete('/all', authMiddleware, (req, res) => {
    const count = notificationService.deleteAllNotifications(req.user.userId);
    res.json({ message: `已删除 ${count} 条通知`, deleted_count: count });
});
// DELETE /api/notifications/read — 删除所有已读通知（必须在 /:id 之前定义）
router.delete('/read', authMiddleware, (req, res) => {
    const count = notificationService.deleteReadNotifications(req.user.userId);
    res.json({ message: `已删除 ${count} 条已读通知`, deleted_count: count });
});
// DELETE /api/notifications/:id — 删除单条通知（必须放在最后，否则会拦截 /batch /all /read）
router.delete('/:id', authMiddleware, (req, res) => {
    try {
        const result = notificationService.deleteNotification(parseInt(req.params.id), req.user.userId);
        if (!result) {
            res.status(404).json({ error: '通知不存在' });
            return;
        }
        res.json({ message: '通知已删除' });
    }
    catch (err) {
        if (err.message === 'FORBIDDEN') {
            res.status(403).json({ error: '无权操作此通知' });
            return;
        }
        throw err;
    }
});
export default router;
