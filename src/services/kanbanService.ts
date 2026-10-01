/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/kanbanService.ts

import { getDb } from '../db/database';

// 6. 队伍协作看板服务
export const kanbanService = {
    // 创建任务
    createTask(teamId, userId, data) {
        const db = getDb();
        return db.prepare(`
      INSERT INTO team_tasks (team_id, creator_id, title, description, assignee_id, due_date, priority)
      VALUES (@teamId, @userId, @title, @description, @assigneeId, @dueDate, @priority)
    `).run({
            teamId,
            userId,
            title: data.title,
            description: data.description || null,
            assigneeId: data.assigneeId || null,
            dueDate: data.dueDate || null,
            priority: data.priority || 'medium'
        });
    },
    // 获取队伍任务列表
    getTeamTasks(teamId) {
        const db = getDb();
        return db.prepare(`
      SELECT tt.*, 
        u1.username as creator_name,
        u2.username as assignee_name
      FROM team_tasks tt
      LEFT JOIN users u1 ON tt.creator_id = u1.id
      LEFT JOIN users u2 ON tt.assignee_id = u2.id
      WHERE tt.team_id = @teamId
      ORDER BY 
        CASE tt.status WHEN 'todo' THEN 1 WHEN 'in_progress' THEN 2 WHEN 'done' THEN 3 END,
        CASE tt.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END,
        tt.created_at DESC
    `).all({ teamId });
    },
    // 更新任务状态
    updateTaskStatus(taskId, status) {
        const db = getDb();
        return db.prepare(`
      UPDATE team_tasks SET status = @status, updated_at = datetime('now') WHERE id = @taskId
    `).run({ taskId, status });
    },
    // 更新任务
    updateTask(taskId, data) {
        const db = getDb();
        const updates = [];
        const params = { taskId };
        if (data.title !== undefined) {
            updates.push('title = @title');
            params.title = data.title;
        }
        if (data.description !== undefined) {
            updates.push('description = @description');
            params.description = data.description;
        }
        if (data.assigneeId !== undefined) {
            updates.push('assignee_id = @assigneeId');
            params.assigneeId = data.assigneeId;
        }
        if (data.dueDate !== undefined) {
            updates.push('due_date = @dueDate');
            params.dueDate = data.dueDate;
        }
        if (data.priority !== undefined) {
            updates.push('priority = @priority');
            params.priority = data.priority;
        }
        if (updates.length === 0)
            return { changes: 0 };
        updates.push("updated_at = datetime('now')");
        return db.prepare(`
      UPDATE team_tasks SET ${updates.join(', ')} WHERE id = @taskId
    `).run(params);
    },
    // 删除任务
    deleteTask(taskId) {
        const db = getDb();
        return db.prepare(`DELETE FROM team_tasks WHERE id = @taskId`).run({ taskId });
    },
    // 获取任务详情
    getTaskById(taskId) {
        const db = getDb();
        return db.prepare(`
      SELECT tt.*, 
        u1.username as creator_name,
        u2.username as assignee_name
      FROM team_tasks tt
      LEFT JOIN users u1 ON tt.creator_id = u1.id
      LEFT JOIN users u2 ON tt.assignee_id = u2.id
      WHERE tt.id = @taskId
    `).get({ taskId });
    },
    // 检查用户是否是队伍成员
    isTeamMember(teamId, userId) {
        const db = getDb();
        const row = db.prepare(`
      SELECT id FROM team_members WHERE team_id = @teamId AND user_id = @userId
    `).get({ teamId, userId });
        return !!row;
    },
    // 获取队伍任务统计
    getTeamTaskStats(teamId) {
        const db = getDb();
        const stats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) as todo,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done
      FROM team_tasks
      WHERE team_id = @teamId
    `).get({ teamId });
        return stats || { total: 0, todo: 0, in_progress: 0, done: 0 };
    }
};