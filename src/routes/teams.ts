/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/teams.ts

import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../db/database';
import { TeamError, teamService } from '../services/teamService';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AppError } from '../middleware/errorHandler';

const router = Router();
// --- Zod Schemas ---
const createTeamSchema = z.object({
    competitionId: z.number({ error: '缺少必填字段: competitionId' }),
    name: z.string({ error: '缺少必填字段: name' }).min(1, '缺少必填字段: name'),
    description: z.string().default(''),
});
const teamIdParamsSchema = z.object({
    teamId: z.string().regex(/^\d+$/, '无效的队伍ID').transform(Number),
});
const competitionIdParamsSchema = z.object({
    competitionId: z.string().regex(/^\d+$/, '无效的竞赛ID').transform(Number),
});
const joinRequestParamsSchema = z.object({
    teamId: z.string().regex(/^\d+$/, '无效的队伍ID').transform(Number),
    requestId: z.string().regex(/^\d+$/, '无效的请求ID').transform(Number),
});
const handleJoinRequestSchema = z.object({
    action: z.enum(['approve', 'reject'], {
        error: '无效的操作，必须为 approve 或 reject',
    }),
});
const memberParamsSchema = z.object({
    teamId: z.string().regex(/^\d+$/, '无效的队伍ID').transform(Number),
    userId: z.string().regex(/^\d+$/, '无效的用户ID').transform(Number),
});
const transferLeaderSchema = z.object({
    newLeaderId: z.number({ error: '缺少新队长ID' }),
});
const createInviteSchema = z.object({
    expires_hours: z.number().min(1).max(168).default(24), // 1小时到7天
    max_uses: z.number().min(1).max(100).optional(),
});
/**
 * Map TeamError to AppError for uniform error handling.
 */
function mapTeamError(err) {
    if (err instanceof TeamError) {
        const codeMap = {
            400: 'VALIDATION_ERROR',
            403: 'FORBIDDEN',
            404: 'NOT_FOUND',
            409: 'CONFLICT',
        };
        throw new AppError(err.statusCode, codeMap[err.statusCode] || 'INTERNAL_ERROR', err.message);
    }
    throw err;
}
// POST /api/teams - Create a team
router.post('/', authMiddleware, validate({ body: createTeamSchema }), (req, res, next) => {
    try {
        const { competitionId, name, description } = req.body;
        const team = teamService.create(competitionId, req.user.userId, name, description);
        res.status(201).json(team);
    }
    catch (err) {
        mapTeamError(err);
    }
});
// GET /api/teams/all - list all teams with competition info
router.get('/all', (_req, res) => {
    const db = getDb();
    const page = parseInt(_req.query.page) || 1;
    const pageSize = parseInt(_req.query.pageSize) || 20;
    const offset = (page - 1) * pageSize;
    const teams = db.prepare(`
    SELECT t.id, t.name, t.description, t.leader_id, t.created_at,
           c.name as competition_name, c.category as competition_category,
           (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count
    FROM teams t
    LEFT JOIN competitions c ON t.competition_id = c.id
    ORDER BY t.created_at DESC
    LIMIT @pageSize OFFSET @offset
  `).all({ pageSize, offset });
    res.json({ teams });
});
// GET /api/teams/my - Get current user's teams
router.get('/my', authMiddleware, (req, res, next) => {
    try {
        const teams = teamService.getUserTeams(req.user.userId);
        res.json({ teams });
    }
    catch (err) {
        mapTeamError(err);
    }
});
// GET /api/teams/competition/:competitionId - Get teams for a competition
router.get('/competition/:competitionId', validate({ params: competitionIdParamsSchema }), (req, res, next) => {
    try {
        const teams = teamService.getTeamsByCompetition(req.params.competitionId);
        res.json({ teams });
    }
    catch (err) {
        mapTeamError(err);
    }
});
// GET /api/teams/:teamId - Get team details
router.get('/:teamId', validate({ params: teamIdParamsSchema }), (req, res, next) => {
    try {
        const team = teamService.getTeamById(req.params.teamId);
        if (!team) {
            throw new AppError(404, 'NOT_FOUND', '队伍不存在');
        }
        res.json(team);
    }
    catch (err) {
        if (err instanceof AppError)
            throw err;
        mapTeamError(err);
    }
});
// POST /api/teams/:teamId/join-requests - Request to join a team
router.post('/:teamId/join-requests', authMiddleware, validate({ params: teamIdParamsSchema }), (req, res, next) => {
    try {
        const joinRequest = teamService.requestJoin(req.params.teamId, req.user.userId);
        res.status(201).json(joinRequest);
    }
    catch (err) {
        mapTeamError(err);
    }
});
// GET /api/teams/:teamId/join-requests - Get pending join requests (leader only)
router.get('/:teamId/join-requests', authMiddleware, validate({ params: teamIdParamsSchema }), (req, res, next) => {
    try {
        const teamId = req.params.teamId;
        const team = teamService.getTeamById(teamId);
        if (!team) {
            throw new AppError(404, 'NOT_FOUND', '队伍不存在');
        }
        if (team.leader_id !== req.user.userId) {
            throw new AppError(403, 'FORBIDDEN', '仅队长可执行此操作');
        }
        const requests = teamService.getJoinRequests(teamId);
        res.json({ requests });
    }
    catch (err) {
        if (err instanceof AppError)
            throw err;
        mapTeamError(err);
    }
});
// PUT /api/teams/:teamId/join-requests/:requestId - Handle join request (leader only)
router.put('/:teamId/join-requests/:requestId', authMiddleware, validate({ params: joinRequestParamsSchema, body: handleJoinRequestSchema }), (req, res, next) => {
    try {
        const teamId = req.params.teamId;
        const requestId = req.params.requestId;
        const team = teamService.getTeamById(teamId);
        if (!team) {
            throw new AppError(404, 'NOT_FOUND', '队伍不存在');
        }
        if (team.leader_id !== req.user.userId) {
            throw new AppError(403, 'FORBIDDEN', '仅队长可执行此操作');
        }
        const { action } = req.body;
        teamService.handleJoinRequest(requestId, action);
        res.json({ message: action === 'approve' ? '已批准加入请求' : '已拒绝加入请求' });
    }
    catch (err) {
        if (err instanceof AppError)
            throw err;
        mapTeamError(err);
    }
});
// GET /api/teams/:teamId/members - Get team members
router.get('/:teamId/members', validate({ params: teamIdParamsSchema }), (req, res, next) => {
    try {
        const teamId = req.params.teamId;
        const team = teamService.getTeamById(teamId);
        if (!team) {
            throw new AppError(404, 'NOT_FOUND', '队伍不存在');
        }
        const members = teamService.getTeamMembers(teamId);
        res.json({ members });
    }
    catch (err) {
        if (err instanceof AppError)
            throw err;
        mapTeamError(err);
    }
});
// DELETE /api/teams/:teamId/members/:userId - Remove a member (leader only)
router.delete('/:teamId/members/:userId', authMiddleware, validate({ params: memberParamsSchema }), (req, res, next) => {
    try {
        const teamId = req.params.teamId;
        const userId = req.params.userId;
        const team = teamService.getTeamById(teamId);
        if (!team) {
            throw new AppError(404, 'NOT_FOUND', '队伍不存在');
        }
        if (team.leader_id !== req.user.userId) {
            throw new AppError(403, 'FORBIDDEN', '仅队长可执行此操作');
        }
        teamService.removeMember(teamId, userId);
        res.json({ message: '成员已移除' });
    }
    catch (err) {
        if (err instanceof AppError)
            throw err;
        mapTeamError(err);
    }
});
// PUT /api/teams/:teamId/transfer-leader - Transfer leadership
router.put('/:teamId/transfer-leader', authMiddleware, validate({ params: teamIdParamsSchema, body: transferLeaderSchema }), (req, res, next) => {
    try {
        const teamId = req.params.teamId;
        const { newLeaderId } = req.body;
        teamService.transferLeader(teamId, req.user.userId, newLeaderId);
        res.json({ message: '队长已转让' });
    }
    catch (err) {
        mapTeamError(err);
    }
});
// DELETE /api/teams/:teamId/leave - Leave a team
router.delete('/:teamId/leave', authMiddleware, validate({ params: teamIdParamsSchema }), (req, res, next) => {
    try {
        const teamId = req.params.teamId;
        teamService.leave(teamId, req.user.userId);
        res.json({ message: '已退出队伍' });
    }
    catch (err) {
        mapTeamError(err);
    }
});
// DELETE /api/teams/:teamId - Dissolve a team (leader only)
router.delete('/:teamId', authMiddleware, validate({ params: teamIdParamsSchema }), (req, res, next) => {
    try {
        const teamId = req.params.teamId;
        teamService.dissolve(teamId, req.user.userId);
        res.json({ message: '队伍已解散' });
    }
    catch (err) {
        mapTeamError(err);
    }
});
// === 队伍邀请码功能 ===
// 生成随机邀请码
function generateInviteCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
// POST /api/teams/:teamId/invites - 创建邀请码
router.post('/:teamId/invites', authMiddleware, validate({ params: teamIdParamsSchema, body: createInviteSchema }), (req, res, next) => {
    try {
        const teamId = req.params.teamId;
        const team = teamService.getTeamById(teamId);
        if (!team)
            throw new AppError(404, 'NOT_FOUND', '队伍不存在');
        if (team.leader_id !== req.user.userId)
            throw new AppError(403, 'FORBIDDEN', '仅队长可创建邀请码');
        const db = getDb();
        const { expires_hours, max_uses } = req.body;
        const inviteCode = generateInviteCode();
        const expiresAt = new Date(Date.now() + (expires_hours || 24) * 60 * 60 * 1000).toISOString();
        db.prepare(`
      INSERT INTO team_invites (team_id, invite_code, created_by, expires_at, max_uses)
      VALUES (@teamId, @inviteCode, @createdBy, @expiresAt, @maxUses)
    `).run({ teamId, inviteCode, createdBy: req.user.userId, expiresAt, maxUses: max_uses || null });
        res.status(201).json({ invite_code: inviteCode, expires_at: expiresAt, max_uses: max_uses || null });
    }
    catch (err) {
        if (err instanceof AppError)
            throw err;
        mapTeamError(err);
    }
});
// GET /api/teams/:teamId/invites - 获取队伍的邀请码列表
router.get('/:teamId/invites', authMiddleware, validate({ params: teamIdParamsSchema }), (req, res, next) => {
    try {
        const teamId = req.params.teamId;
        const team = teamService.getTeamById(teamId);
        if (!team)
            throw new AppError(404, 'NOT_FOUND', '队伍不存在');
        if (team.leader_id !== req.user.userId)
            throw new AppError(403, 'FORBIDDEN', '仅队长可查看邀请码');
        const db = getDb();
        const invites = db.prepare(`
      SELECT id, invite_code, expires_at, max_uses, use_count, created_at
      FROM team_invites
      WHERE team_id = @teamId AND expires_at > datetime('now')
      ORDER BY created_at DESC
    `).all({ teamId });
        res.json({ invites });
    }
    catch (err) {
        if (err instanceof AppError)
            throw err;
        mapTeamError(err);
    }
});
// DELETE /api/teams/:teamId/invites/:inviteId - 删除邀请码
router.delete('/:teamId/invites/:inviteId', authMiddleware, (req, res, next) => {
    try {
        const teamId = parseInt(req.params.teamId);
        const inviteId = parseInt(req.params.inviteId);
        const team = teamService.getTeamById(teamId);
        if (!team)
            throw new AppError(404, 'NOT_FOUND', '队伍不存在');
        if (team.leader_id !== req.user.userId)
            throw new AppError(403, 'FORBIDDEN', '仅队长可删除邀请码');
        const db = getDb();
        const result = db.prepare('DELETE FROM team_invites WHERE id = @inviteId AND team_id = @teamId').run({ inviteId, teamId });
        if (result.changes === 0)
            throw new AppError(404, 'NOT_FOUND', '邀请码不存在');
        res.json({ message: '邀请码已删除' });
    }
    catch (err) {
        if (err instanceof AppError)
            throw err;
        mapTeamError(err);
    }
});
// POST /api/teams/join-by-code - 通过邀请码加入队伍
router.post('/join-by-code', authMiddleware, (req, res, next) => {
    try {
        const { invite_code } = req.body;
        if (!invite_code)
            throw new AppError(400, 'VALIDATION_ERROR', '请输入邀请码');
        const db = getDb();
        const invite = db.prepare(`
      SELECT ti.*, t.name as team_name, t.competition_id
      FROM team_invites ti
      JOIN teams t ON ti.team_id = t.id
      WHERE ti.invite_code = @inviteCode AND ti.expires_at > datetime('now')
    `).get({ inviteCode: invite_code.toUpperCase() });
        if (!invite)
            throw new AppError(404, 'NOT_FOUND', '邀请码无效或已过期');
        if (invite.max_uses && invite.use_count >= invite.max_uses) {
            throw new AppError(400, 'VALIDATION_ERROR', '邀请码使用次数已达上限');
        }
        const userId = req.user.userId;
        // 检查是否已是成员
        const existingMember = db.prepare('SELECT id FROM team_members WHERE team_id = @teamId AND user_id = @userId')
            .get({ teamId: invite.team_id, userId });
        if (existingMember)
            throw new AppError(409, 'CONFLICT', '您已是该队伍成员');
        // 加入队伍
        db.prepare('INSERT INTO team_members (team_id, user_id) VALUES (@teamId, @userId)')
            .run({ teamId: invite.team_id, userId });
        // 更新使用次数
        db.prepare('UPDATE team_invites SET use_count = use_count + 1 WHERE id = @id').run({ id: invite.id });
        res.json({ message: '加入成功', team_name: invite.team_name, team_id: invite.team_id });
    }
    catch (err) {
        if (err instanceof AppError)
            throw err;
        mapTeamError(err);
    }
});
export default router;
