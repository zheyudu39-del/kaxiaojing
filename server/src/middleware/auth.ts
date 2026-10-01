/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/middleware/auth.ts

import { authService, AuthError } from '../services/authService';

// ===== 类型定义（自 .d.ts 还原）=====
import type { Request, Response, NextFunction } from 'express';
import type { TokenPayload } from '../services/authService';
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ error: '请先登录' });
        return;
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        res.status(401).json({ error: '请先登录' });
        return;
    }
    const token = parts[1];
    try {
        const payload = authService.verifyToken(token);
        req.user = payload;
        next();
    }
    catch (err) {
        if (err instanceof AuthError) {
            res.status(err.statusCode).json({ error: err.message });
        }
        else {
            res.status(401).json({ error: '认证已过期，请重新登录' });
        }
    }
}
// 可选认证中间件 - 有token则解析，无token也放行
export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        next();
        return;
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        next();
        return;
    }
    const token = parts[1];
    try {
        const payload = authService.verifyToken(token);
        req.user = payload;
    }
    catch {
        // 忽略token错误，继续处理请求
    }
    next();
}