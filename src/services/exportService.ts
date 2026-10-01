/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/exportService.ts

import { getDb } from '../db/database';
import { CsvSerializer } from './csvSerializer';
import { XlsxGenerator } from './xlsxGenerator';

// ===== 类型定义（自 .d.ts 还原）=====
import type { ColumnDef } from './csvSerializer';
export interface ExportFilters {
    startDate?: string;
    endDate?: string;
    category?: string;
}
export type ExportDataType = 'competitions' | 'participations' | 'teams' | 'awards' | 'statistics' | 'resources';
export interface ExportOptions {
    dataType: ExportDataType;
    format: 'csv' | 'xlsx';
    filters: ExportFilters;
    userId?: number;
    isAdmin: boolean;
}

// --- Column definitions ---
export const competitionColumns: ColumnDef[] = [
    { key: 'name', header: '竞赛名称' },
    { key: 'category', header: '类别' },
    { key: 'format', header: '参赛形式' },
    { key: 'fee', header: '费用' },
    { key: 'reg_start_month', header: '报名开始月份' },
    { key: 'reg_end_month', header: '报名结束月份' },
    { key: 'target_audience', header: '面向对象' },
];
export const participationColumns: ColumnDef[] = [
    { key: 'competition_name', header: '竞赛名称' },
    { key: 'team_name', header: '团队名称' },
    { key: 'status', header: '报名状态' },
    { key: 'joined_at', header: '加入时间' },
];
export const teamColumns: ColumnDef[] = [
    { key: 'team_name', header: '团队名称' },
    { key: 'competition_name', header: '所属竞赛' },
    { key: 'leader_name', header: '队长' },
    { key: 'member_count', header: '成员数' },
    { key: 'created_at', header: '创建时间' },
];
export const awardColumns: ColumnDef[] = [
    { key: 'competition_name', header: '竞赛名称' },
    { key: 'username', header: '获奖者' },
    { key: 'award_level', header: '获奖等级' },
    { key: 'award_date', header: '获奖日期' },
];
export const statisticsColumns: ColumnDef[] = [
    { key: 'competition_name', header: '竞赛名称' },
    { key: 'category', header: '类别' },
    { key: 'team_count', header: '团队数' },
    { key: 'participant_count', header: '参与人数' },
    { key: 'award_count', header: '获奖数' },
];
export const resourceColumns: ColumnDef[] = [
    { key: 'title', header: '资源标题' },
    { key: 'competition_name', header: '所属竞赛' },
    { key: 'file_type', header: '文件类型' },
    { key: 'file_size', header: '文件大小' },
    { key: 'download_count', header: '下载量' },
    { key: 'created_at', header: '上传时间' },
];
export const columnsByDataType: Record<ExportDataType, ColumnDef[]> = {
    competitions: competitionColumns,
    participations: participationColumns,
    teams: teamColumns,
    awards: awardColumns,
    statistics: statisticsColumns,
    resources: resourceColumns,
};
// --- Helper: build WHERE conditions from filters ---
function buildDateConditions(filters, dateColumn, conditions, params) {
    if (filters.startDate) {
        conditions.push(`${dateColumn} >= @startDate`);
        params.startDate = filters.startDate;
    }
    if (filters.endDate) {
        conditions.push(`${dateColumn} <= @endDate`);
        params.endDate = filters.endDate;
    }
}
function buildCategoryCondition(filters, categoryColumn, conditions, params) {
    if (filters.category) {
        conditions.push(`${categoryColumn} = @category`);
        params.category = filters.category;
    }
}
function buildWhereClause(conditions) {
    return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
}
// --- Constants ---
export const BATCH_SIZE = 1000;
export const MAX_EXPORT_ROWS = 10000;
// --- ExportService ---
export class ExportService {
    private csvSerializer;
    private xlsxGenerator;
    constructor() {
        this.csvSerializer = new CsvSerializer();
        this.xlsxGenerator = new XlsxGenerator();
    }
    /**
     * Execute a query with batch pagination when total rows exceed BATCH_SIZE.
     * First runs a COUNT query, then fetches in batches of BATCH_SIZE using LIMIT/OFFSET.
     * Caps total rows at MAX_EXPORT_ROWS.
     */
    queryWithBatching(selectSql, fromAndWhereSql, orderBySql, params) {
        const db = getDb();
        // Count total rows
        const countSql = `SELECT COUNT(*) AS total ${fromAndWhereSql}`;
        const { total } = db.prepare(countSql).get(params);
        // Cap at MAX_EXPORT_ROWS
        const effectiveTotal = Math.min(total, MAX_EXPORT_ROWS);
        if (effectiveTotal <= BATCH_SIZE) {
            // Small dataset — single query with limit
            const sql = `${selectSql} ${fromAndWhereSql} ${orderBySql} LIMIT ${effectiveTotal}`;
            return db.prepare(sql).all(params);
        }
        // Large dataset — batch query with LIMIT/OFFSET
        const allRows = [];
        for (let offset = 0; offset < effectiveTotal; offset += BATCH_SIZE) {
            const limit = Math.min(BATCH_SIZE, effectiveTotal - offset);
            const sql = `${selectSql} ${fromAndWhereSql} ${orderBySql} LIMIT ${limit} OFFSET ${offset}`;
            const batch = db.prepare(sql).all(params);
            allRows.push(...batch);
        }
        return allRows;
    }
    queryCompetitions(filters: ExportFilters, _userId?: number, _isAdmin?: boolean): any[] {
        const conditions = ['c.deleted_at IS NULL'];
        const params = {};
        buildCategoryCondition(filters, 'c.category', conditions, params);
        const selectSql = `SELECT c.name, c.category, c.format, c.fee,
             c.reg_start_month, c.reg_end_month, c.target_audience`;
        const fromAndWhereSql = `FROM competitions c
      ${buildWhereClause(conditions)}`;
        const orderBySql = `ORDER BY c.id`;
        return this.queryWithBatching(selectSql, fromAndWhereSql, orderBySql, params);
    }
    queryParticipations(filters: ExportFilters, userId?: number, isAdmin?: boolean): any[] {
        const conditions = [];
        const params = {};
        if (!isAdmin && userId != null) {
            conditions.push('tm.user_id = @userId');
            params.userId = userId;
        }
        buildDateConditions(filters, 'tm.joined_at', conditions, params);
        buildCategoryCondition(filters, 'c.category', conditions, params);
        conditions.push('c.deleted_at IS NULL');
        const selectSql = `SELECT c.name AS competition_name, t.name AS team_name,
             CASE WHEN tm.user_id IS NOT NULL THEN 'joined' ELSE 'pending' END AS status,
             tm.joined_at`;
        const fromAndWhereSql = `FROM team_members tm
      JOIN teams t ON tm.team_id = t.id
      JOIN competitions c ON t.competition_id = c.id
      ${buildWhereClause(conditions)}`;
        const orderBySql = `ORDER BY tm.joined_at DESC`;
        return this.queryWithBatching(selectSql, fromAndWhereSql, orderBySql, params);
    }
    queryTeams(filters: ExportFilters, userId?: number, isAdmin?: boolean): any[] {
        const conditions = [];
        const params = {};
        if (!isAdmin && userId != null) {
            conditions.push('t.id IN (SELECT team_id FROM team_members WHERE user_id = @userId)');
            params.userId = userId;
        }
        buildDateConditions(filters, 't.created_at', conditions, params);
        buildCategoryCondition(filters, 'c.category', conditions, params);
        conditions.push('c.deleted_at IS NULL');
        const selectSql = `SELECT t.name AS team_name, c.name AS competition_name,
             u.username AS leader_name,
             (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) AS member_count,
             t.created_at`;
        const fromAndWhereSql = `FROM teams t
      JOIN competitions c ON t.competition_id = c.id
      JOIN users u ON t.leader_id = u.id
      ${buildWhereClause(conditions)}`;
        const orderBySql = `ORDER BY t.created_at DESC`;
        return this.queryWithBatching(selectSql, fromAndWhereSql, orderBySql, params);
    }
    queryAwards(filters: ExportFilters, userId?: number, isAdmin?: boolean): any[] {
        const conditions = [];
        const params = {};
        if (!isAdmin && userId != null) {
            conditions.push('a.user_id = @userId');
            params.userId = userId;
        }
        buildDateConditions(filters, 'a.award_date', conditions, params);
        buildCategoryCondition(filters, 'c.category', conditions, params);
        conditions.push('c.deleted_at IS NULL');
        const selectSql = `SELECT c.name AS competition_name, u.username,
             a.award_level, a.award_date`;
        const fromAndWhereSql = `FROM awards a
      JOIN competitions c ON a.competition_id = c.id
      JOIN users u ON a.user_id = u.id
      ${buildWhereClause(conditions)}`;
        const orderBySql = `ORDER BY a.award_date DESC`;
        return this.queryWithBatching(selectSql, fromAndWhereSql, orderBySql, params);
    }
    queryStatistics(filters: ExportFilters): any[] {
        const conditions = ['c.deleted_at IS NULL'];
        const params = {};
        buildCategoryCondition(filters, 'c.category', conditions, params);
        // Statistics uses subqueries per row, so we use queryWithBatching for consistency
        const selectSql = `SELECT c.name AS competition_name, c.category,
             (SELECT COUNT(*) FROM teams t2 WHERE t2.competition_id = c.id) AS team_count,
             (SELECT COUNT(*) FROM team_members tm2
              JOIN teams t3 ON tm2.team_id = t3.id
              WHERE t3.competition_id = c.id) AS participant_count,
             (SELECT COUNT(*) FROM awards a2 WHERE a2.competition_id = c.id) AS award_count`;
        const fromAndWhereSql = `FROM competitions c
      ${buildWhereClause(conditions)}`;
        const orderBySql = `ORDER BY c.id`;
        return this.queryWithBatching(selectSql, fromAndWhereSql, orderBySql, params);
    }
    queryResources(filters: ExportFilters, userId?: number, isAdmin?: boolean): any[] {
        const conditions = ['r.deleted_at IS NULL', 'c.deleted_at IS NULL'];
        const params = {};
        if (!isAdmin && userId != null) {
            conditions.push('r.user_id = @userId');
            params.userId = userId;
        }
        buildDateConditions(filters, 'r.created_at', conditions, params);
        buildCategoryCondition(filters, 'c.category', conditions, params);
        const selectSql = `SELECT r.title, c.name AS competition_name,
             r.file_type, r.file_size, r.download_count, r.created_at`;
        const fromAndWhereSql = `FROM resources r
      JOIN competitions c ON r.competition_id = c.id
      ${buildWhereClause(conditions)}`;
        const orderBySql = `ORDER BY r.created_at DESC`;
        return this.queryWithBatching(selectSql, fromAndWhereSql, orderBySql, params);
    }
    async export(options: ExportOptions): Promise<Buffer> {
        const { dataType, format, filters, userId, isAdmin } = options;
        const columns = columnsByDataType[dataType];
        const rows = this.queryData(dataType, filters, userId, isAdmin);
        if (format === 'csv') {
            return this.csvSerializer.serialize(columns, rows);
        }
        return this.xlsxGenerator.generate(dataType, columns, rows);
    }
    queryData(dataType, filters, userId, isAdmin) {
        switch (dataType) {
            case 'competitions':
                return this.queryCompetitions(filters, userId, isAdmin);
            case 'participations':
                return this.queryParticipations(filters, userId, isAdmin);
            case 'teams':
                return this.queryTeams(filters, userId, isAdmin);
            case 'awards':
                return this.queryAwards(filters, userId, isAdmin);
            case 'statistics':
                return this.queryStatistics(filters);
            case 'resources':
                return this.queryResources(filters, userId, isAdmin);
            default:
                throw new Error(`Unsupported data type: ${dataType}`);
        }
    }
}
export const exportService: ExportService = new ExportService();