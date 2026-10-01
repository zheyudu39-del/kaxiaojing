/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/notebookService.ts

import { getDb } from '../db/database';

// 确保笔记本表存在
export function ensureNotebookTables(): void {
    const db = getDb();
    db.exec(`
    CREATE TABLE IF NOT EXISTS notebooks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      competition_id INTEGER REFERENCES competitions(id),
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      tags TEXT DEFAULT '[]',
      is_pinned INTEGER NOT NULL DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_notebooks_user ON notebooks(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_notebooks_competition ON notebooks(competition_id)');
}
// 获取用户笔记列表
export function getUserNotes(userId: number, competitionId?: number): any[] {
    const db = getDb();
    let sql = `
    SELECT n.*, c.name as competition_name
    FROM notebooks n
    LEFT JOIN competitions c ON n.competition_id = c.id
    WHERE n.user_id = @userId
  `;
    const params = { userId };
    if (competitionId) {
        sql += ' AND n.competition_id = @competitionId';
        params.competitionId = competitionId;
    }
    sql += ' ORDER BY n.is_pinned DESC, n.updated_at DESC';
    return db.prepare(sql).all(params);
}
// 获取单条笔记
export function getNoteById(noteId: number, userId: number): any {
    const db = getDb();
    return db.prepare(`
    SELECT n.*, c.name as competition_name
    FROM notebooks n
    LEFT JOIN competitions c ON n.competition_id = c.id
    WHERE n.id = @noteId AND n.user_id = @userId
  `).get({ noteId, userId });
}
// 创建笔记
export function createNote(userId: number, data: {     title: string;     content: string;     competition_id?: number;     tags?: string[]; }): any {
    const db = getDb();
    const tags = JSON.stringify(data.tags || []);
    const result = db.prepare(`
    INSERT INTO notebooks (user_id, competition_id, title, content, tags)
    VALUES (@userId, @competitionId, @title, @content, @tags)
  `).run({
        userId,
        competitionId: data.competition_id || null,
        title: data.title,
        content: data.content,
        tags
    });
    return getNoteById(result.lastInsertRowid, userId);
}
// 更新笔记
export function updateNote(noteId: number, userId: number, data: {     title?: string;     content?: string;     competition_id?: number;     tags?: string[]; }): any {
    const db = getDb();
    const existing = getNoteById(noteId, userId);
    if (!existing)
        return null;
    const title = data.title !== undefined ? data.title : existing.title;
    const content = data.content !== undefined ? data.content : existing.content;
    const competitionId = data.competition_id !== undefined ? (data.competition_id || null) : existing.competition_id;
    const tags = data.tags !== undefined ? JSON.stringify(data.tags) : existing.tags;
    db.prepare(`
    UPDATE notebooks SET title = @title, content = @content, competition_id = @competitionId,
    tags = @tags, updated_at = datetime('now')
    WHERE id = @noteId AND user_id = @userId
  `).run({ title, content, competitionId, tags, noteId, userId });
    return getNoteById(noteId, userId);
}
// 删除笔记
export function deleteNote(noteId: number, userId: number): boolean {
    const db = getDb();
    const result = db.prepare('DELETE FROM notebooks WHERE id = @noteId AND user_id = @userId').run({ noteId, userId });
    return result.changes > 0;
}
// 置顶/取消置顶
export function togglePin(noteId: number, userId: number): any {
    const db = getDb();
    const note = getNoteById(noteId, userId);
    if (!note)
        return null;
    const newPinned = note.is_pinned ? 0 : 1;
    db.prepare('UPDATE notebooks SET is_pinned = @pinned WHERE id = @noteId AND user_id = @userId').run({ pinned: newPinned, noteId, userId });
    return getNoteById(noteId, userId);
}
// 搜索笔记
export function searchNotes(userId: number, keyword: string): any[] {
    const db = getDb();
    return db.prepare(`
    SELECT n.*, c.name as competition_name
    FROM notebooks n
    LEFT JOIN competitions c ON n.competition_id = c.id
    WHERE n.user_id = @userId AND (n.title LIKE @kw OR n.content LIKE @kw OR n.tags LIKE @kw)
    ORDER BY n.updated_at DESC
  `).all({ userId, kw: `%${keyword}%` });
}
// 获取笔记统计
export function getNoteStats(userId: number): any {
    const db = getDb();
    const total = db.prepare('SELECT COUNT(*) as count FROM notebooks WHERE user_id = @userId').get({ userId });
    const byCompetition = db.prepare(`
    SELECT c.name, COUNT(*) as count
    FROM notebooks n
    LEFT JOIN competitions c ON n.competition_id = c.id
    WHERE n.user_id = @userId AND n.competition_id IS NOT NULL
    GROUP BY n.competition_id ORDER BY count DESC LIMIT 10
  `).all({ userId });
    const recentCount = db.prepare(`
    SELECT COUNT(*) as count FROM notebooks
    WHERE user_id = @userId AND updated_at >= datetime('now', '-7 days')
  `).get({ userId });
    return { total: total.count, recent_week: recentCount.count, by_competition: byCompetition };
}