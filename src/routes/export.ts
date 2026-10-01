/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/export.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { validate } from '../middleware/validate';
import { batchExportQuerySchema, exportParamsSchema, exportQuerySchema } from '../schemas/export';
import { columnsByDataType, exportService } from '../services/exportService';
import { XlsxGenerator } from '../services/xlsxGenerator';
import { getDb } from '../db/database';

const router = Router();
const CONTENT_TYPES = {
    csv: 'text/csv; charset=utf-8',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};
function getFileExtension(format) {
    return format === 'xlsx' ? 'xlsx' : 'csv';
}
function isUserAdmin(userId) {
    const db = getDb();
    const user = db.prepare('SELECT role FROM users WHERE id = @id').get({ id: userId });
    return user?.role === 'admin';
}
// GET /api/export/admin/batch — 管理员批量导出（必须在 /:dataType 之前定义）
router.get('/admin/batch', authMiddleware, adminMiddleware, validate({ query: batchExportQuerySchema }), async (req, res) => {
    try {
        const { format, dataTypes: dataTypesStr } = req.query;
        const dataTypes = dataTypesStr.split(',').map((t) => t.trim());
        const filters = {};
        if (format === 'xlsx') {
            const xlsxGenerator = new XlsxGenerator();
            const sheets = dataTypes.map((dt) => ({
                name: dt,
                columns: columnsByDataType[dt],
                rows: getQueryRows(dt, filters, undefined, true),
            }));
            const buffer = await xlsxGenerator.generateMultiSheet(sheets);
            res.setHeader('Content-Type', CONTENT_TYPES.xlsx);
            res.setHeader('Content-Disposition', `attachment; filename="batch-export.xlsx"`);
            res.send(buffer);
        }
        else {
            // CSV: export the first data type
            const dt = dataTypes[0];
            const buffer = await exportService.export({
                dataType: dt,
                format: 'csv',
                filters,
                isAdmin: true,
            });
            res.setHeader('Content-Type', CONTENT_TYPES.csv);
            res.setHeader('Content-Disposition', `attachment; filename="${dt}.csv"`);
            res.send(buffer);
        }
    }
    catch {
        res.status(500).json({ error: '导出失败，请稍后重试' });
    }
});
// GET /api/export/:dataType — 普通导出（需认证）
router.get('/:dataType', authMiddleware, validate({ params: exportParamsSchema, query: exportQuerySchema }), async (req, res) => {
    try {
        const { dataType } = req.params;
        const { format, startDate, endDate, category } = req.query;
        const isAdmin = isUserAdmin(req.user.userId);
        const filters = { startDate, endDate, category };
        const buffer = await exportService.export({
            dataType,
            format,
            filters,
            userId: isAdmin ? undefined : req.user.userId,
            isAdmin,
        });
        const ext = getFileExtension(format);
        res.setHeader('Content-Type', CONTENT_TYPES[format]);
        res.setHeader('Content-Disposition', `attachment; filename="${dataType}.${ext}"`);
        res.send(buffer);
    }
    catch {
        res.status(500).json({ error: '导出失败，请稍后重试' });
    }
});
/**
 * Helper to query data rows for a given data type.
 * Used by batch export to get rows per type without going through the full export pipeline.
 */
function getQueryRows(dataType, filters, userId, isAdmin) {
    switch (dataType) {
        case 'competitions':
            return exportService.queryCompetitions(filters, userId, isAdmin);
        case 'participations':
            return exportService.queryParticipations(filters, userId, isAdmin);
        case 'teams':
            return exportService.queryTeams(filters, userId, isAdmin);
        case 'awards':
            return exportService.queryAwards(filters, userId, isAdmin);
        case 'statistics':
            return exportService.queryStatistics(filters);
        case 'resources':
            return exportService.queryResources(filters, userId, isAdmin);
        default:
            return [];
    }
}
export default router;
