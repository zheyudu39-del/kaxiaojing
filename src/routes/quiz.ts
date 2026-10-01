/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/quiz.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { quizService } from '../services/quizService';

const router = Router();
// 获取题库列表
router.get('/', (req, res) => {
    const competitionId = req.query.competition_id ? parseInt(req.query.competition_id) : undefined;
    const quizzes = quizService.getQuizzes(competitionId);
    res.json({ quizzes });
});
// 获取我的答题记录（必须在 /:id 之前）
router.get('/my/attempts', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const quizId = req.query.quiz_id ? parseInt(req.query.quiz_id) : undefined;
    const attempts = quizService.getUserAttempts(userId, quizId);
    res.json({ attempts });
});
// 获取题库详情
router.get('/:id', (req, res) => {
    const quizId = parseInt(req.params.id);
    const quiz = quizService.getQuizById(quizId);
    if (!quiz) {
        res.status(404).json({ error: '题库不存在' });
        return;
    }
    res.json(quiz);
});
// 获取题目列表（不含答案）
router.get('/:id/questions', authMiddleware, (req, res) => {
    const quizId = parseInt(req.params.id);
    const questions = quizService.getQuestions(quizId);
    res.json({ questions });
});
// 提交答题
router.post('/:id/submit', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const quizId = parseInt(req.params.id);
    const { answers, timeSpent } = req.body;
    if (!answers || typeof answers !== 'object') {
        res.status(400).json({ error: '请提交答案' });
        return;
    }
    const correctAnswers = quizService.getQuestionAnswers(quizId);
    if (correctAnswers.length === 0) {
        res.status(404).json({ error: '题库不存在或没有题目' });
        return;
    }
    let score = 0;
    let totalPoints = 0;
    const results = [];
    for (const q of correctAnswers) {
        const userAnswer = answers[q.id] || answers[String(q.id)] || null;
        let isCorrect = false;
        if (userAnswer !== null) {
            try {
                const correctParsed = JSON.parse(q.correct_answer);
                if (Array.isArray(correctParsed)) {
                    const userArr = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
                    isCorrect = correctParsed.length === userArr.length && correctParsed.every((a) => userArr.includes(a));
                }
                else {
                    isCorrect = userAnswer === q.correct_answer;
                }
            }
            catch {
                isCorrect = userAnswer === q.correct_answer;
            }
        }
        const points = isCorrect ? (q.points || 1) : 0;
        score += points;
        totalPoints += q.points || 1;
        results.push({
            questionId: q.id,
            userAnswer: userAnswer || '',
            correctAnswer: q.correct_answer,
            isCorrect,
            explanation: q.explanation
        });
    }
    quizService.submitAttempt(userId, quizId, answers, score, totalPoints, timeSpent != null ? timeSpent : null);
    res.json({
        score,
        totalPoints,
        percentage: Math.round((score / totalPoints) * 100),
        results
    });
});
// 获取排行榜
router.get('/:id/leaderboard', (req, res) => {
    const quizId = parseInt(req.params.id);
    const leaderboard = quizService.getLeaderboard(quizId);
    res.json({ leaderboard });
});
// 创建题库
router.post('/', authMiddleware, (req, res) => {
    const user = req.user;
    if (user.role !== 'admin' && user.role !== 'teacher') {
        res.status(403).json({ error: '无权限' });
        return;
    }
    const { competition_id, title, description, time_limit } = req.body;
    if (!title) {
        res.status(400).json({ error: '请输入题库标题' });
        return;
    }
    const result = quizService.createQuiz(competition_id || null, title, description || '', time_limit || 0, user.userId);
    res.json({ success: true, quiz_id: result.lastInsertRowid });
});
// 添加题目
router.post('/:id/questions', authMiddleware, (req, res) => {
    const user = req.user;
    if (user.role !== 'admin' && user.role !== 'teacher') {
        res.status(403).json({ error: '无权限' });
        return;
    }
    const quizId = parseInt(req.params.id);
    const { question_type, question_text, options, correct_answer, explanation, points, sort_order } = req.body;
    if (!question_text || !correct_answer) {
        res.status(400).json({ error: '请填写完整题目信息' });
        return;
    }
    const result = quizService.addQuestion(quizId, {
        questionType: question_type || 'single',
        questionText: question_text,
        options: options || [],
        correctAnswer: correct_answer,
        explanation: explanation || '',
        points: points || 1,
        sortOrder: sort_order || 0
    });
    res.json({ success: true, question_id: result.lastInsertRowid });
});
export default router;
