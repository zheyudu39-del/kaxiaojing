/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/studyGroups.ts

import { Router } from 'express';
import { optionalAuthMiddleware, authMiddleware } from '../middleware/auth';
import { studyGroupService } from '../services/studyGroupService';

const router = Router();
// 获取小组列表
router.get('/', optionalAuthMiddleware, (req, res) => {
    const { category, page = '1', limit = '20' } = req.query;
    const groups = studyGroupService.list(category, parseInt(page), parseInt(limit));
    res.json({ groups });
});
// 创建小组
router.post('/', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const { name, description, category } = req.body;
    if (!name || !category) {
        res.status(400).json({ error: '缺少必要参数' });
        return;
    }
    const groupId = studyGroupService.create({ name, description: description || '', category, creatorId: userId });
    res.json({ success: true, group_id: groupId });
});
// 获取我加入的小组 - 必须在 /:groupId 之前
router.get('/user/my', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const groups = studyGroupService.getUserGroups(userId);
    res.json({ groups });
});
// 获取小组详情
router.get('/:groupId', optionalAuthMiddleware, (req, res) => {
    const groupId = parseInt(req.params.groupId);
    const userId = req.user?.id;
    const group = studyGroupService.getById(groupId);
    if (!group) {
        res.status(404).json({ error: '小组不存在' });
        return;
    }
    const isMember = userId ? studyGroupService.isMember(groupId, userId) : false;
    res.json({ ...group, is_member: isMember });
});
// 加入小组
router.post('/:groupId/join', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const groupId = parseInt(req.params.groupId);
    studyGroupService.join(groupId, userId);
    res.json({ success: true, message: '已加入小组' });
});
// 退出小组
router.post('/:groupId/leave', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const groupId = parseInt(req.params.groupId);
    studyGroupService.leave(groupId, userId);
    res.json({ success: true, message: '已退出小组' });
});
// 获取小组成员
router.get('/:groupId/members', (req, res) => {
    const groupId = parseInt(req.params.groupId);
    const members = studyGroupService.getMembers(groupId);
    res.json({ members });
});
// 发送小组消息
router.post('/:groupId/messages', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const groupId = parseInt(req.params.groupId);
    const { content } = req.body;
    if (!studyGroupService.isMember(groupId, userId)) {
        res.status(403).json({ error: '您不是该小组成员' });
        return;
    }
    studyGroupService.sendMessage(groupId, userId, content);
    res.json({ success: true });
});
// 获取小组消息
router.get('/:groupId/messages', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const groupId = parseInt(req.params.groupId);
    const { limit = '50', before_id } = req.query;
    if (!studyGroupService.isMember(groupId, userId)) {
        res.status(403).json({ error: '您不是该小组成员' });
        return;
    }
    const messages = studyGroupService.getMessages(groupId, parseInt(limit), before_id ? parseInt(before_id) : undefined);
    res.json({ messages });
});
export default router;
