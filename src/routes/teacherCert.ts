/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/teacherCert.ts

import { Router } from 'express';
import { teacherCertService } from '../services/teacherCertService';
import { authMiddleware } from '../middleware/auth';
import { proofUpload } from '../middleware/upload';

const router = Router();
// POST /api/teacher-cert/apply - 提交教师认证申请
router.post('/apply', authMiddleware, proofUpload.single('cert_image'), (req, res) => {
    try {
        const { realName, college } = req.body;
        if (!realName || !college) {
            res.status(400).json({ error: '请填写姓名和学院' });
            return;
        }
        if (!req.file) {
            res.status(400).json({ error: '请上传教师资格证照片' });
            return;
        }
        const certImageUrl = `/uploads/proofs/${req.file.filename}`;
        const cert = teacherCertService.submitApplication(req.user.userId, realName, college, certImageUrl);
        res.status(201).json(cert);
    }
    catch (err) {
        if (err.message.includes('待审核') || err.message.includes('已通过')) {
            res.status(409).json({ error: err.message });
        }
        else {
            res.status(400).json({ error: err.message || '申请失败' });
        }
    }
});
// GET /api/teacher-cert/status - 获取当前用户认证状态
router.get('/status', authMiddleware, (req, res) => {
    try {
        const cert = teacherCertService.getUserCertification(req.user.userId);
        res.json({ certification: cert });
    }
    catch {
        res.status(500).json({ error: '服务器内部错误' });
    }
});
export default router;
