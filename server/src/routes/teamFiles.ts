/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/teamFiles.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { teamFileService } from '../services/teamFileService';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();
// 配置文件上传
const uploadDir = path.join(__dirname, '..', '..', 'data', 'uploads', 'temp');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        // 允许常见文件类型
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/zip',
            'application/x-rar-compressed',
            'text/plain',
            'image/jpeg',
            'image/png',
            'image/gif'
        ];
        const allowedExts = new Set(['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.rar', '.txt', '.jpg', '.jpeg', '.png', '.gif']);
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(file.mimetype) && allowedExts.has(ext)) {
            cb(null, true);
        }
        else {
            cb(new Error('不支持的文件类型'));
        }
    }
});
function requireTeamMember(req, res, next) {
    const userId = req.user.userId;
    const teamId = parseInt(req.params.teamId);
    if (isNaN(teamId)) {
        res.status(400).json({ error: '无效的队伍ID' });
        return;
    }
    if (!teamFileService.isTeamMember(teamId, userId)) {
        res.status(403).json({ error: '您不是该队伍成员' });
        return;
    }
    next();
}
// 获取队伍文件列表
router.get('/team/:teamId', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const teamId = parseInt(req.params.teamId);
    const folderId = req.query.folder_id ? parseInt(req.query.folder_id) : undefined;
    if (!teamFileService.isTeamMember(teamId, userId)) {
        res.status(403).json({ error: '您不是该队伍成员' });
        return;
    }
    const files = teamFileService.getTeamFiles(teamId, folderId);
    const stats = teamFileService.getTeamStorageStats(teamId);
    res.json({ files, stats });
});
// 创建文件夹
router.post('/team/:teamId/folder', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const teamId = parseInt(req.params.teamId);
    const { name, parent_folder_id } = req.body;
    if (!teamFileService.isTeamMember(teamId, userId)) {
        res.status(403).json({ error: '您不是该队伍成员' });
        return;
    }
    if (!name) {
        res.status(400).json({ error: '请输入文件夹名称' });
        return;
    }
    const result = teamFileService.createFolder(teamId, userId, name, parent_folder_id);
    res.json({ success: true, folder_id: result.lastInsertRowid });
});
// 上传文件
router.post('/team/:teamId/upload', authMiddleware, requireTeamMember, upload.single('file'), (req, res) => {
    const userId = req.user.userId;
    const teamId = parseInt(req.params.teamId);
    const { folder_id, description } = req.body;
    if (!req.file) {
        res.status(400).json({ error: '请选择文件' });
        return;
    }
    const result = teamFileService.uploadFile(teamId, userId, req.file, folder_id ? parseInt(folder_id) : undefined, description);
    res.json({ success: true, file_id: result.lastInsertRowid });
});
// 下载文件
router.get('/file/:fileId/download', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const fileId = parseInt(req.params.fileId);
    const file = teamFileService.downloadFile(fileId);
    if (!file) {
        res.status(404).json({ error: '文件不存在' });
        return;
    }
    if (!teamFileService.isTeamMember(file.team_id, userId)) {
        res.status(403).json({ error: '您不是该队伍成员' });
        return;
    }
    if (file.is_folder) {
        res.status(400).json({ error: '不能下载文件夹' });
        return;
    }
    res.download(file.file_path, file.file_name);
});
// 获取文件详情
router.get('/file/:fileId', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const fileId = parseInt(req.params.fileId);
    const file = teamFileService.getFileById(fileId);
    if (!file) {
        res.status(404).json({ error: '文件不存在' });
        return;
    }
    if (!teamFileService.isTeamMember(file.team_id, userId)) {
        res.status(403).json({ error: '您不是该队伍成员' });
        return;
    }
    res.json(file);
});
// 删除文件/文件夹
router.delete('/file/:fileId', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const fileId = parseInt(req.params.fileId);
    const file = teamFileService.getFileById(fileId);
    if (!file) {
        res.status(404).json({ error: '文件不存在' });
        return;
    }
    if (!teamFileService.isTeamMember(file.team_id, userId)) {
        res.status(403).json({ error: '您不是该队伍成员' });
        return;
    }
    const result = teamFileService.deleteFile(fileId, userId);
    if (!result) {
        res.status(403).json({ error: '无权限删除' });
        return;
    }
    res.json({ success: true });
});
// 重命名文件/文件夹
router.patch('/file/:fileId/rename', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const fileId = parseInt(req.params.fileId);
    const { name } = req.body;
    if (!name) {
        res.status(400).json({ error: '请输入新名称' });
        return;
    }
    const file = teamFileService.getFileById(fileId);
    if (!file) {
        res.status(404).json({ error: '文件不存在' });
        return;
    }
    if (!teamFileService.isTeamMember(file.team_id, userId)) {
        res.status(403).json({ error: '您不是该队伍成员' });
        return;
    }
    const result = teamFileService.renameFile(fileId, name, userId);
    if (!result) {
        res.status(403).json({ error: '无权限重命名' });
        return;
    }
    res.json({ success: true });
});
// 移动文件
router.patch('/file/:fileId/move', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const fileId = parseInt(req.params.fileId);
    const { target_folder_id } = req.body;
    const file = teamFileService.getFileById(fileId);
    if (!file) {
        res.status(404).json({ error: '文件不存在' });
        return;
    }
    if (!teamFileService.isTeamMember(file.team_id, userId)) {
        res.status(403).json({ error: '您不是该队伍成员' });
        return;
    }
    const result = teamFileService.moveFile(fileId, target_folder_id || null, userId);
    if (!result) {
        res.status(400).json({ error: '移动失败' });
        return;
    }
    res.json({ success: true });
});
// 搜索文件
router.get('/team/:teamId/search', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const teamId = parseInt(req.params.teamId);
    const keyword = req.query.q;
    if (!teamFileService.isTeamMember(teamId, userId)) {
        res.status(403).json({ error: '您不是该队伍成员' });
        return;
    }
    if (!keyword) {
        res.status(400).json({ error: '请输入搜索关键词' });
        return;
    }
    const files = teamFileService.searchFiles(teamId, keyword);
    res.json({ files });
});
export default router;
