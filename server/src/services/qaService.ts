/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/qaService.ts

import { getDb } from '../db/database';

// 竞赛问答社区服务
export const qaService = {
    // 获取问题列表
    getQuestions(competitionId, page = 1, pageSize = 20) {
        const db = getDb();
        const offset = (page - 1) * pageSize;
        let sql = `
      SELECT q.*, u.username, u.avatar_url,
        c.name as competition_name,
        (SELECT COUNT(*) FROM qa_answers WHERE question_id = q.id) as answer_count,
        (SELECT COUNT(*) FROM qa_votes WHERE target_type = 'question' AND target_id = q.id AND vote_type = 1) as upvotes
      FROM qa_questions q
      JOIN users u ON q.user_id = u.id
      LEFT JOIN competitions c ON q.competition_id = c.id
      WHERE q.deleted_at IS NULL
    `;
        const params = { limit: pageSize, offset };
        if (competitionId) {
            sql += ` AND q.competition_id = @competitionId`;
            params.competitionId = competitionId;
        }
        sql += ` ORDER BY q.is_pinned DESC, q.created_at DESC LIMIT @limit OFFSET @offset`;
        const questions = db.prepare(sql).all(params);
        // 获取总数
        let countSql = 'SELECT COUNT(*) as total FROM qa_questions WHERE deleted_at IS NULL';
        if (competitionId) {
            countSql += ' AND competition_id = @competitionId';
        }
        const total = db.prepare(countSql).get(competitionId ? { competitionId } : {});
        return { questions, total: total.total, page, pageSize };
    },
    // 获取问题详情
    getQuestionById(questionId) {
        const db = getDb();
        // 增加浏览量
        db.prepare('UPDATE qa_questions SET view_count = view_count + 1 WHERE id = @questionId').run({ questionId });
        return db.prepare(`
      SELECT q.*, u.username, u.avatar_url,
        c.name as competition_name,
        (SELECT COUNT(*) FROM qa_answers WHERE question_id = q.id) as answer_count,
        (SELECT COUNT(*) FROM qa_votes WHERE target_type = 'question' AND target_id = q.id AND vote_type = 1) as upvotes
      FROM qa_questions q
      JOIN users u ON q.user_id = u.id
      LEFT JOIN competitions c ON q.competition_id = c.id
      WHERE q.id = @questionId AND q.deleted_at IS NULL
    `).get({ questionId });
    },
    // 创建问题
    createQuestion(userId, data) {
        const db = getDb();
        return db.prepare(`
      INSERT INTO qa_questions (user_id, competition_id, title, content, tags)
      VALUES (@userId, @competitionId, @title, @content, @tags)
    `).run({
            userId,
            competitionId: data.competitionId || null,
            title: data.title,
            content: data.content,
            tags: JSON.stringify(data.tags || [])
        });
    },
    // 更新问题
    updateQuestion(questionId, userId, data) {
        const db = getDb();
        const question = db.prepare('SELECT user_id FROM qa_questions WHERE id = @questionId').get({ questionId });
        if (!question || question.user_id !== userId)
            return null;
        const updates = [];
        const params = { questionId };
        if (data.title) {
            updates.push('title = @title');
            params.title = data.title;
        }
        if (data.content) {
            updates.push('content = @content');
            params.content = data.content;
        }
        if (data.tags) {
            updates.push('tags = @tags');
            params.tags = JSON.stringify(data.tags);
        }
        if (updates.length === 0)
            return null;
        updates.push("updated_at = datetime('now')");
        return db.prepare(`UPDATE qa_questions SET ${updates.join(', ')} WHERE id = @questionId`).run(params);
    },
    // 删除问题
    deleteQuestion(questionId, userId, isAdmin = false) {
        const db = getDb();
        const question = db.prepare('SELECT user_id FROM qa_questions WHERE id = @questionId').get({ questionId });
        if (!question)
            return null;
        if (!isAdmin && question.user_id !== userId)
            return null;
        return db.prepare("UPDATE qa_questions SET deleted_at = datetime('now') WHERE id = @questionId").run({ questionId });
    },
    // 获取回答列表
    getAnswers(questionId) {
        const db = getDb();
        return db.prepare(`
      SELECT a.*, u.username, u.avatar_url,
        (SELECT COUNT(*) FROM qa_votes WHERE target_type = 'answer' AND target_id = a.id AND vote_type = 1) as upvotes,
        (SELECT COUNT(*) FROM qa_votes WHERE target_type = 'answer' AND target_id = a.id AND vote_type = -1) as downvotes
      FROM qa_answers a
      JOIN users u ON a.user_id = u.id
      WHERE a.question_id = @questionId AND a.deleted_at IS NULL
      ORDER BY a.is_accepted DESC, upvotes DESC, a.created_at ASC
    `).all({ questionId });
    },
    // 创建回答
    createAnswer(userId, questionId, content) {
        const db = getDb();
        return db.prepare(`
      INSERT INTO qa_answers (user_id, question_id, content)
      VALUES (@userId, @questionId, @content)
    `).run({ userId, questionId, content });
    },
    // 更新回答
    updateAnswer(answerId, userId, content) {
        const db = getDb();
        const answer = db.prepare('SELECT user_id FROM qa_answers WHERE id = @answerId').get({ answerId });
        if (!answer || answer.user_id !== userId)
            return null;
        return db.prepare("UPDATE qa_answers SET content = @content, updated_at = datetime('now') WHERE id = @answerId").run({ answerId, content });
    },
    // 删除回答
    deleteAnswer(answerId, userId, isAdmin = false) {
        const db = getDb();
        const answer = db.prepare('SELECT user_id FROM qa_answers WHERE id = @answerId').get({ answerId });
        if (!answer)
            return null;
        if (!isAdmin && answer.user_id !== userId)
            return null;
        return db.prepare("UPDATE qa_answers SET deleted_at = datetime('now') WHERE id = @answerId").run({ answerId });
    },
    // 采纳回答
    acceptAnswer(questionId, answerId, userId) {
        const db = getDb();
        const question = db.prepare('SELECT user_id FROM qa_questions WHERE id = @questionId').get({ questionId });
        if (!question || question.user_id !== userId)
            return null;
        // 取消之前的采纳
        db.prepare('UPDATE qa_answers SET is_accepted = 0 WHERE question_id = @questionId').run({ questionId });
        // 采纳新回答
        db.prepare('UPDATE qa_answers SET is_accepted = 1 WHERE id = @answerId').run({ answerId });
        // 标记问题已解决
        db.prepare('UPDATE qa_questions SET is_solved = 1 WHERE id = @questionId').run({ questionId });
        return { success: true };
    },
    // 投票
    vote(userId, targetType, targetId, voteType) {
        const db = getDb();
        // 检查是否已投票
        const existing = db.prepare(`
      SELECT id, vote_type FROM qa_votes 
      WHERE user_id = @userId AND target_type = @targetType AND target_id = @targetId
    `).get({ userId, targetType, targetId });
        if (existing) {
            if (existing.vote_type === voteType) {
                // 取消投票
                db.prepare('DELETE FROM qa_votes WHERE id = @id').run({ id: existing.id });
                return { action: 'removed' };
            }
            else {
                // 更改投票
                db.prepare('UPDATE qa_votes SET vote_type = @voteType WHERE id = @id').run({ id: existing.id, voteType });
                return { action: 'changed' };
            }
        }
        // 新投票
        db.prepare(`
      INSERT INTO qa_votes (user_id, target_type, target_id, vote_type)
      VALUES (@userId, @targetType, @targetId, @voteType)
    `).run({ userId, targetType, targetId, voteType });
        return { action: 'added' };
    },
    // 获取用户投票状态
    getUserVotes(userId, targetType, targetIds) {
        if (targetIds.length === 0)
            return {};
        const db = getDb();
        const placeholders = targetIds.map(() => '?').join(',');
        const votes = db.prepare(`
      SELECT target_id, vote_type FROM qa_votes
      WHERE user_id = ? AND target_type = ? AND target_id IN (${placeholders})
    `).all([userId, targetType, ...targetIds]);
        const result = {};
        for (const v of votes) {
            result[v.target_id] = v.vote_type;
        }
        return result;
    },
    // 搜索问题
    searchQuestions(keyword, competitionId) {
        const db = getDb();
        let sql = `
      SELECT q.*, u.username, u.avatar_url,
        c.name as competition_name,
        (SELECT COUNT(*) FROM qa_answers WHERE question_id = q.id) as answer_count
      FROM qa_questions q
      JOIN users u ON q.user_id = u.id
      LEFT JOIN competitions c ON q.competition_id = c.id
      WHERE q.deleted_at IS NULL
        AND (q.title LIKE '%' || @keyword || '%' OR q.content LIKE '%' || @keyword || '%')
    `;
        const params = { keyword };
        if (competitionId) {
            sql += ` AND q.competition_id = @competitionId`;
            params.competitionId = competitionId;
        }
        sql += ` ORDER BY q.created_at DESC LIMIT 50`;
        return db.prepare(sql).all(params);
    },
    // 获取热门标签
    getPopularTags(limit = 20) {
        const db = getDb();
        // 由于tags是JSON数组，需要特殊处理
        const questions = db.prepare(`
      SELECT tags FROM qa_questions WHERE deleted_at IS NULL AND tags IS NOT NULL
    `).all();
        const tagCount = {};
        for (const q of questions) {
            try {
                const tags = JSON.parse(q.tags);
                for (const tag of tags) {
                    tagCount[tag] = (tagCount[tag] || 0) + 1;
                }
            }
            catch { /* ignore */ }
        }
        return Object.entries(tagCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([tag, count]) => ({ tag, count }));
    }
};