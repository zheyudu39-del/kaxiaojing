/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/registrationService.ts

import { getDb } from '../db/database';

class RegistrationService {
    register(userId, competitionId, teamId) {
        const db = getDb();
        const existing = db.prepare('SELECT id, status FROM registrations WHERE user_id = @userId AND competition_id = @competitionId').get({ userId, competitionId });
        if (existing && existing.status === 'registered')
            throw new Error('ALREADY_REGISTERED');
        if (existing && existing.status === 'cancelled') {
            db.prepare("UPDATE registrations SET status = 'registered', team_id = @teamId WHERE id = @id").run({ id: existing.id, teamId: teamId || null });
            return existing.id;
        }
        const result = db.prepare('INSERT INTO registrations (user_id, competition_id, team_id) VALUES (@userId, @competitionId, @teamId)').run({ userId, competitionId, teamId: teamId || null });
        return result.lastInsertRowid;
    }
    cancel(userId, competitionId) {
        const db = getDb();
        const result = db.prepare("UPDATE registrations SET status = 'cancelled' WHERE user_id = @userId AND competition_id = @competitionId AND status = 'registered'").run({ userId, competitionId });
        if (result.changes === 0)
            throw new Error('NOT_FOUND');
    }
    getUserRegistrations(userId, page = 1, pageSize = 20) {
        const db = getDb();
        const offset = (page - 1) * pageSize;
        return db.prepare(`
      SELECT r.id, r.competition_id, c.name as competition_name, c.category, r.team_id, t.name as team_name, r.status, r.created_at
      FROM registrations r JOIN competitions c ON r.competition_id = c.id LEFT JOIN teams t ON r.team_id = t.id
      WHERE r.user_id = @userId ORDER BY r.created_at DESC
      LIMIT @pageSize OFFSET @offset
    `).all({ userId, pageSize, offset });
    }
    isRegistered(userId, competitionId) {
        const db = getDb();
        return !!db.prepare("SELECT id FROM registrations WHERE user_id = @userId AND competition_id = @competitionId AND status = 'registered'").get({ userId, competitionId });
    }
    getCompetitionRegistrations(competitionId) {
        const db = getDb();
        return db.prepare(`
      SELECT r.id, r.user_id, u.username, r.team_id, t.name as team_name, r.status, r.created_at
      FROM registrations r JOIN users u ON r.user_id = u.id LEFT JOIN teams t ON r.team_id = t.id
      WHERE r.competition_id = @competitionId AND r.status = 'registered' ORDER BY r.created_at DESC
    `).all({ competitionId });
    }
}
export const registrationService: RegistrationService = new RegistrationService();