/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/mentor.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { mentorService } from '../services/mentorService';

const router = Router();
// 获取导师列表
router.get('/', (req, res) => {
    const competitionId = req.query.competition_id ? parseInt(req.query.competition_id) : undefined;
    const skill = req.query.skill;
    const mentors = mentorService.getMentors({ competitionId, skill });
    res.json({ mentors });
});
// 获取我的导师信息（必须在 /:id 之前）
router.get('/my/info', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const info = mentorService.getUserMentorInfo(userId);
    res.json({ mentor: info });
});
// 获取收到的申请（导师端）
router.get('/my/requests', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const requests = mentorService.getMentorRequests(userId);
    res.json({ requests });
});
// 获取发出的申请（学员端）
router.get('/my/applications', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const applications = mentorService.getUserRequests(userId);
    res.json({ applications });
});
// 获取我的学员
router.get('/my/mentees', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const mentees = mentorService.getMyMentees(userId);
    res.json({ mentees });
});
// 获取我的导师
router.get('/my/mentors', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const mentors = mentorService.getMyMentors(userId);
    res.json({ mentors });
});
// 更新导师状态
router.patch('/my/status', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const { is_active } = req.body;
    mentorService.updateMentorStatus(userId, !!is_active);
    res.json({ success: true });
});
// 获取导师详情
router.get('/:id', (req, res) => {
    const mentorId = parseInt(req.params.id);
    const mentor = mentorService.getMentorById(mentorId);
    if (!mentor) {
        res.status(404).json({ error: '导师不存在' });
        return;
    }
    const reviews = mentorService.getMentorReviews(mentor.user_id);
    res.json({ mentor, reviews });
});
// 申请成为导师
router.post('/apply', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    if (mentorService.isMentor(userId)) {
        res.status(400).json({ error: '您已经是导师了' });
        return;
    }
    const { competition_ids, skills, introduction, achievements, available_time, max_mentees } = req.body;
    if (!introduction || !achievements) {
        res.status(400).json({ error: '请填写完整信息' });
        return;
    }
    const result = mentorService.applyMentor(userId, {
        competitionIds: competition_ids || [],
        skills: skills || [],
        introduction,
        achievements,
        availableTime: available_time || '',
        maxMentees: max_mentees || 5
    });
    res.json({ success: true, mentor_id: result.lastInsertRowid });
});
// 申请指导
router.post('/:id/request', authMiddleware, (req, res) => {
    const menteeId = req.user.userId;
    const mentorId = parseInt(req.params.id);
    const { message, competition_id } = req.body;
    const mentor = mentorService.getMentorById(mentorId);
    if (!mentor) {
        res.status(404).json({ error: '导师不存在' });
        return;
    }
    if (mentor.user_id === menteeId) {
        res.status(400).json({ error: '不能申请自己' });
        return;
    }
    try {
        mentorService.requestMentor(menteeId, mentor.user_id, message || '', competition_id);
        res.json({ success: true });
    }
    catch (e) {
        if (e.message?.includes('UNIQUE')) {
            res.status(400).json({ error: '您已经申请过该导师了' });
        }
        else {
            throw e;
        }
    }
});
// 处理申请
router.patch('/request/:id', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const requestId = parseInt(req.params.id);
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
        res.status(400).json({ error: '无效的状态' });
        return;
    }
    const result = mentorService.handleRequest(requestId, status, userId);
    if (!result) {
        res.status(403).json({ error: '无权限处理该申请' });
        return;
    }
    res.json({ success: true });
});
// 评价导师
router.post('/:id/review', authMiddleware, (req, res) => {
    const menteeId = req.user.userId;
    const mentorId = parseInt(req.params.id);
    const { rating, content } = req.body;
    if (!rating || rating < 1 || rating > 5) {
        res.status(400).json({ error: '请给1-5分的评分' });
        return;
    }
    const mentor = mentorService.getMentorById(mentorId);
    if (!mentor) {
        res.status(404).json({ error: '导师不存在' });
        return;
    }
    try {
        mentorService.reviewMentor(menteeId, mentor.user_id, rating, content || '');
        res.json({ success: true });
    }
    catch (e) {
        if (e.message?.includes('UNIQUE')) {
            res.status(400).json({ error: '您已经评价过该导师了' });
        }
        else {
            throw e;
        }
    }
});
export default router;
