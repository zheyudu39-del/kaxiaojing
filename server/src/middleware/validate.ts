/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/middleware/validate.ts

// ===== 类型定义（自 .d.ts 还原）=====
import type { ZodSchema } from 'zod';
import type { Request, Response, NextFunction } from 'express';
interface ValidationSchemas {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}

/**
 * Escape HTML special characters to prevent XSS.
 * Handles: < > & " '
 */
export function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}
/**
 * Recursively trim and HTML-escape all string values in a data structure.
 */
function sanitize(data) {
    if (typeof data === 'string') {
        return escapeHtml(data.trim());
    }
    if (Array.isArray(data)) {
        return data.map(sanitize);
    }
    if (data !== null && typeof data === 'object') {
        const result = {};
        for (const [key, value] of Object.entries(data)) {
            result[key] = sanitize(value);
        }
        return result;
    }
    return data;
}
/**
 * Express middleware factory that validates request body, query, and params
 * against Zod schemas. On success, replaces req fields with parsed + sanitized
 * data. On failure, returns 400 with all field errors.
 */
export function validate(schemas: ValidationSchemas): (req: Request, res: Response, next: NextFunction) => void {
    return (req, res, next) => {
        const errors = [];
        if (schemas.body) {
            const result = schemas.body.safeParse(req.body);
            if (!result.success) {
                errors.push(...result.error.issues.map((i) => ({
                    field: i.path.join('.'),
                    message: i.message,
                })));
            }
            else {
                req.body = sanitize(result.data);
            }
        }
        if (schemas.query) {
            const result = schemas.query.safeParse(req.query);
            if (!result.success) {
                errors.push(...result.error.issues.map((i) => ({
                    field: i.path.join('.'),
                    message: i.message,
                })));
            }
            else {
                req.query = sanitize(result.data);
            }
        }
        if (schemas.params) {
            const result = schemas.params.safeParse(req.params);
            if (!result.success) {
                errors.push(...result.error.issues.map((i) => ({
                    field: i.path.join('.'),
                    message: i.message,
                })));
            }
            else {
                req.params = sanitize(result.data);
            }
        }
        if (errors.length > 0) {
            res.status(400).json({
                error: '输入验证失败',
                code: 'VALIDATION_ERROR',
                details: { fields: errors },
            });
            return;
        }
        next();
    };
}