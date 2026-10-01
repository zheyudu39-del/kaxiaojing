/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/middleware/admin.ts

import { getDb } from '../db/database';

// ===== 类型定义（自 .d.ts 还原）=====
import type { Request, Response, NextFunction } from 'express';

export function adminMiddleware(req: Request, res: Response, next: NextFunction): void {
    if (!req.user) {
        res.status(401).json({ error: '请先登录' });
        return;
    }
    const db = getDb();
    const user = db.prepare('SELECT role FROM users WHERE id = @id').get({ id: req.user.userId });
    if (!user || user.role !== 'admin') {
        res.status(403).json({ error: '需要管理员权限' });
        return;
    }
    next();
}