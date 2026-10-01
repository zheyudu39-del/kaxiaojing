/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/difficultyService.ts

import { getDb } from '../db/database';

export class DifficultyService {
    getDifficultyAnalysis(competitionId: number): { total_participants: any; total_awards: any; award_rate: number; difficulty_level: string; award_breakdown: { level: string; count: number; rate: number; }[]; } | null {
        const db = getDb();
        const comp = db.prepare('SELECT id FROM competitions WHERE id = @competitionId').get({ competitionId });
        if (!comp)
            return null;
        // 参赛人数（通过 team_members 统计）
        const participantCount = db.prepare('SELECT COUNT(DISTINCT tm.user_id) as c FROM team_members tm JOIN teams t ON t.id = tm.team_id WHERE t.competition_id = @competitionId').get({ competitionId }).c;
        // 获奖统计
        const totalAwards = db.prepare('SELECT COUNT(*) as c FROM awards WHERE competition_id = @competitionId').get({ competitionId }).c;
        const awardRate = participantCount > 0 ? totalAwards / participantCount : 0;
        // 按奖项等级分组
        const breakdown = db.prepare('SELECT award_level as level, COUNT(*) as count FROM awards WHERE competition_id = @competitionId GROUP BY award_level').all({ competitionId });
        const awardBreakdown = breakdown.map(b => ({
            level: b.level,
            count: b.count,
            rate: participantCount > 0 ? b.count / participantCount : 0,
        }));
        return {
            total_participants: participantCount,
            total_awards: totalAwards,
            award_rate: awardRate,
            difficulty_level: this.calculateDifficultyLevel(awardRate),
            award_breakdown: awardBreakdown,
        };
    }
    calculateDifficultyLevel(awardRate: number): string {
        if (awardRate >= 0.3)
            return '简单';
        if (awardRate >= 0.15)
            return '中等';
        if (awardRate >= 0.05)
            return '困难';
        return '极难';
    }
}
export const difficultyService: DifficultyService = new DifficultyService();