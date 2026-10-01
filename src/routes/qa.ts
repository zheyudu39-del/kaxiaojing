/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/qa.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { qaService } from '../services/qaService';

const router = Router();
// 获取问题列表
router.get('/questions', (req, res) => {
    const competitionId = req.query.competition_id ? parseInt(req.query.competition_id) : undefined;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const pageSize = req.query.page_size ? parseInt(req.query.page_size) : 20;
    const result = qaService.getQuestions(competitionId, page, pageSize);
    res.json(result);
});
// 搜索问题
router.get('/questions/search', (req, res) => {
    const keyword = req.query.q;
    const competitionId = req.query.competition_id ? parseInt(req.query.competition_id) : undefined;
    if (!keyword) {
        res.status(400).json({ error: '请输入搜索关键词' });
        return;
    }
    const questions = qaService.searchQuestions(keyword, competitionId);
    res.json({ questions });
});
// 获取热门标签
router.get('/tags/popular', (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const tags = qaService.getPopularTags(limit);
    res.json({ tags });
});
// 获取问题详情
router.get('/questions/:id', (req, res) => {
    const questionId = parseInt(req.params.id);
    const question = qaService.getQuestionById(questionId);
    if (!question) {
        res.status(404).json({ error: '问题不存在' });
        return;
    }
    res.json(question);
});
// 创建问题
router.post('/questions', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const { competition_id, title, content, tags } = req.body;
    if (!title || !content) {
        res.status(400).json({ error: '请填写标题和内容' });
        return;
    }
    const result = qaService.createQuestion(userId, {
        competitionId: competition_id,
        title,
        content,
        tags
    });
    res.json({ success: true, question_id: result.lastInsertRowid });
});
// 更新问题
router.patch('/questions/:id', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const questionId = parseInt(req.params.id);
    const { title, content, tags } = req.body;
    const result = qaService.updateQuestion(questionId, userId, { title, content, tags });
    if (!result) {
        res.status(403).json({ error: '无权限修改' });
        return;
    }
    res.json({ success: true });
});
// 删除问题
router.delete('/questions/:id', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const role = req.user?.role;
    const questionId = parseInt(req.params.id);
    const result = qaService.deleteQuestion(questionId, userId, role === 'admin');
    if (!result) {
        res.status(403).json({ error: '无权限删除' });
        return;
    }
    res.json({ success: true });
});
// 获取回答列表
router.get('/questions/:id/answers', (req, res) => {
    const questionId = parseInt(req.params.id);
    const answers = qaService.getAnswers(questionId);
    res.json({ answers });
});
// 创建回答
router.post('/questions/:id/answers', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const questionId = parseInt(req.params.id);
    const { content } = req.body;
    if (!content) {
        res.status(400).json({ error: '请填写回答内容' });
        return;
    }
    const result = qaService.createAnswer(userId, questionId, content);
    res.json({ success: true, answer_id: result.lastInsertRowid });
});
// 更新回答
router.patch('/answers/:id', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const answerId = parseInt(req.params.id);
    const { content } = req.body;
    if (!content) {
        res.status(400).json({ error: '请填写回答内容' });
        return;
    }
    const result = qaService.updateAnswer(answerId, userId, content);
    if (!result) {
        res.status(403).json({ error: '无权限修改' });
        return;
    }
    res.json({ success: true });
});
// 删除回答
router.delete('/answers/:id', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const role = req.user?.role;
    const answerId = parseInt(req.params.id);
    const result = qaService.deleteAnswer(answerId, userId, role === 'admin');
    if (!result) {
        res.status(403).json({ error: '无权限删除' });
        return;
    }
    res.json({ success: true });
});
// 采纳回答
router.post('/questions/:questionId/accept/:answerId', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const questionId = parseInt(req.params.questionId);
    const answerId = parseInt(req.params.answerId);
    const result = qaService.acceptAnswer(questionId, answerId, userId);
    if (!result) {
        res.status(403).json({ error: '无权限采纳' });
        return;
    }
    res.json({ success: true });
});
// 投票
router.post('/vote', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const { target_type, target_id, vote_type } = req.body;
    if (!['question', 'answer'].includes(target_type)) {
        res.status(400).json({ error: '无效的目标类型' });
        return;
    }
    if (![1, -1].includes(vote_type)) {
        res.status(400).json({ error: '无效的投票类型' });
        return;
    }
    const result = qaService.vote(userId, target_type, target_id, vote_type);
    res.json(result);
});
// 获取用户投票状态
router.post('/votes/status', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const { target_type, target_ids } = req.body;
    if (!['question', 'answer'].includes(target_type)) {
        res.status(400).json({ error: '无效的目标类型' });
        return;
    }
    const votes = qaService.getUserVotes(userId, target_type, target_ids || []);
    res.json({ votes });
});
export default router;
