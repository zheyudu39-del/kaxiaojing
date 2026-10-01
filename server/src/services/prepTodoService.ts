/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/prepTodoService.ts

import { getDb } from '../db/database';

// ===== 类型定义（自 .d.ts 还原）=====
export interface PrepTodo {
    id: number;
    user_id: number;
    competition_id: number | null;
    certificate_id: number | null;
    title: string;
    description: string;
    due_date: string | null;
    priority: number;
    is_completed: number;
    completed_at: string | null;
    created_at: string;
}

class PrepTodoService {
    create(userId, data) {
        if (!data.title?.trim())
            throw new Error('TITLE_EMPTY');
        const db = getDb();
        const result = db.prepare(`
      INSERT INTO prep_todos (user_id, competition_id, certificate_id, title, description, due_date, priority)
      VALUES (@userId, @competitionId, @certificateId, @title, @description, @dueDate, @priority)
    `).run({
            userId,
            competitionId: data.competition_id || null,
            certificateId: data.certificate_id || null,
            title: data.title.trim(),
            description: data.description?.trim() || '',
            dueDate: data.due_date || null,
            priority: data.priority || 0
        });
        return this.getById(result.lastInsertRowid);
    }
    getById(id) {
        const db = getDb();
        return db.prepare('SELECT * FROM prep_todos WHERE id = @id').get({ id });
    }
    getUserTodos(userId, filters) {
        const db = getDb();
        let where = 'user_id = @userId';
        const params = { userId };
        if (filters.completed !== undefined) {
            where += ' AND is_completed = @completed';
            params.completed = filters.completed ? 1 : 0;
        }
        if (filters.competition_id) {
            where += ' AND competition_id = @competitionId';
            params.competitionId = filters.competition_id;
        }
        if (filters.certificate_id) {
            where += ' AND certificate_id = @certificateId';
            params.certificateId = filters.certificate_id;
        }
        return db.prepare(`
      SELECT t.*, c.name as competition_name, cert.name as certificate_name
      FROM prep_todos t
      LEFT JOIN competitions c ON t.competition_id = c.id
      LEFT JOIN certificates cert ON t.certificate_id = cert.id
      WHERE ${where}
      ORDER BY t.is_completed ASC, t.priority DESC, t.due_date ASC NULLS LAST, t.created_at DESC
    `).all(params);
    }
    update(id, userId, data) {
        const db = getDb();
        const todo = this.getById(id);
        if (!todo || todo.user_id !== userId)
            return null;
        const updates = [];
        const params = { id };
        if (data.title !== undefined) {
            if (!data.title.trim())
                throw new Error('TITLE_EMPTY');
            updates.push('title = @title');
            params.title = data.title.trim();
        }
        if (data.description !== undefined) {
            updates.push('description = @description');
            params.description = data.description;
        }
        if (data.due_date !== undefined) {
            updates.push('due_date = @dueDate');
            params.dueDate = data.due_date;
        }
        if (data.priority !== undefined) {
            updates.push('priority = @priority');
            params.priority = data.priority;
        }
        if (updates.length > 0) {
            db.prepare(`UPDATE prep_todos SET ${updates.join(', ')} WHERE id = @id`).run(params);
        }
        return this.getById(id);
    }
    toggleComplete(id, userId) {
        const db = getDb();
        const todo = this.getById(id);
        if (!todo || todo.user_id !== userId)
            return null;
        const newCompleted = todo.is_completed ? 0 : 1;
        const completedAt = newCompleted ? "datetime('now')" : 'NULL';
        db.prepare(`UPDATE prep_todos SET is_completed = @completed, completed_at = ${completedAt} WHERE id = @id`)
            .run({ id, completed: newCompleted });
        return this.getById(id);
    }
    delete(id, userId) {
        const db = getDb();
        const todo = this.getById(id);
        if (!todo || todo.user_id !== userId)
            return false;
        db.prepare('DELETE FROM prep_todos WHERE id = @id').run({ id });
        return true;
    }
    // 获取今日待办
    getTodayTodos(userId) {
        const db = getDb();
        return db.prepare(`
      SELECT t.*, c.name as competition_name, cert.name as certificate_name
      FROM prep_todos t
      LEFT JOIN competitions c ON t.competition_id = c.id
      LEFT JOIN certificates cert ON t.certificate_id = cert.id
      WHERE t.user_id = @userId AND t.is_completed = 0
        AND (t.due_date IS NULL OR date(t.due_date) <= date('now'))
      ORDER BY t.priority DESC, t.due_date ASC NULLS LAST
    `).all({ userId });
    }
    // 获取统计
    getStats(userId) {
        const db = getDb();
        const total = db.prepare('SELECT COUNT(*) as count FROM prep_todos WHERE user_id = @userId').get({ userId });
        const completed = db.prepare('SELECT COUNT(*) as count FROM prep_todos WHERE user_id = @userId AND is_completed = 1').get({ userId });
        const overdue = db.prepare(`
      SELECT COUNT(*) as count FROM prep_todos 
      WHERE user_id = @userId AND is_completed = 0 AND due_date IS NOT NULL AND date(due_date) < date('now')
    `).get({ userId });
        return {
            total: total.count,
            completed: completed.count,
            pending: total.count - completed.count,
            overdue: overdue.count
        };
    }
}
export const prepTodoService: PrepTodoService = new PrepTodoService();