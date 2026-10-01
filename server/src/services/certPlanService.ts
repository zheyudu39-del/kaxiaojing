/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/certPlanService.ts

import { getDb } from '../db/database';

class CertPlanService {
    addPlan(userId, certificateId, targetDate, notes, proofImageUrl) {
        const db = getDb();
        const existing = db.prepare('SELECT id FROM cert_study_plans WHERE user_id = @userId AND certificate_id = @certificateId').get({ userId, certificateId });
        if (existing)
            throw new Error('ALREADY_EXISTS');
        const result = db.prepare('INSERT INTO cert_study_plans (user_id, certificate_id, target_date, notes, review_status, proof_image_url) VALUES (@userId, @certificateId, @targetDate, @notes, @reviewStatus, @proofImageUrl)').run({ userId, certificateId, targetDate: targetDate || null, notes: notes || '', reviewStatus: 'pending', proofImageUrl: proofImageUrl || null });
        return result.lastInsertRowid;
    }
    updatePlan(userId, certificateId, data) {
        const db = getDb();
        const fields = [];
        const params = { userId, certificateId };
        if (data.status) {
            fields.push('status = @status');
            params.status = data.status;
        }
        if (data.target_date !== undefined) {
            fields.push('target_date = @targetDate');
            params.targetDate = data.target_date;
        }
        if (data.notes !== undefined) {
            fields.push('notes = @notes');
            params.notes = data.notes;
        }
        if (fields.length === 0)
            return;
        db.prepare(`UPDATE cert_study_plans SET ${fields.join(', ')} WHERE user_id = @userId AND certificate_id = @certificateId`).run(params);
    }
    deletePlan(userId, certificateId) {
        const db = getDb();
        db.prepare('DELETE FROM cert_study_plans WHERE user_id = @userId AND certificate_id = @certificateId').run({ userId, certificateId });
    }
    getUserPlans(userId) {
        const db = getDb();
        return db.prepare(`
      SELECT p.*, c.name as cert_name, c.category, c.exam_time, c.difficulty
      FROM cert_study_plans p JOIN certificates c ON p.certificate_id = c.id
      WHERE p.user_id = @userId ORDER BY p.created_at DESC
    `).all({ userId });
    }
    checkin(userId, certificateId, note) {
        const db = getDb();
        // Check if already checked in today
        const today = new Date().toISOString().split('T')[0];
        const existing = db.prepare("SELECT id FROM cert_checkins WHERE user_id = @userId AND certificate_id = @certificateId AND date(created_at) = @today").get({ userId, certificateId, today });
        if (existing)
            throw new Error('ALREADY_CHECKIN');
        db.prepare('INSERT INTO cert_checkins (user_id, certificate_id, note) VALUES (@userId, @certificateId, @note)')
            .run({ userId, certificateId, note: note || '' });
        return true;
    }
    getCheckins(userId, certificateId) {
        const db = getDb();
        return db.prepare('SELECT * FROM cert_checkins WHERE user_id = @userId AND certificate_id = @certificateId ORDER BY created_at DESC LIMIT 30').all({ userId, certificateId });
    }
    getCheckinStreak(userId, certificateId) {
        const db = getDb();
        const checkins = db.prepare("SELECT DISTINCT date(created_at) as day FROM cert_checkins WHERE user_id = @userId AND certificate_id = @certificateId ORDER BY day DESC").all({ userId, certificateId });
        if (checkins.length === 0)
            return 0;
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < checkins.length; i++) {
            const expected = new Date(today);
            expected.setDate(expected.getDate() - i);
            const expectedStr = expected.toISOString().split('T')[0];
            if (checkins[i].day === expectedStr)
                streak++;
            else
                break;
        }
        return streak;
    }
}
export const certPlanService: CertPlanService = new CertPlanService();