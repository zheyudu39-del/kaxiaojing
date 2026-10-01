/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/middleware/errorHandler.ts

// ===== 类型定义（自 .d.ts 还原）=====
import type { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
    statusCode: number;
    code: string;
    details?: object | undefined;
    constructor(statusCode: number, code: string, message: string, details?: object | undefined) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.name = 'AppError';
    }
}
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            error: err.message,
            code: err.code,
            ...(err.details && { details: err.details }),
        });
        return;
    }
    // 未知错误 - 记录日志，隐藏细节
    console.error(`[ERROR] ${req.method} ${req.path}:`, err);
    res.status(500).json({
        error: '服务器内部错误',
        code: 'INTERNAL_ERROR',
    });
}