/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/collegeService.ts

import { getDb } from '../db/database';
import { cacheService } from './cacheService';

// ===== 类型定义（自 .d.ts 还原）=====
import type { Competition } from './competitionService';
export interface College {
    id: number;
    name: string;
}
export interface Major {
    id: number;
    name: string;
    college_id: number;
}

export class CollegeService {
    listColleges(): College[] {
        const cacheKey = 'colleges:list';
        const cached = cacheService.get(cacheKey);
        if (cached)
            return cached;
        const db = getDb();
        const result = db.prepare('SELECT * FROM colleges ORDER BY id').all();
        cacheService.set(cacheKey, result, 600000); // 10 minute TTL
        return result;
    }
    getCollegeById(id: number): College | null {
        const db = getDb();
        const college = db.prepare('SELECT * FROM colleges WHERE id = @id').get({ id });
        return college || null;
    }
    getMajorsByCollegeId(collegeId: number): Major[] {
        const db = getDb();
        return db.prepare('SELECT * FROM majors WHERE college_id = @collegeId ORDER BY id').all({ collegeId });
    }
    getMajorById(id: number): Major | null {
        const db = getDb();
        const major = db.prepare('SELECT * FROM majors WHERE id = @id').get({ id });
        return major || null;
    }
    getCompetitionsByCollegeId(collegeId: number): Competition[] {
        const db = getDb();
        return db.prepare(`SELECT c.* FROM competitions c
       INNER JOIN college_competitions cc ON c.id = cc.competition_id
       WHERE cc.college_id = @collegeId
       ORDER BY c.id`).all({ collegeId });
    }
    getCompetitionsByMajorId(majorId: number): Competition[] {
        const db = getDb();
        return db.prepare(`SELECT c.* FROM competitions c
       INNER JOIN major_competitions mc ON c.id = mc.competition_id
       WHERE mc.major_id = @majorId
       ORDER BY c.id`).all({ majorId });
    }
}
export const collegeService: CollegeService = new CollegeService();