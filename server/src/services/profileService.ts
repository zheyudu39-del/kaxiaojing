/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/profileService.ts

import { getDb } from '../db/database';

// ===== 类型定义（自 .d.ts 还原）=====
export interface ProfileData {
    id: number;
    username: string;
    email: string;
    college: string | null;
    major: string | null;
    bio: string | null;
    avatar_url: string | null;
    role: string;
    participation_history: {
        competition_name: string;
        team_name: string;
        joined_at: string;
    }[];
    awards: {
        id: number;
        competition_name: string;
        award_level: string;
        award_date: string;
    }[];
}
export interface UpdateProfileData {
    username?: string;
    college?: string;
    major?: string;
    bio?: string;
}
export interface AddAwardData {
    competition_id: number;
    award_level: string;
    award_date: string;
    proof_image_url?: string;
}

class ProfileService {
    getProfile(userId) {
        const db = getDb();
        const user = db.prepare('SELECT id, username, email, college, major, bio, avatar_url, role FROM users WHERE id = @id').get({ id: userId });
        if (!user)
            return null;
        const history = this.getParticipationHistory(userId);
        const awards = this.getAwards(userId);
        return { ...user, participation_history: history, awards };
    }
    updateProfile(userId, data) {
        const db = getDb();
        const user = db.prepare('SELECT id FROM users WHERE id = @id').get({ id: userId });
        if (!user)
            return null;
        const fields = [];
        const params = { id: userId };
        if (data.username !== undefined) {
            fields.push('username = @username');
            params.username = data.username;
        }
        if (data.college !== undefined) {
            fields.push('college = @college');
            params.college = data.college;
        }
        if (data.major !== undefined) {
            fields.push('major = @major');
            params.major = data.major;
        }
        if (data.bio !== undefined) {
            fields.push('bio = @bio');
            params.bio = data.bio;
        }
        if (fields.length > 0) {
            db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = @id`).run(params);
        }
        return this.getProfile(userId);
    }
    updateAvatar(userId, avatarUrl) {
        const db = getDb();
        db.prepare('UPDATE users SET avatar_url = @avatar_url WHERE id = @id').run({ id: userId, avatar_url: avatarUrl });
    }
    setPendingAvatar(userId, avatarUrl) {
        const db = getDb();
        db.prepare("UPDATE users SET pending_avatar_url = @url, avatar_review_status = 'pending' WHERE id = @id").run({ url: avatarUrl, id: userId });
    }
    getParticipationHistory(userId) {
        const db = getDb();
        return db.prepare(`
      SELECT c.name as competition_name, t.name as team_name, tm.joined_at
      FROM team_members tm
      JOIN teams t ON tm.team_id = t.id
      JOIN competitions c ON t.competition_id = c.id
      WHERE tm.user_id = @userId
      ORDER BY tm.joined_at DESC
    `).all({ userId });
    }
    getAwards(userId) {
        const db = getDb();
        return db.prepare(`
      SELECT a.id, c.name as competition_name, a.award_level, a.award_date, a.review_status, a.review_comment
      FROM awards a
      JOIN competitions c ON a.competition_id = c.id
      WHERE a.user_id = @userId
      ORDER BY a.award_date DESC
    `).all({ userId });
    }
    addAward(userId, data) {
        const db = getDb();
        const result = db.prepare('INSERT INTO awards (user_id, competition_id, award_level, award_date, review_status, proof_image_url) VALUES (@userId, @competitionId, @awardLevel, @awardDate, @reviewStatus, @proofImageUrl)').run({ userId, competitionId: data.competition_id, awardLevel: data.award_level, awardDate: data.award_date, reviewStatus: 'pending', proofImageUrl: data.proof_image_url || null });
        const award = db.prepare(`
      SELECT a.id, c.name as competition_name, a.award_level, a.award_date
      FROM awards a JOIN competitions c ON a.competition_id = c.id
      WHERE a.id = @id
    `).get({ id: result.lastInsertRowid });
        return award;
    }
    deleteAward(awardId, userId) {
        const db = getDb();
        const award = db.prepare('SELECT id, user_id FROM awards WHERE id = @id').get({ id: awardId });
        if (!award)
            return false;
        if (award.user_id !== userId) {
            throw new Error('FORBIDDEN');
        }
        db.prepare('DELETE FROM awards WHERE id = @id').run({ id: awardId });
        return true;
    }
    getSkills(userId) {
        const db = getDb();
        const rows = db.prepare('SELECT skill FROM user_skills WHERE user_id = @userId').all({ userId });
        return rows.map(r => r.skill);
    }
    addSkill(userId, skill) {
        const db = getDb();
        db.prepare('INSERT OR IGNORE INTO user_skills (user_id, skill) VALUES (@userId, @skill)').run({ userId, skill });
    }
    deleteSkill(userId, skill) {
        const db = getDb();
        const result = db.prepare('DELETE FROM user_skills WHERE user_id = @userId AND skill = @skill').run({ userId, skill });
        return result.changes > 0;
    }
    // 访问记录功能
    recordProfileView(profileUserId, viewerUserId) {
        const db = getDb();
        db.prepare('INSERT INTO profile_views (profile_user_id, viewer_user_id) VALUES (@profileUserId, @viewerUserId)')
            .run({ profileUserId, viewerUserId });
    }
    getProfileViewStats(userId) {
        const db = getDb();
        const total = db.prepare('SELECT COUNT(*) as count FROM profile_views WHERE profile_user_id = @userId')
            .get({ userId });
        const today = db.prepare(`
      SELECT COUNT(*) as count FROM profile_views 
      WHERE profile_user_id = @userId AND date(viewed_at) = date('now')
    `).get({ userId });
        const week = db.prepare(`
      SELECT COUNT(*) as count FROM profile_views 
      WHERE profile_user_id = @userId AND viewed_at >= datetime('now', '-7 days')
    `).get({ userId });
        // 最近访客（去重，只显示登录用户）
        const recentVisitors = db.prepare(`
      SELECT DISTINCT pv.viewer_user_id, u.username, u.avatar_url, MAX(pv.viewed_at) as last_visit
      FROM profile_views pv
      JOIN users u ON pv.viewer_user_id = u.id
      WHERE pv.profile_user_id = @userId AND pv.viewer_user_id IS NOT NULL
      GROUP BY pv.viewer_user_id
      ORDER BY last_visit DESC
      LIMIT 20
    `).all({ userId });
        return {
            total_views: total.count,
            today_views: today.count,
            week_views: week.count,
            recent_visitors: recentVisitors
        };
    }
}
export const profileService: ProfileService = new ProfileService();