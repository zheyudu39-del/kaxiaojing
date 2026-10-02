/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/db/database.ts

import sqlJs from 'sql.js';
import path from 'path';
import fs from 'fs';

// ===== 类型定义（自 .d.ts 还原）=====
import type { Database as SqlJsDatabase } from 'sql.js';

/**
 * Wrapper around sql.js that provides a better-sqlite3-compatible synchronous API.
 * This allows the rest of the codebase to use the same interface regardless of the
 * underlying SQLite implementation.
 */
export class DatabaseWrapper {
    private sqlDb;
    private dbPath;
    private _inTransaction;
    private dirtyCount;
    private flushTimer;
    static DIRTY_THRESHOLD;
    static FLUSH_INTERVAL_MS;
    constructor(sqlDb: SqlJsDatabase, dbPath: string | null) {
        this._inTransaction = false;
        // 节流刷盘：累计脏写次数或定时触发，避免每次 run()/exec() 都全量 dump
        this.dirtyCount = 0;
        this.flushTimer = null;
        this.sqlDb = sqlDb;
        this.dbPath = dbPath;
        // 进程退出/被杀时强制刷盘，避免脏数据丢失
        const flush = () => this.forceSave();
        process.on('exit', flush);
        process.on('SIGINT', () => { flush(); process.exit(0); });
        process.on('SIGTERM', () => { flush(); process.exit(0); });
        process.on('beforeExit', flush);
    }
    get inTransaction() {
        return this._inTransaction;
    }
    exec(sql: string): void {
        this.sqlDb.exec(sql);
        if (!this._inTransaction) {
            this.markDirty();
        }
    }
    prepare(sql: string): StatementWrapper {
        return new StatementWrapper(this.sqlDb, sql, this);
    }
    pragma(pragma: string): any {
        const results = this.sqlDb.exec(`PRAGMA ${pragma}`);
        if (results.length === 0)
            return [];
        const cols = results[0].columns;
        return results[0].values.map(row => {
            const obj = {};
            cols.forEach((col, i) => { obj[col] = row[i]; });
            return obj;
        });
    }
    transaction<T>(fn: (items: T[]) => void): (items: T[]) => void {
        return (items) => {
            // 真正的事务：BEGIN / COMMIT / ROLLBACK
            this._inTransaction = true;
            this.sqlDb.exec('BEGIN TRANSACTION');
            try {
                fn(items);
                this.sqlDb.exec('COMMIT');
                this._inTransaction = false;
                this.save();
            }
            catch (err) {
                this.sqlDb.exec('ROLLBACK');
                this._inTransaction = false;
                throw err;
            }
        };
    }
    close(): void {
        this.forceSave();
        this.sqlDb.close();
    }
    save(): void {
        if (this.dbPath) {
            try {
                const data = this.sqlDb.export();
                const buffer = Buffer.from(data);
                // 安全写入：先写临时文件，再重命名，防止写入中断导致数据库损坏
                const tmpPath = this.dbPath + '.tmp';
                fs.writeFileSync(tmpPath, buffer);
                fs.renameSync(tmpPath, this.dbPath);
            }
            catch (err) {
                console.error('[Database] Save failed:', err);
                throw err;
            }
        }
    }
    /** 标记数据库已变更，按次数/时间节流刷盘 */
    markDirty(): void {
        this.dirtyCount++;
        if (this.dirtyCount >= DatabaseWrapper.DIRTY_THRESHOLD) {
            this.forceSave();
        }
        else if (!this.flushTimer) {
            this.flushTimer = setTimeout(() => {
                this.forceSave();
            }, DatabaseWrapper.FLUSH_INTERVAL_MS);
        }
    }
    /** 立即刷盘并重置脏状态 */
    forceSave(): void {
        if (this.flushTimer) {
            clearTimeout(this.flushTimer);
            this.flushTimer = null;
        }
        if (this.dirtyCount > 0) {
            this.dirtyCount = 0;
            this.save();
        }
    }
    /** 在事务中执行批量操作，只在最后保存一次文件 */
    runInTransaction(fn: () => void): void {
        this._inTransaction = true;
        this.sqlDb.exec('BEGIN TRANSACTION');
        try {
            fn();
            this.sqlDb.exec('COMMIT');
            this._inTransaction = false;
            this.save();
        }
        catch (err) {
            this.sqlDb.exec('ROLLBACK');
            this._inTransaction = false;
            throw err;
        }
    }
    getRawDb(): SqlJsDatabase {
        return this.sqlDb;
    }
}
DatabaseWrapper.DIRTY_THRESHOLD = 3;
DatabaseWrapper.FLUSH_INTERVAL_MS = 1000;
export class StatementWrapper {
    private sqlDb;
    private sql;
    private dbWrapper;
    constructor(sqlDb: SqlJsDatabase, sql: string, dbWrapper: DatabaseWrapper) {
        this.sqlDb = sqlDb;
        this.sql = sql;
        this.dbWrapper = dbWrapper;
    }
    get(params?: any): any {
        const stmt = this.sqlDb.prepare(this.sql);
        const bindParams = this.convertParams(params);
        if (bindParams)
            stmt.bind(bindParams);
        if (stmt.step()) {
            const cols = stmt.getColumnNames();
            const values = stmt.get();
            stmt.free();
            const obj = {};
            cols.forEach((col, i) => { obj[col] = values[i]; });
            return obj;
        }
        stmt.free();
        return undefined;
    }
    all(params?: any): any[] {
        const results = [];
        const stmt = this.sqlDb.prepare(this.sql);
        const bindParams = this.convertParams(params);
        if (bindParams)
            stmt.bind(bindParams);
        while (stmt.step()) {
            const cols = stmt.getColumnNames();
            const values = stmt.get();
            const obj = {};
            cols.forEach((col, i) => { obj[col] = values[i]; });
            results.push(obj);
        }
        stmt.free();
        return results;
    }
    run(params?: any): { changes: number; lastInsertRowid: number; } {
        const stmt = this.sqlDb.prepare(this.sql);
        const bindParams = this.convertParams(params);
        if (bindParams)
            stmt.bind(bindParams);
        stmt.step();
        stmt.free();
        const changesResult = this.sqlDb.exec('SELECT changes() as changes');
        const lastIdResult = this.sqlDb.exec('SELECT last_insert_rowid() as id');
        // 事务中不自动保存，由 runInTransaction 统一保存；
        // 非事务场景走节流刷盘（dirty 计数 + 定时器），避免每次 run 都全量 dump
        if (!this.dbWrapper.inTransaction) {
            this.dbWrapper.markDirty();
        }
        return {
            changes: changesResult[0]?.values[0]?.[0] || 0,
            lastInsertRowid: lastIdResult[0]?.values[0]?.[0] || 0,
        };
    }
    convertParams(params) {
        if (!params)
            return undefined;
        if (typeof params !== 'object')
            return [params];
        // Convert named params from {key: value} to {$key: value} or {:key: value}
        // sql.js uses $param, :param, or @param syntax
        if (!Array.isArray(params)) {
            const converted = {};
            for (const [key, value] of Object.entries(params)) {
                const paramKey = key.startsWith('@') || key.startsWith('$') || key.startsWith(':')
                    ? key
                    : `@${key}`;
                converted[paramKey] = value;
            }
            return converted;
        }
        return params;
    }
}
let db = null;
let sqlJsInitialized = null;
const DB_PATH = path.join(__dirname, '..', '..', 'data', 'competition.db');
export function getDb(): DatabaseWrapper {
    if (!db) {
        throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return db;
}
export async function initializeDatabase(dbPath?: string): Promise<DatabaseWrapper> {
    const resolvedPath = dbPath || DB_PATH;
    // Ensure the directory exists
    const dir = path.dirname(resolvedPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!sqlJsInitialized) {
        sqlJsInitialized = await sqlJs();
    }
    let sqlDb;
    if (fs.existsSync(resolvedPath)) {
        const fileBuffer = fs.readFileSync(resolvedPath);
        sqlDb = new sqlJsInitialized.Database(fileBuffer);
    }
    else {
        sqlDb = new sqlJsInitialized.Database();
    }
    db = new DatabaseWrapper(sqlDb, resolvedPath);
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    createTables(db);
    // Seed data if competitions table is empty
    const count = db.prepare('SELECT COUNT(*) as count FROM competitions').get();
    if (count.count === 0) {
        const { seedCompetitions } = require('./seed');
        seedCompetitions(db);
        // 补充《喀什大学 2027 届推免认定学科竞赛项目目录》中的竞赛。
        // 必须在 seedColleges 之前执行——后者会依据 competitions 全量构建
        // 「学院/专业 → 竞赛」映射，晚于此则新竞赛不会被挂到专业上。
        const { seedTuimianCompetitions } = require('./tuimianCompetitions');
        const n = seedTuimianCompetitions(db);
        console.log(`[seed] 已导入推免认定竞赛 ${n} 项`);
    }
    // Seed colleges data if colleges table is empty
    const collegeCount = db.prepare('SELECT COUNT(*) as count FROM colleges').get();
    if (collegeCount.count === 0) {
        const { seedColleges } = require('./collegeSeed');
        seedColleges(db);
    }
    // Seed resources data if resources table is empty
    const resourceCount = db.prepare('SELECT COUNT(*) as count FROM resources').get();
    if (resourceCount.count === 0) {
        const { seedResources } = require('./seed');
        seedResources(db);
    }
    // Seed certificates data if certificates table is empty
    const certCount = db.prepare('SELECT COUNT(*) as count FROM certificates').get();
    if (certCount.count === 0) {
        const { seedCertificates } = require('./seed');
        seedCertificates(db);
    }
    // Seed competition stages data if competition_stages table is empty
    const stageCount = db.prepare('SELECT COUNT(*) as count FROM competition_stages').get();
    if (stageCount.count === 0) {
        const { seedCompetitionStages } = require('./seed');
        seedCompetitionStages(db);
    }
    // Fix seeded resources that were inserted without review_status='approved'
    db.prepare("UPDATE resources SET review_status = 'approved' WHERE is_external = 1 AND review_status = 'pending'").run();
    // Seed quiz data if quizzes table is empty
    const quizCount = db.prepare('SELECT COUNT(*) as count FROM quizzes').get();
    if (quizCount.count === 0) {
        const { seedQuizData } = require('./quizSeed');
        seedQuizData(db);
    }
    // Seed mentor data if mentors table is empty (requires users to exist)
    const mentorCount = db.prepare('SELECT COUNT(*) as count FROM mentors').get();
    if (mentorCount.count === 0) {
        const { seedMentorData } = require('./mentorSeed');
        seedMentorData(db);
    }
    // Ensure the first non-system user has admin role
    db.prepare("UPDATE users SET role = 'admin' WHERE id = (SELECT MIN(id) FROM users WHERE id > 1)").run();
    return db;
}
function createTables(db) {
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    db.exec(`
    CREATE TABLE IF NOT EXISTS competitions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT DEFAULT '',
      target_audience TEXT DEFAULT '',
      fee TEXT DEFAULT '',
      format TEXT DEFAULT 'individual',
      reg_start_month INTEGER NOT NULL,
      reg_end_month INTEGER,
      requirements TEXT DEFAULT ''
    )
  `);
    db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      competition_id INTEGER NOT NULL REFERENCES competitions(id),
      leader_id INTEGER NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    db.exec(`
    CREATE TABLE IF NOT EXISTS team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id),
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(team_id, user_id)
    )
  `);
    db.exec(`
    CREATE TABLE IF NOT EXISTS join_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id),
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_competitions_category ON competitions(category)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_competitions_reg_months ON competitions(reg_start_month, reg_end_month)');
    // 添加 past_papers_url 字段
    const compCols = db.prepare("PRAGMA table_info(competitions)").all();
    const compColNames = compCols.map((c) => c.name);
    if (!compColNames.includes('past_papers_url')) {
        db.exec("ALTER TABLE competitions ADD COLUMN past_papers_url TEXT DEFAULT NULL");
    }
    if (!compColNames.includes('official_website')) {
        db.exec("ALTER TABLE competitions ADD COLUMN official_website TEXT DEFAULT NULL");
    }
    if (!compColNames.includes('qq_group')) {
        db.exec("ALTER TABLE competitions ADD COLUMN qq_group TEXT DEFAULT NULL");
    }
    if (!compColNames.includes('wechat_qrcode_url')) {
        db.exec("ALTER TABLE competitions ADD COLUMN wechat_qrcode_url TEXT DEFAULT NULL");
    }
    if (!compColNames.includes('registration_url')) {
        db.exec("ALTER TABLE competitions ADD COLUMN registration_url TEXT DEFAULT NULL");
    }
    db.exec('CREATE INDEX IF NOT EXISTS idx_teams_competition ON teams(competition_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_messages_team ON messages(team_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_join_requests_team ON join_requests(team_id)');
    // College-Major system tables
    db.exec(`
    CREATE TABLE IF NOT EXISTS colleges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )
  `);
    db.exec(`
    CREATE TABLE IF NOT EXISTS majors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      college_id INTEGER NOT NULL REFERENCES colleges(id),
      UNIQUE(name, college_id)
    )
  `);
    db.exec(`
    CREATE TABLE IF NOT EXISTS college_competitions (
      college_id INTEGER NOT NULL REFERENCES colleges(id),
      competition_id INTEGER NOT NULL REFERENCES competitions(id),
      PRIMARY KEY (college_id, competition_id)
    )
  `);
    db.exec(`
    CREATE TABLE IF NOT EXISTS major_competitions (
      major_id INTEGER NOT NULL REFERENCES majors(id),
      competition_id INTEGER NOT NULL REFERENCES competitions(id),
      PRIMARY KEY (major_id, competition_id)
    )
  `);
    db.exec(`
    CREATE TABLE IF NOT EXISTS awards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      competition_id INTEGER NOT NULL REFERENCES competitions(id),
      award_level TEXT NOT NULL,
      award_date TEXT DEFAULT (datetime('now')),
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_majors_college ON majors(college_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_college_competitions_college ON college_competitions(college_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_college_competitions_competition ON college_competitions(competition_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_major_competitions_major ON major_competitions(major_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_major_competitions_competition ON major_competitions(competition_id)');
    // === 系统增强: users 表新增字段 ===
    const userCols = db.prepare("PRAGMA table_info(users)").all();
    const colNames = userCols.map((c) => c.name);
    if (!colNames.includes('role')) {
        db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'");
    }
    if (!colNames.includes('college')) {
        db.exec("ALTER TABLE users ADD COLUMN college TEXT DEFAULT NULL");
    }
    if (!colNames.includes('major')) {
        db.exec("ALTER TABLE users ADD COLUMN major TEXT DEFAULT NULL");
    }
    if (!colNames.includes('bio')) {
        db.exec("ALTER TABLE users ADD COLUMN bio TEXT DEFAULT NULL");
    }
    if (!colNames.includes('avatar_url')) {
        db.exec("ALTER TABLE users ADD COLUMN avatar_url TEXT DEFAULT NULL");
    }
    if (!colNames.includes('avatar_review_status')) {
        db.exec("ALTER TABLE users ADD COLUMN avatar_review_status TEXT DEFAULT NULL");
    }
    if (!colNames.includes('pending_avatar_url')) {
        db.exec("ALTER TABLE users ADD COLUMN pending_avatar_url TEXT DEFAULT NULL");
    }
    if (!colNames.includes('muted_until')) {
        db.exec("ALTER TABLE users ADD COLUMN muted_until TEXT DEFAULT NULL");
    }
    if (!colNames.includes('warning_count')) {
        db.exec("ALTER TABLE users ADD COLUMN warning_count INTEGER NOT NULL DEFAULT 0");
    }
    // === 系统增强: 竞赛收藏表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      competition_id INTEGER NOT NULL REFERENCES competitions(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, competition_id)
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id)');
    // === 系统增强: 经验分享帖子表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      competition_id INTEGER REFERENCES competitions(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_posts_competition ON posts(competition_id)');
    // === 系统增强: 帖子评论表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id),
      content TEXT NOT NULL,
      parent_id INTEGER DEFAULT NULL REFERENCES comments(id) ON DELETE CASCADE,
      reply_to_user_id INTEGER DEFAULT NULL REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    // 评论表添加 parent_id 和 reply_to_user_id 字段
    const commentCols = db.prepare("PRAGMA table_info(comments)").all();
    const commentColNames = commentCols.map((c) => c.name);
    if (!commentColNames.includes('parent_id')) {
        db.exec("ALTER TABLE comments ADD COLUMN parent_id INTEGER DEFAULT NULL");
    }
    if (!commentColNames.includes('reply_to_user_id')) {
        db.exec("ALTER TABLE comments ADD COLUMN reply_to_user_id INTEGER DEFAULT NULL");
    }
    db.exec('CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id)');
    // === 系统增强: 通知表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      related_id INTEGER DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read)');
    // === 系统增强: 招募帖表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS recruitments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      competition_id INTEGER NOT NULL REFERENCES competitions(id),
      team_name TEXT NOT NULL,
      skills TEXT NOT NULL DEFAULT '[]',
      description TEXT NOT NULL,
      contact TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      deadline TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    // 招募帖添加 deadline 字段
    const recruitCols = db.prepare("PRAGMA table_info(recruitments)").all();
    const recruitColNames = recruitCols.map((c) => c.name);
    if (!recruitColNames.includes('deadline')) {
        db.exec("ALTER TABLE recruitments ADD COLUMN deadline TEXT DEFAULT NULL");
    }
    db.exec('CREATE INDEX IF NOT EXISTS idx_recruitments_competition ON recruitments(competition_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_recruitments_status ON recruitments(status)');
    // === 系统增强: 资料库表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      competition_id INTEGER NOT NULL REFERENCES competitions(id),
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER NOT NULL DEFAULT 0,
      download_count INTEGER NOT NULL DEFAULT 0,
      external_url TEXT DEFAULT NULL,
      is_external INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_resources_competition ON resources(competition_id)');
    // === 证书考取表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS certificates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT DEFAULT '',
      fee TEXT DEFAULT '',
      reg_time TEXT DEFAULT '',
      exam_time TEXT DEFAULT '',
      official_website TEXT DEFAULT '',
      difficulty TEXT DEFAULT '中等',
      target_audience TEXT DEFAULT ''
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_certificates_category ON certificates(category)');
    // 添加 external_url 和 is_external 字段（如果不存在）
    const resCols = db.prepare("PRAGMA table_info(resources)").all();
    const resColNames = resCols.map((c) => c.name);
    if (!resColNames.includes('external_url')) {
        db.exec("ALTER TABLE resources ADD COLUMN external_url TEXT DEFAULT NULL");
    }
    if (!resColNames.includes('is_external')) {
        db.exec("ALTER TABLE resources ADD COLUMN is_external INTEGER NOT NULL DEFAULT 0");
    }
    // === 高级功能: 站内私信表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS private_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL REFERENCES users(id),
      receiver_id INTEGER NOT NULL REFERENCES users(id),
      content TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_pm_sender ON private_messages(sender_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_pm_receiver ON private_messages(receiver_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_pm_conversation ON private_messages(sender_id, receiver_id)');
    // === 高级功能: 竞赛阶段表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS competition_stages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      competition_id INTEGER NOT NULL REFERENCES competitions(id),
      stage_name TEXT NOT NULL,
      start_month INTEGER NOT NULL,
      end_month INTEGER NOT NULL,
      description TEXT DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_stages_competition ON competition_stages(competition_id)');
    // === 高级功能: 用户技能表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS user_skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      skill TEXT NOT NULL,
      UNIQUE(user_id, skill)
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_user_skills_user ON user_skills(user_id)');
    // === 帖子点赞表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS post_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(post_id, user_id)
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_post_likes_user ON post_likes(user_id)');
    // === 竞赛报名表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      competition_id INTEGER NOT NULL REFERENCES competitions(id),
      team_id INTEGER REFERENCES teams(id),
      status TEXT NOT NULL DEFAULT 'registered' CHECK(status IN ('registered', 'cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, competition_id)
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_registrations_user ON registrations(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_registrations_competition ON registrations(competition_id)');
    // === 证书备考计划表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS cert_study_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      certificate_id INTEGER NOT NULL REFERENCES certificates(id),
      target_date TEXT,
      status TEXT NOT NULL DEFAULT 'studying' CHECK(status IN ('studying', 'passed', 'failed', 'cancelled')),
      notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, certificate_id)
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_cert_plans_user ON cert_study_plans(user_id)');
    // === 系统日志表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS system_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      action TEXT NOT NULL,
      target TEXT DEFAULT '',
      detail TEXT DEFAULT '',
      ip TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_system_logs_created ON system_logs(created_at)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_system_logs_action ON system_logs(action)');
    // === 招募申请表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS recruitment_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recruitment_id INTEGER NOT NULL REFERENCES recruitments(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id),
      message TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(recruitment_id, user_id)
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_recruit_apps_recruitment ON recruitment_applications(recruitment_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_recruit_apps_user ON recruitment_applications(user_id)');
    // === 资料评分表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS resource_ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id),
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(resource_id, user_id)
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_resource_ratings_resource ON resource_ratings(resource_id)');
    // === 证书备考打卡表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS cert_checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      certificate_id INTEGER NOT NULL REFERENCES certificates(id),
      note TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_cert_checkins_user ON cert_checkins(user_id)');
    // === AI对话历史表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS ai_chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      title TEXT NOT NULL DEFAULT '新对话',
      messages TEXT NOT NULL DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_ai_chat_user ON ai_chat_history(user_id)');
    // === 交流大厅消息表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS lobby_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      content TEXT NOT NULL,
      msg_type TEXT NOT NULL DEFAULT 'chat' CHECK(msg_type IN ('chat', 'recruit')),
      competition_id INTEGER REFERENCES competitions(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_lobby_messages_created ON lobby_messages(created_at)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_lobby_messages_type ON lobby_messages(msg_type)');
    // lobby_messages 新增审核字段
    const lobbyCols = db.prepare("PRAGMA table_info(lobby_messages)").all();
    const lobbyColNames = lobbyCols.map((c) => c.name);
    if (!lobbyColNames.includes('is_hidden')) {
        db.exec("ALTER TABLE lobby_messages ADD COLUMN is_hidden INTEGER NOT NULL DEFAULT 0");
    }
    if (!lobbyColNames.includes('moderation_reason')) {
        db.exec("ALTER TABLE lobby_messages ADD COLUMN moderation_reason TEXT DEFAULT NULL");
    }
    // === 教师认证申请表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS teacher_certifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      real_name TEXT NOT NULL,
      college TEXT NOT NULL,
      cert_image_url TEXT NOT NULL,
      review_status TEXT NOT NULL DEFAULT 'pending',
      review_comment TEXT DEFAULT NULL,
      reviewed_by INTEGER DEFAULT NULL,
      reviewed_at TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_teacher_cert_user ON teacher_certifications(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_teacher_cert_status ON teacher_certifications(review_status)');
    // === 用户警告记录表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS user_warnings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      message_id INTEGER,
      reason TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_user_warnings_user ON user_warnings(user_id)');
    // === 密码重置令牌字段 ===
    const userCols2 = db.prepare("PRAGMA table_info(users)").all();
    const colNames2 = userCols2.map((c) => c.name);
    if (!colNames2.includes('reset_token')) {
        db.exec("ALTER TABLE users ADD COLUMN reset_token TEXT DEFAULT NULL");
    }
    if (!colNames2.includes('reset_token_expires')) {
        db.exec("ALTER TABLE users ADD COLUMN reset_token_expires TEXT DEFAULT NULL");
    }
    // === 审核系统: 为内容表添加审核字段 ===
    const reviewTables = ['awards', 'cert_study_plans', 'posts', 'resources', 'recruitments'];
    const proofTables = ['awards', 'cert_study_plans'];
    for (const table of reviewTables) {
        const cols = db.prepare(`PRAGMA table_info(${table})`).all();
        const names = cols.map((c) => c.name);
        if (!names.includes('review_status')) {
            db.exec(`ALTER TABLE ${table} ADD COLUMN review_status TEXT NOT NULL DEFAULT 'pending'`);
            // 将现有数据标记为已通过，避免已有内容被隐藏
            db.exec(`UPDATE ${table} SET review_status = 'approved' WHERE review_status = 'pending'`);
        }
        if (!names.includes('review_comment')) {
            db.exec(`ALTER TABLE ${table} ADD COLUMN review_comment TEXT DEFAULT NULL`);
        }
        if (!names.includes('reviewed_by')) {
            db.exec(`ALTER TABLE ${table} ADD COLUMN reviewed_by INTEGER DEFAULT NULL`);
        }
        if (!names.includes('reviewed_at')) {
            db.exec(`ALTER TABLE ${table} ADD COLUMN reviewed_at TEXT DEFAULT NULL`);
        }
        // awards 和 cert_study_plans 额外添加 proof_image_url
        if (proofTables.includes(table) && !names.includes('proof_image_url')) {
            db.exec(`ALTER TABLE ${table} ADD COLUMN proof_image_url TEXT DEFAULT NULL`);
        }
    }
    // === 软删除: 为内容表添加 deleted_at 列 ===
    const softDeleteTables = ['competitions', 'posts', 'resources', 'recruitments'];
    for (const table of softDeleteTables) {
        const cols = db.prepare(`PRAGMA table_info(${table})`).all();
        const names = cols.map((c) => c.name);
        if (!names.includes('deleted_at')) {
            db.exec(`ALTER TABLE ${table} ADD COLUMN deleted_at TEXT DEFAULT NULL`);
        }
    }
    // === 用户关注表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS follows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      follower_id INTEGER NOT NULL REFERENCES users(id),
      followee_id INTEGER NOT NULL REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(follower_id, followee_id),
      CHECK(follower_id != followee_id)
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_follows_followee ON follows(followee_id)');
    // === 补充缺失的外键索引 ===
    db.exec('CREATE INDEX IF NOT EXISTS idx_awards_user ON awards(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_awards_competition ON awards(competition_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_registrations_team ON registrations(team_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_notifications_related ON notifications(related_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_lobby_messages_user ON lobby_messages(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_cert_checkins_cert ON cert_checkins(certificate_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_cert_plans_cert ON cert_study_plans(certificate_id)');
    // === 高频查询索引 ===
    db.exec('CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_pm_created ON private_messages(created_at)');
    // idx_lobby_messages_user already created above
    // === 竞赛评价表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS competition_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      competition_id INTEGER NOT NULL REFERENCES competitions(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      content TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(competition_id, user_id)
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_comp_reviews_comp ON competition_reviews(competition_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_comp_reviews_user ON competition_reviews(user_id)');
    // === 帖子书签/收藏表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS post_bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, post_id)
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_post_bookmarks_user ON post_bookmarks(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_post_bookmarks_post ON post_bookmarks(post_id)');
    // === 竞赛收藏标签表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS favorite_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      competition_id INTEGER NOT NULL REFERENCES competitions(id),
      tag TEXT NOT NULL,
      UNIQUE(user_id, competition_id, tag)
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_favorite_tags_user ON favorite_tags(user_id)');
    // === 队伍邀请码表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS team_invites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      invite_code TEXT NOT NULL UNIQUE,
      created_by INTEGER NOT NULL REFERENCES users(id),
      expires_at DATETIME NOT NULL,
      max_uses INTEGER DEFAULT NULL,
      use_count INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_team_invites_team ON team_invites(team_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_team_invites_code ON team_invites(invite_code)');
    // === 个人主页访问记录表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS profile_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_user_id INTEGER NOT NULL REFERENCES users(id),
      viewer_user_id INTEGER REFERENCES users(id),
      viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_profile_views_profile ON profile_views(profile_user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_profile_views_viewer ON profile_views(viewer_user_id)');
    // === posts 表添加 updated_at 字段 ===
    const postCols = db.prepare("PRAGMA table_info(posts)").all();
    const postColNames = postCols.map((c) => c.name);
    if (!postColNames.includes('updated_at')) {
        db.exec("ALTER TABLE posts ADD COLUMN updated_at DATETIME DEFAULT NULL");
    }
    // === 用户反馈表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS user_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      type TEXT NOT NULL DEFAULT 'suggestion' CHECK(type IN ('suggestion', 'bug', 'complaint', 'other')),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      contact TEXT DEFAULT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'resolved', 'closed')),
      admin_reply TEXT DEFAULT NULL,
      replied_at TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_feedback_user ON user_feedback(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_feedback_status ON user_feedback(status)');
    // === 备赛计划待办事项表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS prep_todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      competition_id INTEGER REFERENCES competitions(id),
      certificate_id INTEGER REFERENCES certificates(id),
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      due_date TEXT DEFAULT NULL,
      priority INTEGER NOT NULL DEFAULT 0,
      is_completed INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_prep_todos_user ON prep_todos(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_prep_todos_completed ON prep_todos(is_completed)');
    // === 用户动态时间线表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS user_activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      activity_type TEXT NOT NULL,
      target_type TEXT DEFAULT NULL,
      target_id INTEGER DEFAULT NULL,
      content TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_activities_user ON user_activities(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_activities_created ON user_activities(created_at)');
    // === 竞赛提醒订阅表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS competition_subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      competition_id INTEGER NOT NULL REFERENCES competitions(id),
      reminder_days INTEGER NOT NULL DEFAULT 3,
      is_notified INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, competition_id)
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON competition_subscriptions(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_subscriptions_comp ON competition_subscriptions(competition_id)');
    // === 学习小组表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS study_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      category TEXT NOT NULL,
      creator_id INTEGER NOT NULL REFERENCES users(id),
      deleted_at TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_study_groups_category ON study_groups(category)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_study_groups_creator ON study_groups(creator_id)');
    // === 学习小组成员表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS study_group_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id),
      role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('admin', 'member')),
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(group_id, user_id)
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_sg_members_group ON study_group_members(group_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_sg_members_user ON study_group_members(user_id)');
    // === 学习小组消息表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS study_group_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id),
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_sg_messages_group ON study_group_messages(group_id)');
    // === 用户徽章表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS user_badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      badge_id TEXT NOT NULL,
      earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, badge_id)
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id)');
    // === 竞赛评分表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS competition_ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      competition_id INTEGER NOT NULL REFERENCES competitions(id),
      difficulty INTEGER NOT NULL CHECK(difficulty >= 1 AND difficulty <= 5),
      value INTEGER NOT NULL CHECK(value >= 1 AND value <= 5),
      recommend INTEGER NOT NULL CHECK(recommend >= 1 AND recommend <= 5),
      comment TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, competition_id)
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_comp_ratings_comp ON competition_ratings(competition_id)');
    // === 获奖作品展示表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS award_showcases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      competition_id INTEGER NOT NULL REFERENCES competitions(id),
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      award_level TEXT NOT NULL,
      award_year INTEGER NOT NULL,
      team_members TEXT DEFAULT NULL,
      project_url TEXT DEFAULT NULL,
      image_urls TEXT DEFAULT NULL,
      review_status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_showcases_comp ON award_showcases(competition_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_showcases_user ON award_showcases(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_showcases_year ON award_showcases(award_year)');
    // === 作品点赞表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS showcase_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      showcase_id INTEGER NOT NULL REFERENCES award_showcases(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(showcase_id, user_id)
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_showcase_likes_showcase ON showcase_likes(showcase_id)');
    // === 队伍任务看板表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS team_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      creator_id INTEGER NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      description TEXT DEFAULT NULL,
      assignee_id INTEGER DEFAULT NULL REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'todo' CHECK(status IN ('todo', 'in_progress', 'done')),
      priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
      due_date TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_team_tasks_team ON team_tasks(team_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_team_tasks_assignee ON team_tasks(assignee_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_team_tasks_status ON team_tasks(status)');
    // === 题库表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      competition_id INTEGER REFERENCES competitions(id),
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      time_limit INTEGER DEFAULT 0,
      pass_score INTEGER DEFAULT 60,
      creator_id INTEGER REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_quizzes_competition ON quizzes(competition_id)');
    // === 题目表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS quiz_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
      question_type TEXT NOT NULL DEFAULT 'single',
      question_text TEXT NOT NULL,
      options TEXT DEFAULT '[]',
      correct_answer TEXT NOT NULL,
      explanation TEXT DEFAULT '',
      points INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON quiz_questions(quiz_id)');
    // === 答题记录表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      quiz_id INTEGER NOT NULL REFERENCES quizzes(id),
      answers TEXT NOT NULL DEFAULT '{}',
      score INTEGER NOT NULL DEFAULT 0,
      total_points INTEGER NOT NULL DEFAULT 0,
      time_spent INTEGER DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON quiz_attempts(quiz_id)');
    // === 导师表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS mentors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
      competition_ids TEXT DEFAULT '[]',
      skills TEXT DEFAULT '[]',
      introduction TEXT NOT NULL,
      achievements TEXT NOT NULL,
      available_time TEXT DEFAULT '',
      max_mentees INTEGER NOT NULL DEFAULT 5,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_mentors_user ON mentors(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_mentors_active ON mentors(is_active)');
    // === 导师申请表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS mentor_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mentee_id INTEGER NOT NULL REFERENCES users(id),
      mentor_id INTEGER NOT NULL REFERENCES users(id),
      competition_id INTEGER REFERENCES competitions(id),
      message TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(mentee_id, mentor_id)
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_mentor_requests_mentee ON mentor_requests(mentee_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_mentor_requests_mentor ON mentor_requests(mentor_id)');
    // === 导师评价表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS mentor_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mentee_id INTEGER NOT NULL REFERENCES users(id),
      mentor_id INTEGER NOT NULL REFERENCES users(id),
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      content TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(mentee_id, mentor_id)
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_mentor_reviews_mentor ON mentor_reviews(mentor_id)');
    // === 队伍文件表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS team_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      uploader_id INTEGER NOT NULL REFERENCES users(id),
      file_name TEXT NOT NULL,
      file_path TEXT DEFAULT NULL,
      file_type TEXT DEFAULT NULL,
      file_size INTEGER DEFAULT 0,
      is_folder INTEGER NOT NULL DEFAULT 0,
      folder_id INTEGER DEFAULT NULL REFERENCES team_files(id),
      description TEXT DEFAULT NULL,
      download_count INTEGER NOT NULL DEFAULT 0,
      deleted_at TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_team_files_team ON team_files(team_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_team_files_folder ON team_files(folder_id)');
    // === 问答问题表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS qa_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      competition_id INTEGER REFERENCES competitions(id),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT DEFAULT '[]',
      view_count INTEGER NOT NULL DEFAULT 0,
      is_pinned INTEGER NOT NULL DEFAULT 0,
      is_solved INTEGER NOT NULL DEFAULT 0,
      deleted_at TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT NULL
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_qa_questions_user ON qa_questions(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_qa_questions_competition ON qa_questions(competition_id)');
    // === 问答回答表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS qa_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      question_id INTEGER NOT NULL REFERENCES qa_questions(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      is_accepted INTEGER NOT NULL DEFAULT 0,
      deleted_at TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT NULL
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_qa_answers_question ON qa_answers(question_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_qa_answers_user ON qa_answers(user_id)');
    // === 问答投票表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS qa_votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      target_type TEXT NOT NULL CHECK(target_type IN ('question', 'answer')),
      target_id INTEGER NOT NULL,
      vote_type INTEGER NOT NULL CHECK(vote_type IN (1, -1)),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, target_type, target_id)
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_qa_votes_target ON qa_votes(target_type, target_id)');
    // === 学习打卡/训练计划表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS study_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      competition_id INTEGER REFERENCES competitions(id),
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      daily_goal TEXT DEFAULT '',
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'completed', 'paused', 'cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_study_plans_user ON study_plans(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_study_plans_status ON study_plans(status)');
    // === 学习打卡记录表 ===
    db.exec(`
    CREATE TABLE IF NOT EXISTS study_checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      plan_id INTEGER NOT NULL REFERENCES study_plans(id) ON DELETE CASCADE,
      content TEXT DEFAULT '',
      duration INTEGER DEFAULT 0,
      checkin_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, plan_id, checkin_date)
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_study_checkins_user ON study_checkins(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_study_checkins_plan ON study_checkins(plan_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_study_checkins_date ON study_checkins(checkin_date)');
}
export function closeDatabase(): void {
    if (db) {
        db.close();
        db = null;
    }
}