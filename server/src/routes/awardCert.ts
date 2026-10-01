/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/awardCert.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as awardCertService from '../services/awardCertService';

const router = Router();
let tablesReady = false;
function ensureTables(_req, _res, next) {
    if (!tablesReady) {
        awardCertService.ensureAwardCertTables();
        tablesReady = true;
    }
    next();
}
router.use(ensureTables);
// 获取我的证书列表
router.get('/', authMiddleware, (req, res) => {
    try {
        const userId = req.user.userId;
        const certs = awardCertService.getUserCerts(userId);
        res.json(certs);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 证书统计
router.get('/stats', authMiddleware, (req, res) => {
    try {
        const userId = req.user.userId;
        const stats = awardCertService.getCertStats(userId);
        res.json(stats);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 公开验证证书（不需要登录）
router.get('/verify/:certNumber', (req, res) => {
    try {
        const certNumber = req.params.certNumber;
        const cert = awardCertService.getCertByNumber(certNumber);
        if (!cert)
            return res.status(404).json({ error: '证书不存在或编号无效' });
        res.json({ valid: true, cert });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 获取证书渲染数据
router.get('/:id/render', authMiddleware, (req, res) => {
    try {
        const certId = Number(req.params.id);
        const data = awardCertService.getCertRenderData(certId);
        if (!data)
            return res.status(404).json({ error: '证书不存在' });
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 获取单个证书
router.get('/:id', authMiddleware, (req, res) => {
    try {
        const certId = Number(req.params.id);
        const cert = awardCertService.getCertById(certId);
        if (!cert)
            return res.status(404).json({ error: '证书不存在' });
        res.json(cert);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 手动生成证书
router.post('/', authMiddleware, (req, res) => {
    try {
        const userId = req.user.userId;
        const { competition_id, award_level, award_date, template, extra_info } = req.body;
        if (!competition_id || !award_level || !award_date) {
            return res.status(400).json({ error: '竞赛、奖项等级和获奖日期不能为空' });
        }
        const cert = awardCertService.generateCert(userId, { competition_id, award_level, award_date, template, extra_info });
        if (cert.error)
            return res.status(409).json(cert);
        res.status(201).json(cert);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 从获奖记录自动生成
router.post('/auto-generate', authMiddleware, (req, res) => {
    try {
        const userId = req.user.userId;
        const generated = awardCertService.generateFromAwards(userId);
        res.json({ generated_count: generated.length, certificates: generated });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 删除证书
router.delete('/:id', authMiddleware, (req, res) => {
    try {
        const userId = req.user.userId;
        const certId = Number(req.params.id);
        const ok = awardCertService.deleteCert(certId, userId);
        if (!ok)
            return res.status(404).json({ error: '证书不存在' });
        res.json({ message: '删除成功' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
export default router;
