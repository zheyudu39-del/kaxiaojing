/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/middleware/logger.ts

// ===== 类型定义（自 .d.ts 还原）=====
import type { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    res.on('finish', () => {
        const entry = {
            timestamp: new Date().toISOString(),
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            responseTimeMs: Date.now() - start,
            ...(req.user?.userId != null && { userId: req.user.userId }),
        };
        console.log(JSON.stringify(entry));
    });
    next();
}