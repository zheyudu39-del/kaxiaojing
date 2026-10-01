/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/teamService.ts

import { getDb } from '../db/database';
import { notificationService } from './notificationService';

// ===== 类型定义（自 .d.ts 还原）=====
export interface Team {
    id: number;
    competition_id: number;
    leader_id: number;
    name: string;
    description: string;
    created_at: string;
}
export interface TeamSummary {
    id: number;
    name: string;
    description: string;
    leader_id: number;
    created_at: string;
    member_count: number;
}
export interface JoinRequest {
    id: number;
    team_id: number;
    user_id: number;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

export class TeamError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message);
        this.name = 'TeamError';
        this.statusCode = statusCode;
    }
}
export class TeamService {
    create(competitionId: number, leaderId: number, name: string, description: string): Team {
        const db = getDb();
        // Check if user already has a team in this competition
        if (this.checkUserInCompetitionTeam(leaderId, competitionId)) {
            throw new TeamError('您已在该竞赛中拥有队伍', 409);
        }
        // 用事务包裹 teams + team_members 两表写入，保证原子性
        let teamId = 0;
        db.runInTransaction(() => {
            const result = db.prepare('INSERT INTO teams (competition_id, leader_id, name, description) VALUES (@competitionId, @leaderId, @name, @description)').run({ competitionId, leaderId, name, description });
            teamId = result.lastInsertRowid;
            db.prepare('INSERT INTO team_members (team_id, user_id) VALUES (@teamId, @userId)').run({ teamId, userId: leaderId });
        });
        return db.prepare('SELECT * FROM teams WHERE id = @id').get({ id: teamId });
    }
    requestJoin(teamId: number, userId: number): JoinRequest {
        const db = getDb();
        // Check team exists
        const team = db.prepare('SELECT * FROM teams WHERE id = @teamId').get({ teamId });
        if (!team) {
            throw new TeamError('队伍不存在', 404);
        }
        // Check if user is already a member
        const existingMember = db.prepare('SELECT id FROM team_members WHERE team_id = @teamId AND user_id = @userId').get({ teamId, userId });
        if (existingMember) {
            throw new TeamError('您已是该队伍成员', 409);
        }
        // Check if user already has a pending request
        const existingRequest = db.prepare("SELECT id FROM join_requests WHERE team_id = @teamId AND user_id = @userId AND status = 'pending'").get({ teamId, userId });
        if (existingRequest) {
            throw new TeamError('您已提交过加入申请', 409);
        }
        const result = db.prepare('INSERT INTO join_requests (team_id, user_id, status) VALUES (@teamId, @userId, @status)').run({ teamId, userId, status: 'pending' });
        // 发送通知给队长
        const applicant = db.prepare('SELECT username FROM users WHERE id = @id').get({ id: userId });
        notificationService.createNotification(team.leader_id, 'join_request', '新的入队申请', `用户 ${applicant?.username || userId} 申请加入队伍「${team.name}」`, result.lastInsertRowid);
        return db.prepare('SELECT * FROM join_requests WHERE id = @id').get({ id: result.lastInsertRowid });
    }
    handleJoinRequest(requestId: number, action: 'approve' | 'reject'): void {
        const db = getDb();
        const request = db.prepare('SELECT * FROM join_requests WHERE id = @requestId').get({ requestId });
        if (!request) {
            throw new TeamError('加入请求不存在', 404);
        }
        if (request.status !== 'pending') {
            throw new TeamError('该请求已被处理', 409);
        }
        const newStatus = action === 'approve' ? 'approved' : 'rejected';
        db.prepare('UPDATE join_requests SET status = @status WHERE id = @requestId').run({ status: newStatus, requestId });
        // If approved, add user as team member
        if (action === 'approve') {
            db.prepare('INSERT INTO team_members (team_id, user_id) VALUES (@teamId, @userId)').run({ teamId: request.team_id, userId: request.user_id });
        }
        // 发送通知给申请者
        const team = db.prepare('SELECT name FROM teams WHERE id = @id').get({ id: request.team_id });
        const resultText = action === 'approve' ? '通过' : '拒绝';
        notificationService.createNotification(request.user_id, 'join_result', `入队申请${resultText}`, `您申请加入队伍「${team?.name || ''}」已被${resultText}`, requestId);
    }
    removeMember(teamId: number, userId: number): void {
        const db = getDb();
        const team = db.prepare('SELECT * FROM teams WHERE id = @teamId').get({ teamId });
        if (!team) {
            throw new TeamError('队伍不存在', 404);
        }
        // Cannot remove the leader
        if (team.leader_id === userId) {
            throw new TeamError('队长不能被移除，请使用解散队伍功能', 400);
        }
        const result = db.prepare('DELETE FROM team_members WHERE team_id = @teamId AND user_id = @userId').run({ teamId, userId });
        if (result.changes === 0) {
            throw new TeamError('该用户不是队伍成员', 404);
        }
    }
    leave(teamId: number, userId: number): void {
        const db = getDb();
        const team = db.prepare('SELECT * FROM teams WHERE id = @teamId').get({ teamId });
        if (!team) {
            throw new TeamError('队伍不存在', 404);
        }
        // Leader cannot leave, must dissolve
        if (team.leader_id === userId) {
            throw new TeamError('队长不能退出队伍，请使用解散队伍功能', 400);
        }
        const result = db.prepare('DELETE FROM team_members WHERE team_id = @teamId AND user_id = @userId').run({ teamId, userId });
        if (result.changes === 0) {
            throw new TeamError('您不是该队伍成员', 404);
        }
    }
    transferLeader(teamId: number, currentLeaderId: number, newLeaderId: number): void {
        const db = getDb();
        const team = db.prepare('SELECT * FROM teams WHERE id = @teamId').get({ teamId });
        if (!team)
            throw new TeamError('队伍不存在', 404);
        if (team.leader_id !== currentLeaderId)
            throw new TeamError('仅队长可执行此操作', 403);
        if (currentLeaderId === newLeaderId)
            throw new TeamError('不能转让给自己', 400);
        const isMember = db.prepare('SELECT id FROM team_members WHERE team_id = @teamId AND user_id = @userId').get({ teamId, userId: newLeaderId });
        if (!isMember)
            throw new TeamError('目标用户不是队伍成员', 400);
        db.prepare('UPDATE teams SET leader_id = @newLeaderId WHERE id = @teamId').run({ newLeaderId, teamId });
        notificationService.createNotification(newLeaderId, 'team_update', '队长转让', `您已成为队伍「${team.name}」的新队长`, teamId);
    }
    dissolve(teamId: number, leaderId: number): void {
        const db = getDb();
        const team = db.prepare('SELECT * FROM teams WHERE id = @teamId').get({ teamId });
        if (!team) {
            throw new TeamError('队伍不存在', 404);
        }
        if (team.leader_id !== leaderId) {
            throw new TeamError('仅队长可执行此操作', 403);
        }
        // 用事务包裹级联删除，保证原子性
        db.runInTransaction(() => {
            // Cascade delete: messages, join_requests, team_members, then team
            db.prepare('DELETE FROM messages WHERE team_id = @teamId').run({ teamId });
            db.prepare('DELETE FROM join_requests WHERE team_id = @teamId').run({ teamId });
            db.prepare('DELETE FROM team_members WHERE team_id = @teamId').run({ teamId });
            db.prepare('DELETE FROM teams WHERE id = @teamId').run({ teamId });
        });
    }
    getTeamsByCompetition(competitionId: number, page: number = 1, pageSize: number = 20): TeamSummary[] {
        const db = getDb();
        const offset = (page - 1) * pageSize;
        return db.prepare(`
      SELECT t.id, t.name, t.description, t.leader_id, t.created_at,
             (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count
      FROM teams t
      WHERE t.competition_id = @competitionId
      ORDER BY t.created_at DESC
      LIMIT @pageSize OFFSET @offset
    `).all({ competitionId, pageSize, offset });
    }
    getUserTeams(userId: number, page: number = 1, pageSize: number = 20): Team[] {
        const db = getDb();
        const offset = (page - 1) * pageSize;
        return db.prepare(`
      SELECT t.* FROM teams t
      INNER JOIN team_members tm ON t.id = tm.team_id
      WHERE tm.user_id = @userId
      ORDER BY t.created_at DESC
      LIMIT @pageSize OFFSET @offset
    `).all({ userId, pageSize, offset });
    }
    checkUserInCompetitionTeam(userId: number, competitionId: number): boolean {
        const db = getDb();
        const result = db.prepare(`
      SELECT t.id FROM teams t
      INNER JOIN team_members tm ON t.id = tm.team_id
      WHERE tm.user_id = @userId AND t.competition_id = @competitionId
      LIMIT 1
    `).get({ userId, competitionId });
        return !!result;
    }
    getTeamById(teamId: number): Team | null {
        const db = getDb();
        const team = db.prepare('SELECT * FROM teams WHERE id = @teamId').get({ teamId });
        return team || null;
    }
    getJoinRequests(teamId: number): (JoinRequest & { username?: string; })[] {
        const db = getDb();
        return db.prepare(`SELECT jr.*, u.username FROM join_requests jr
       LEFT JOIN users u ON jr.user_id = u.id
       WHERE jr.team_id = @teamId AND jr.status = 'pending' ORDER BY jr.created_at ASC`).all({ teamId });
    }
    getTeamMembers(teamId: number): { id: number; username: string; joined_at: string; }[] {
        const db = getDb();
        return db.prepare(`
      SELECT u.id, u.username, tm.joined_at
      FROM team_members tm
      INNER JOIN users u ON tm.user_id = u.id
      WHERE tm.team_id = @teamId
      ORDER BY tm.joined_at ASC
    `).all({ teamId });
    }
}
export const teamService: TeamService = new TeamService();