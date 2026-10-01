/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/quizService.ts

import { getDb } from '../db/database';

// 竞赛模拟练习服务
export const quizService = {
    // 获取竞赛题库列表
    getQuizzes(competitionId) {
        const db = getDb();
        if (competitionId) {
            return db.prepare(`
        SELECT q.*, c.name as competition_name,
          (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as question_count
        FROM quizzes q
        LEFT JOIN competitions c ON q.competition_id = c.id
        WHERE q.competition_id = @competitionId
        ORDER BY q.created_at DESC
      `).all({ competitionId });
        }
        return db.prepare(`
      SELECT q.*, c.name as competition_name,
        (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as question_count
      FROM quizzes q
      LEFT JOIN competitions c ON q.competition_id = c.id
      ORDER BY q.created_at DESC
    `).all();
    },
    // 获取题目详情
    getQuizById(quizId) {
        const db = getDb();
        return db.prepare(`
      SELECT q.*, c.name as competition_name
      FROM quizzes q
      LEFT JOIN competitions c ON q.competition_id = c.id
      WHERE q.id = @quizId
    `).get({ quizId });
    },
    // 获取题目列表
    getQuestions(quizId) {
        const db = getDb();
        return db.prepare(`
      SELECT id, quiz_id, question_type, question_text, options, points, sort_order
      FROM quiz_questions
      WHERE quiz_id = @quizId
      ORDER BY sort_order
    `).all({ quizId });
    },
    // 获取题目答案（用于评分）
    getQuestionAnswers(quizId) {
        const db = getDb();
        return db.prepare(`
      SELECT id, correct_answer, explanation, points
      FROM quiz_questions
      WHERE quiz_id = @quizId
    `).all({ quizId });
    },
    // 提交答题记录
    submitAttempt(userId, quizId, answers, score, totalPoints, timeSpent) {
        const db = getDb();
        return db.prepare(`
      INSERT INTO quiz_attempts (user_id, quiz_id, answers, score, total_points, time_spent)
      VALUES (@userId, @quizId, @answers, @score, @totalPoints, @timeSpent)
    `).run({ userId, quizId, answers: JSON.stringify(answers), score, totalPoints, timeSpent });
    },
    // 获取用户答题记录
    getUserAttempts(userId, quizId) {
        const db = getDb();
        if (quizId) {
            return db.prepare(`
        SELECT a.*, q.title as quiz_title
        FROM quiz_attempts a
        JOIN quizzes q ON a.quiz_id = q.id
        WHERE a.user_id = @userId AND a.quiz_id = @quizId
        ORDER BY a.created_at DESC
      `).all({ userId, quizId });
        }
        return db.prepare(`
      SELECT a.*, q.title as quiz_title, c.name as competition_name
      FROM quiz_attempts a
      JOIN quizzes q ON a.quiz_id = q.id
      LEFT JOIN competitions c ON q.competition_id = c.id
      WHERE a.user_id = @userId
      ORDER BY a.created_at DESC
    `).all({ userId });
    },
    // 创建题库（管理员）
    createQuiz(competitionId, title, description, timeLimit, creatorId) {
        const db = getDb();
        return db.prepare(`
      INSERT INTO quizzes (competition_id, title, description, time_limit, creator_id)
      VALUES (@competitionId, @title, @description, @timeLimit, @creatorId)
    `).run({ competitionId, title, description, timeLimit, creatorId });
    },
    // 添加题目
    addQuestion(quizId, data) {
        const db = getDb();
        return db.prepare(`
      INSERT INTO quiz_questions (quiz_id, question_type, question_text, options, correct_answer, explanation, points, sort_order)
      VALUES (@quizId, @questionType, @questionText, @options, @correctAnswer, @explanation, @points, @sortOrder)
    `).run({
            quizId,
            questionType: data.questionType,
            questionText: data.questionText,
            options: JSON.stringify(data.options),
            correctAnswer: data.correctAnswer,
            explanation: data.explanation,
            points: data.points,
            sortOrder: data.sortOrder
        });
    },
    // 获取排行榜
    getLeaderboard(quizId, limit = 20) {
        const db = getDb();
        return db.prepare(`
      SELECT a.user_id, u.username, u.avatar_url,
        MAX(a.score) as best_score,
        MIN(a.time_spent) as best_time,
        COUNT(*) as attempt_count
      FROM quiz_attempts a
      JOIN users u ON a.user_id = u.id
      WHERE a.quiz_id = @quizId
      GROUP BY a.user_id
      ORDER BY best_score DESC, best_time ASC
      LIMIT @limit
    `).all({ quizId, limit });
    }
};