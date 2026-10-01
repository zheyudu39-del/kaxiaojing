/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/notebook.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as notebookService from '../services/notebookService';

const router = Router();
let tablesReady = false;
function ensureTables(_req, _res, next) {
    if (!tablesReady) {
        notebookService.ensureNotebookTables();
        tablesReady = true;
    }
    next();
}
router.use(ensureTables);
// 获取笔记列表
router.get('/', authMiddleware, (req, res) => {
    try {
        const userId = req.user.userId;
        const competitionId = req.query.competition_id ? Number(req.query.competition_id) : undefined;
        const notes = notebookService.getUserNotes(userId, competitionId);
        res.json(notes);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 搜索笔记
router.get('/search', authMiddleware, (req, res) => {
    try {
        const userId = req.user.userId;
        const keyword = req.query.q || '';
        const notes = notebookService.searchNotes(userId, keyword);
        res.json(notes);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 笔记统计
router.get('/stats', authMiddleware, (req, res) => {
    try {
        const userId = req.user.userId;
        const stats = notebookService.getNoteStats(userId);
        res.json(stats);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 获取单条笔记
router.get('/:id', authMiddleware, (req, res) => {
    try {
        const userId = req.user.userId;
        const noteId = Number(req.params.id);
        const note = notebookService.getNoteById(noteId, userId);
        if (!note)
            return res.status(404).json({ error: '笔记不存在' });
        res.json(note);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 创建笔记
router.post('/', authMiddleware, (req, res) => {
    try {
        const userId = req.user.userId;
        const { title, content, competition_id, tags } = req.body;
        if (!title)
            return res.status(400).json({ error: '标题不能为空' });
        const note = notebookService.createNote(userId, { title, content: content || '', competition_id, tags });
        res.status(201).json(note);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 更新笔记
router.put('/:id', authMiddleware, (req, res) => {
    try {
        const userId = req.user.userId;
        const noteId = Number(req.params.id);
        const note = notebookService.updateNote(noteId, userId, req.body);
        if (!note)
            return res.status(404).json({ error: '笔记不存在' });
        res.json(note);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 删除笔记
router.delete('/:id', authMiddleware, (req, res) => {
    try {
        const userId = req.user.userId;
        const noteId = Number(req.params.id);
        const ok = notebookService.deleteNote(noteId, userId);
        if (!ok)
            return res.status(404).json({ error: '笔记不存在' });
        res.json({ message: '删除成功' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 置顶/取消置顶
router.post('/:id/pin', authMiddleware, (req, res) => {
    try {
        const userId = req.user.userId;
        const noteId = Number(req.params.id);
        const note = notebookService.togglePin(noteId, userId);
        if (!note)
            return res.status(404).json({ error: '笔记不存在' });
        res.json(note);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
export default router;
