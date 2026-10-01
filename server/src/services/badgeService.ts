/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/badgeService.ts

import { getDb } from '../db/database';

// 4. 成就徽章系统服务
export const badgeService = {
    // 徽章定义
    BADGES: [
        { id: 'first_award', name: '初露锋芒', description: '获得第一个竞赛奖项', icon: '🏆', condition: 'award_count >= 1' },
        { id: 'award_master', name: '竞赛达人', description: '获得5个竞赛奖项', icon: '🎖️', condition: 'award_count >= 5' },
        { id: 'award_legend', name: '竞赛传奇', description: '获得10个竞赛奖项', icon: '👑', condition: 'award_count >= 10' },
        { id: 'first_post', name: '初次分享', description: '发布第一篇经验帖', icon: '✍️', condition: 'post_count >= 1' },
        { id: 'active_sharer', name: '乐于分享', description: '发布10篇经验帖', icon: '📝', condition: 'post_count >= 10' },
        { id: 'helper', name: '热心助人', description: '回复50条评论', icon: '💬', condition: 'comment_count >= 50' },
        { id: 'team_player', name: '团队协作', description: '加入3个队伍', icon: '🤝', condition: 'team_count >= 3' },
        { id: 'resource_contributor', name: '资源贡献者', description: '上传5份资料', icon: '📚', condition: 'resource_count >= 5' },
        { id: 'cert_hunter', name: '证书猎人', description: '通过3个证书考试', icon: '📜', condition: 'cert_passed >= 3' },
        { id: 'checkin_7', name: '坚持一周', description: '连续打卡7天', icon: '🔥', condition: 'checkin_streak >= 7' },
        { id: 'checkin_30', name: '月度坚持', description: '连续打卡30天', icon: '💪', condition: 'checkin_streak >= 30' },
        { id: 'popular', name: '人气之星', description: '获得100个粉丝', icon: '⭐', condition: 'follower_count >= 100' },
        { id: 'early_bird', name: '早期用户', description: '平台前100名注册用户', icon: '🐦', condition: 'user_id <= 100' },
    ],
    // 获取用户统计数据
    getUserStats(userId) {
        const db = getDb();
        const awardCount = db.prepare(`
      SELECT COUNT(*) as count FROM awards WHERE user_id = @userId AND review_status = 'approved'
    `).get({ userId })?.count || 0;
        const postCount = db.prepare(`
      SELECT COUNT(*) as count FROM posts WHERE user_id = @userId AND deleted_at IS NULL
    `).get({ userId })?.count || 0;
        const commentCount = db.prepare(`
      SELECT COUNT(*) as count FROM comments WHERE user_id = @userId
    `).get({ userId })?.count || 0;
        const teamCount = db.prepare(`
      SELECT COUNT(*) as count FROM team_members WHERE user_id = @userId
    `).get({ userId })?.count || 0;
        const resourceCount = db.prepare(`
      SELECT COUNT(*) as count FROM resources WHERE user_id = @userId AND review_status = 'approved'
    `).get({ userId })?.count || 0;
        const certPassed = db.prepare(`
      SELECT COUNT(*) as count FROM cert_study_plans WHERE user_id = @userId AND status = 'passed'
    `).get({ userId })?.count || 0;
        const followerCount = db.prepare(`
      SELECT COUNT(*) as count FROM follows WHERE followee_id = @userId
    `).get({ userId })?.count || 0;
        // 计算打卡连续天数
        const checkins = db.prepare(`
      SELECT DISTINCT date(created_at) as checkin_date
      FROM cert_checkins
      WHERE user_id = @userId
      ORDER BY checkin_date DESC
    `).all({ userId });
        let checkinStreak = 0;
        const today = new Date().toISOString().split('T')[0];
        for (let i = 0; i < checkins.length; i++) {
            const expectedDate = new Date();
            expectedDate.setDate(expectedDate.getDate() - i);
            const expected = expectedDate.toISOString().split('T')[0];
            if (checkins[i].checkin_date === expected) {
                checkinStreak++;
            }
            else {
                break;
            }
        }
        return {
            user_id: userId,
            award_count: awardCount,
            post_count: postCount,
            comment_count: commentCount,
            team_count: teamCount,
            resource_count: resourceCount,
            cert_passed: certPassed,
            follower_count: followerCount,
            checkin_streak: checkinStreak,
        };
    },
    // 检查并授予徽章
    checkAndGrantBadges(userId) {
        const db = getDb();
        const stats = this.getUserStats(userId);
        const grantedBadges = [];
        for (const badge of this.BADGES) {
            // 检查是否已拥有
            const existing = db.prepare(`
        SELECT id FROM user_badges WHERE user_id = @userId AND badge_id = @badgeId
      `).get({ userId, badgeId: badge.id });
            if (existing)
                continue;
            // 检查条件
            let earned = false;
            const condition = badge.condition;
            if (condition.includes('award_count')) {
                const threshold = parseInt(condition.split('>=')[1]);
                earned = stats.award_count >= threshold;
            }
            else if (condition.includes('post_count')) {
                const threshold = parseInt(condition.split('>=')[1]);
                earned = stats.post_count >= threshold;
            }
            else if (condition.includes('comment_count')) {
                const threshold = parseInt(condition.split('>=')[1]);
                earned = stats.comment_count >= threshold;
            }
            else if (condition.includes('team_count')) {
                const threshold = parseInt(condition.split('>=')[1]);
                earned = stats.team_count >= threshold;
            }
            else if (condition.includes('resource_count')) {
                const threshold = parseInt(condition.split('>=')[1]);
                earned = stats.resource_count >= threshold;
            }
            else if (condition.includes('cert_passed')) {
                const threshold = parseInt(condition.split('>=')[1]);
                earned = stats.cert_passed >= threshold;
            }
            else if (condition.includes('follower_count')) {
                const threshold = parseInt(condition.split('>=')[1]);
                earned = stats.follower_count >= threshold;
            }
            else if (condition.includes('checkin_streak')) {
                const threshold = parseInt(condition.split('>=')[1]);
                earned = stats.checkin_streak >= threshold;
            }
            else if (condition.includes('user_id')) {
                const threshold = parseInt(condition.split('<=')[1]);
                earned = userId <= threshold;
            }
            if (earned) {
                db.prepare(`
          INSERT INTO user_badges (user_id, badge_id) VALUES (@userId, @badgeId)
        `).run({ userId, badgeId: badge.id });
                grantedBadges.push(badge.id);
            }
        }
        return grantedBadges;
    },
    // 获取用户徽章
    getUserBadges(userId) {
        const db = getDb();
        const userBadges = db.prepare(`
      SELECT badge_id, earned_at FROM user_badges WHERE user_id = @userId
    `).all({ userId });
        return this.BADGES.filter(b => userBadges.some(ub => ub.badge_id === b.id))
            .map(b => ({
            ...b,
            earned_at: userBadges.find(ub => ub.badge_id === b.id)?.earned_at
        }));
    },
    // 获取所有徽章（含用户是否拥有）
    getAllBadgesWithStatus(userId) {
        const db = getDb();
        const userBadges = db.prepare(`
      SELECT badge_id, earned_at FROM user_badges WHERE user_id = @userId
    `).all({ userId });
        return this.BADGES.map(b => ({
            ...b,
            earned: userBadges.some(ub => ub.badge_id === b.id),
            earned_at: userBadges.find(ub => ub.badge_id === b.id)?.earned_at || null
        }));
    }
};