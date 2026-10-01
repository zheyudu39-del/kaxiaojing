/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/teacherCertService.ts

import { getDb } from '../db/database';

// ===== 类型定义（自 .d.ts 还原）=====
export interface TeacherCertification {
    id: number;
    user_id: number;
    real_name: string;
    college: string;
    cert_image_url: string;
    review_status: 'pending' | 'approved' | 'rejected';
    review_comment: string | null;
    reviewed_by: number | null;
    reviewed_at: string | null;
    created_at: string;
}

export class TeacherCertService {
    submitApplication(userId: number, realName: string, college: string, certImageUrl: string): TeacherCertification {
        const db = getDb();
        // 检查是否已有待审核的申请
        const pending = db.prepare("SELECT id FROM teacher_certifications WHERE user_id = @userId AND review_status = 'pending'").get({ userId });
        if (pending) {
            throw new Error('您已有一条待审核的教师认证申请');
        }
        // 检查用户是否已经是教师
        const user = db.prepare('SELECT role FROM users WHERE id = @userId').get({ userId });
        if (user?.role === 'teacher') {
            throw new Error('您已通过教师认证');
        }
        const result = db.prepare('INSERT INTO teacher_certifications (user_id, real_name, college, cert_image_url) VALUES (@userId, @realName, @college, @certImageUrl)').run({ userId, realName, college, certImageUrl });
        return this.getById(result.lastInsertRowid);
    }
    getUserCertification(userId: number): TeacherCertification | null {
        const db = getDb();
        return db.prepare('SELECT * FROM teacher_certifications WHERE user_id = @userId ORDER BY created_at DESC LIMIT 1').get({ userId });
    }
    hasPendingApplication(userId: number): boolean {
        const db = getDb();
        const row = db.prepare("SELECT id FROM teacher_certifications WHERE user_id = @userId AND review_status = 'pending'").get({ userId });
        return !!row;
    }
    getById(id) {
        const db = getDb();
        return db.prepare('SELECT * FROM teacher_certifications WHERE id = @id').get({ id });
    }
}
export const teacherCertService: TeacherCertService = new TeacherCertService();