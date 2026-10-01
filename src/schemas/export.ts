/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/schemas/export.ts

import { z } from 'zod';

/**
 * 支持的导出数据类型
 */
export const EXPORT_DATA_TYPES: readonly ["competitions", "participations", "teams", "awards", "statistics", "resources"] = [
    'competitions',
    'participations',
    'teams',
    'awards',
    'statistics',
    'resources',
];
/**
 * 支持的导出格式
 */
export const EXPORT_FORMATS: readonly ["csv", "xlsx"] = ['csv', 'xlsx'];
/**
 * ISO 日期字符串正则（YYYY-MM-DD）
 */
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
/**
 * 路由参数校验：dataType 枚举
 * 用于 GET /api/export/:dataType
 */
export const exportParamsSchema = z.object({
    dataType: z.enum(EXPORT_DATA_TYPES, {
        message: '不支持的数据类型，支持: competitions, participations, teams, awards, statistics, resources',
    }),
});
/**
 * 查询参数校验：format、startDate、endDate、category
 * 用于 GET /api/export/:dataType?format=csv&startDate=...&endDate=...&category=...
 */
export const exportQuerySchema = z.object({
    format: z.enum(EXPORT_FORMATS, {
        message: '不支持的导出格式，支持: csv, xlsx',
    }),
    startDate: z
        .string()
        .regex(isoDateRegex, '日期格式无效，请使用 YYYY-MM-DD 格式')
        .optional(),
    endDate: z
        .string()
        .regex(isoDateRegex, '日期格式无效，请使用 YYYY-MM-DD 格式')
        .optional(),
    category: z
        .string()
        .min(1, '类别不能为空字符串')
        .optional(),
});
/**
 * 管理员批量导出查询参数校验
 * 用于 GET /api/export/admin/batch?format=xlsx&dataTypes=competitions,awards
 */
export const batchExportQuerySchema = z.object({
    format: z.enum(EXPORT_FORMATS, {
        message: '不支持的导出格式，支持: csv, xlsx',
    }),
    dataTypes: z
        .string()
        .min(1, '请指定至少一个数据类型')
        .refine((val) => {
        const types = val.split(',').map((t) => t.trim());
        return types.every((t) => EXPORT_DATA_TYPES.includes(t));
    }, {
        message: '包含不支持的数据类型，支持: competitions, participations, teams, awards, statistics, resources',
    }),
});