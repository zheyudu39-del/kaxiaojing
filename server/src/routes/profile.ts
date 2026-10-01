/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/profile.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { avatarUpload, proofUpload } from '../middleware/upload';
import { profileService } from '../services/profileService';
import multer from 'multer';

const router = Router();
// GET /api/profile — 获取当前用户资料
router.get('/', authMiddleware, (req, res) => {
    const profile = profileService.getProfile(req.user.userId);
    if (!profile) {
        res.status(404).json({ error: '用户不存在' });
        return;
    }
    res.json(profile);
});
// PUT /api/profile — 更新当前用户资料
router.put('/', authMiddleware, (req, res) => {
    const profile = profileService.updateProfile(req.user.userId, req.body);
    if (!profile) {
        res.status(404).json({ error: '用户不存在' });
        return;
    }
    res.json(profile);
});
// POST /api/profile/avatar — 上传头像
router.post('/avatar', authMiddleware, (req, res) => {
    avatarUpload.single('avatar')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                res.status(400).json({ error: '头像文件大小不能超过 2MB' });
                return;
            }
            res.status(400).json({ error: err.message });
            return;
        }
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (!req.file) {
            res.status(400).json({ error: '请选择要上传的头像' });
            return;
        }
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        profileService.setPendingAvatar(req.user.userId, avatarUrl);
        res.json({ avatar_url: avatarUrl, pending: true, message: '头像已上传，等待管理员审核' });
    });
});
// POST /api/profile/awards — 添加获奖记录
router.post('/awards', authMiddleware, (req, res) => {
    const { competition_id, award_level, award_date, proof_image_url } = req.body;
    if (!competition_id || !award_level || !award_date) {
        res.status(400).json({ error: '缺少必填字段' });
        return;
    }
    const award = profileService.addAward(req.user.userId, { competition_id, award_level, award_date, proof_image_url });
    res.status(201).json(award);
});
// DELETE /api/profile/awards/:awardId — 删除获奖记录
router.delete('/awards/:awardId', authMiddleware, (req, res) => {
    const awardId = parseInt(req.params.awardId);
    if (isNaN(awardId)) {
        res.status(400).json({ error: '无效的获奖记录ID' });
        return;
    }
    try {
        const deleted = profileService.deleteAward(awardId, req.user.userId);
        if (!deleted) {
            res.status(404).json({ error: '获奖记录不存在' });
            return;
        }
        res.json({ message: '删除成功' });
    }
    catch (err) {
        if (err.message === 'FORBIDDEN') {
            res.status(403).json({ error: '无权删除此获奖记录' });
            return;
        }
        throw err;
    }
});
// GET /api/profile/skills — 获取当前用户技能标签 (MUST be before /:userId)
router.get('/skills', authMiddleware, (req, res) => {
    const skills = profileService.getSkills(req.user.userId);
    res.json({ skills });
});
// POST /api/profile/skills — 添加技能标签
router.post('/skills', authMiddleware, (req, res) => {
    const { skill } = req.body;
    if (!skill || !skill.trim()) {
        res.status(400).json({ error: '技能名称不能为空' });
        return;
    }
    profileService.addSkill(req.user.userId, skill.trim());
    res.status(201).json({ message: '添加成功' });
});
// DELETE /api/profile/skills/:skill — 删除技能标签
router.delete('/skills/:skill', authMiddleware, (req, res) => {
    const skill = decodeURIComponent(req.params.skill);
    const deleted = profileService.deleteSkill(req.user.userId, skill);
    if (!deleted) {
        res.status(404).json({ error: '技能不存在' });
        return;
    }
    res.json({ message: '删除成功' });
});
// POST /api/profile/upload-proof — 上传证明材料图片
router.post('/upload-proof', authMiddleware, (req, res) => {
    proofUpload.single('proof')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                res.status(400).json({ error: '文件大小不能超过 5MB' });
                return;
            }
            res.status(400).json({ error: err.message });
            return;
        }
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (!req.file) {
            res.status(400).json({ error: '请上传图片文件' });
            return;
        }
        const fileUrl = `/uploads/proofs/${req.file.filename}`;
        res.json({ url: fileUrl });
    });
});
// GET /api/profile/:userId — 获取指定用户公开资料 (MUST be last - catches all)
router.get('/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
        res.status(400).json({ error: '无效的用户ID' });
        return;
    }
    const profile = profileService.getProfile(userId);
    if (!profile) {
        res.status(404).json({ error: '用户不存在' });
        return;
    }
    // 记录访问（如果有登录用户且不是访问自己）
    const authHeader = req.headers.authorization;
    if (authHeader) {
        try {
            const { authService } = require('../services/authService');
            const parts = authHeader.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                const payload = authService.verifyToken(parts[1]);
                if (payload.userId !== userId) {
                    profileService.recordProfileView(userId, payload.userId);
                }
            }
        }
        catch { /* ignore token errors */ }
    }
    else {
        // 匿名访问也记录
        profileService.recordProfileView(userId, null);
    }
    res.json(profile);
});
// GET /api/profile/:userId/view-stats — 获取访问统计
router.get('/:userId/view-stats', authMiddleware, (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
        res.status(400).json({ error: '无效的用户ID' });
        return;
    }
    if (userId !== req.user.userId) {
        res.status(403).json({ error: '只能查看自己的访问统计' });
        return;
    }
    const stats = profileService.getProfileViewStats(userId);
    res.json(stats);
});
export default router;
