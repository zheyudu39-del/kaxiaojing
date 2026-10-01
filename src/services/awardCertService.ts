/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/awardCertService.ts

import { getDb } from '../db/database';

// 确保证书生成表存在
export function ensureAwardCertTables(): void {
    const db = getDb();
    db.exec(`
    CREATE TABLE IF NOT EXISTS award_certificates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      competition_id INTEGER NOT NULL REFERENCES competitions(id),
      award_level TEXT NOT NULL,
      award_date TEXT NOT NULL,
      cert_number TEXT NOT NULL UNIQUE,
      template TEXT NOT NULL DEFAULT 'default',
      extra_info TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_award_certs_user ON award_certificates(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_award_certs_comp ON award_certificates(competition_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_award_certs_number ON award_certificates(cert_number)');
}
// 生成唯一证书编号
function generateCertNumber() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CERT-${y}${m}${d}-${rand}`;
}
// 获取用户的所有证书
export function getUserCerts(userId: number): any[] {
    const db = getDb();
    return db.prepare(`
    SELECT ac.*, c.name as competition_name, u.username
    FROM award_certificates ac
    JOIN competitions c ON ac.competition_id = c.id
    JOIN users u ON ac.user_id = u.id
    WHERE ac.user_id = @userId
    ORDER BY ac.created_at DESC
  `).all({ userId });
}
// 获取单个证书
export function getCertById(certId: number): any {
    const db = getDb();
    return db.prepare(`
    SELECT ac.*, c.name as competition_name, c.category, u.username, u.college, u.major
    FROM award_certificates ac
    JOIN competitions c ON ac.competition_id = c.id
    JOIN users u ON ac.user_id = u.id
    WHERE ac.id = @certId
  `).get({ certId });
}
// 通过编号查询证书（公开验证）
export function getCertByNumber(certNumber: string): any {
    const db = getDb();
    return db.prepare(`
    SELECT ac.*, c.name as competition_name, c.category, u.username
    FROM award_certificates ac
    JOIN competitions c ON ac.competition_id = c.id
    JOIN users u ON ac.user_id = u.id
    WHERE ac.cert_number = @certNumber
  `).get({ certNumber });
}
// 生成证书
export function generateCert(userId: number, data: {     competition_id: number;     award_level: string;     award_date: string;     template?: string;     extra_info?: any; }): any {
    const db = getDb();
    // 检查是否已有该竞赛的证书
    const existing = db.prepare(`
    SELECT id FROM award_certificates
    WHERE user_id = @userId AND competition_id = @competitionId AND award_level = @awardLevel
  `).get({ userId, competitionId: data.competition_id, awardLevel: data.award_level });
    if (existing) {
        return { error: '该竞赛该奖项已生成过证书', existing_id: existing.id };
    }
    const certNumber = generateCertNumber();
    const result = db.prepare(`
    INSERT INTO award_certificates (user_id, competition_id, award_level, award_date, cert_number, template, extra_info)
    VALUES (@userId, @competitionId, @awardLevel, @awardDate, @certNumber, @template, @extraInfo)
  `).run({
        userId,
        competitionId: data.competition_id,
        awardLevel: data.award_level,
        awardDate: data.award_date,
        certNumber,
        template: data.template || 'default',
        extraInfo: JSON.stringify(data.extra_info || {})
    });
    return getCertById(result.lastInsertRowid);
}
// 从获奖记录自动生成证书
export function generateFromAwards(userId: number): any[] {
    const db = getDb();
    const awards = db.prepare(`
    SELECT a.*, c.name as competition_name
    FROM awards a
    JOIN competitions c ON a.competition_id = c.id
    WHERE a.user_id = @userId AND a.review_status = 'approved'
  `).all({ userId });
    const generated = [];
    for (const award of awards) {
        // 检查是否已生成
        const existing = db.prepare(`
      SELECT id FROM award_certificates
      WHERE user_id = @userId AND competition_id = @competitionId AND award_level = @awardLevel
    `).get({ userId, competitionId: award.competition_id, awardLevel: award.award_level });
        if (existing)
            continue;
        const cert = generateCert(userId, {
            competition_id: award.competition_id,
            award_level: award.award_level,
            award_date: award.award_date || new Date().toISOString().split('T')[0],
        });
        if (!cert.error)
            generated.push(cert);
    }
    return generated;
}
// 删除证书
export function deleteCert(certId: number, userId: number): boolean {
    const db = getDb();
    const result = db.prepare('DELETE FROM award_certificates WHERE id = @certId AND user_id = @userId').run({ certId, userId });
    return result.changes > 0;
}
// 获取证书渲染数据（用于前端生成图片）
export function getCertRenderData(certId: number): any {
    const cert = getCertById(certId);
    if (!cert)
        return null;
    const levelMap = {
        '国家级一等奖': '一等奖',
        '国家级二等奖': '二等奖',
        '国家级三等奖': '三等奖',
        '省级一等奖': '一等奖',
        '省级二等奖': '二等奖',
        '省级三等奖': '三等奖',
        '一等奖': '一等奖',
        '二等奖': '二等奖',
        '三等奖': '三等奖',
        '特等奖': '特等奖',
        '金奖': '金奖',
        '银奖': '银奖',
        '铜奖': '铜奖',
    };
    return {
        cert_number: cert.cert_number,
        username: cert.username,
        college: cert.college || '',
        major: cert.major || '',
        competition_name: cert.competition_name,
        category: cert.category,
        award_level: cert.award_level,
        award_display: levelMap[cert.award_level] || cert.award_level,
        award_date: cert.award_date,
        template: cert.template,
        extra_info: JSON.parse(cert.extra_info || '{}'),
        created_at: cert.created_at,
    };
}
// 证书统计
export function getCertStats(userId: number): any {
    const db = getDb();
    const total = db.prepare('SELECT COUNT(*) as count FROM award_certificates WHERE user_id = @userId').get({ userId });
    const byLevel = db.prepare(`
    SELECT award_level, COUNT(*) as count FROM award_certificates
    WHERE user_id = @userId GROUP BY award_level ORDER BY count DESC
  `).all({ userId });
    const byCompetition = db.prepare(`
    SELECT c.name, COUNT(*) as count FROM award_certificates ac
    JOIN competitions c ON ac.competition_id = c.id
    WHERE ac.user_id = @userId GROUP BY ac.competition_id ORDER BY count DESC
  `).all({ userId });
    return { total: total.count, by_level: byLevel, by_competition: byCompetition };
}