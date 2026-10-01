/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/kanban.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { kanbanService } from '../services/kanbanService';

const router = Router();
// 获取队伍任务列表
router.get('/team/:teamId', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const teamId = parseInt(req.params.teamId);
    if (!kanbanService.isTeamMember(teamId, userId)) {
        res.status(403).json({ error: '您不是该队伍成员' });
        return;
    }
    const tasks = kanbanService.getTeamTasks(teamId);
    const stats = kanbanService.getTeamTaskStats(teamId);
    res.json({ tasks, stats });
});
// 创建任务
router.post('/team/:teamId', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const teamId = parseInt(req.params.teamId);
    const { title, description, assignee_id, due_date, priority } = req.body;
    if (!kanbanService.isTeamMember(teamId, userId)) {
        res.status(403).json({ error: '您不是该队伍成员' });
        return;
    }
    if (!title) {
        res.status(400).json({ error: '任务标题不能为空' });
        return;
    }
    const result = kanbanService.createTask(teamId, userId, {
        title,
        description,
        assigneeId: assignee_id,
        dueDate: due_date,
        priority
    });
    res.json({ success: true, task_id: result.lastInsertRowid });
});
// 更新任务状态
router.patch('/task/:taskId/status', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const taskId = parseInt(req.params.taskId);
    const { status } = req.body;
    const task = kanbanService.getTaskById(taskId);
    if (!task) {
        res.status(404).json({ error: '任务不存在' });
        return;
    }
    if (!kanbanService.isTeamMember(task.team_id, userId)) {
        res.status(403).json({ error: '您不是该队伍成员' });
        return;
    }
    if (!['todo', 'in_progress', 'done'].includes(status)) {
        res.status(400).json({ error: '无效的状态' });
        return;
    }
    kanbanService.updateTaskStatus(taskId, status);
    res.json({ success: true });
});
// 更新任务
router.patch('/task/:taskId', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const taskId = parseInt(req.params.taskId);
    const { title, description, assignee_id, due_date, priority } = req.body;
    const task = kanbanService.getTaskById(taskId);
    if (!task) {
        res.status(404).json({ error: '任务不存在' });
        return;
    }
    if (!kanbanService.isTeamMember(task.team_id, userId)) {
        res.status(403).json({ error: '您不是该队伍成员' });
        return;
    }
    kanbanService.updateTask(taskId, {
        title,
        description,
        assigneeId: assignee_id,
        dueDate: due_date,
        priority
    });
    res.json({ success: true });
});
// 删除任务
router.delete('/task/:taskId', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const taskId = parseInt(req.params.taskId);
    const task = kanbanService.getTaskById(taskId);
    if (!task) {
        res.status(404).json({ error: '任务不存在' });
        return;
    }
    if (!kanbanService.isTeamMember(task.team_id, userId)) {
        res.status(403).json({ error: '您不是该队伍成员' });
        return;
    }
    kanbanService.deleteTask(taskId);
    res.json({ success: true });
});
export default router;
