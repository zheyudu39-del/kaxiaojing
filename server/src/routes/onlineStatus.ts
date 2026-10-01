/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/onlineStatus.ts

import { Router } from 'express';
import { isUserOnline } from '../socket/index';

const router = Router();
/**
 * GET /
 * Query param: userIds (comma-separated list of user IDs)
 * Returns: { [userId: string]: boolean }
 */
router.get('/', (req, res) => {
    const userIdsParam = req.query.userIds;
    if (!userIdsParam) {
        res.json({});
        return;
    }
    const userIds = userIdsParam
        .split(',')
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id));
    const result = {};
    for (const userId of userIds) {
        result[String(userId)] = isUserOnline(userId);
    }
    res.json(result);
});
export default router;
