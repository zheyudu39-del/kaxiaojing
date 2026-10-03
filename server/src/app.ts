/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/app.ts

import express from 'express';
import cors from 'cors';
import path from 'path';
import expressRateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';
import { getCorsOptions } from './config/cors';
import auth from './routes/auth';
import competitions from './routes/competitions';
import teams from './routes/teams';
import ranking from './routes/ranking';
import chat from './routes/chat';
import colleges from './routes/colleges';
import majors from './routes/majors';
import profile from './routes/profile';
import favorites from './routes/favorites';
import posts from './routes/posts';
import notifications from './routes/notifications';
import admin from './routes/admin';
import recruitments from './routes/recruitments';
import resources from './routes/resources';
import recommendations from './routes/recommendations';
import privateMessages from './routes/privateMessages';
import teamMatch from './routes/teamMatch';
import dashboard from './routes/dashboard';
import competitionExtras from './routes/competitionExtras';
import registrations from './routes/registrations';
import follows from './routes/follows';
import search from './routes/search';
import onlineStatus from './routes/onlineStatus';
import exportRoutes from './routes/export';
import feedback from './routes/feedback';
import prepTodos from './routes/prepTodos';
import activities from './routes/activities';
import competitionCompare from './routes/competitionCompare';
import subscriptions from './routes/subscriptions';
import studyGroups from './routes/studyGroups';
import ratings from './routes/ratings';
import kanban from './routes/kanban';
import timeline from './routes/timeline';
import recommend from './routes/recommend';
import teamFiles from './routes/teamFiles';
import qa from './routes/qa';
import studyCheckin from './routes/studyCheckin';
import studyBuddy from './routes/studyBuddy';
import notebook from './routes/notebook';
import awardCert from './routes/awardCert';

const app = express();
// 信任反向代理（单层），使 req.ip / req.protocol 等反映真实客户端信息
app.set('trust proxy', 1);
// 结构化请求日志 — 必须在所有其他中间件之前
app.use(requestLogger);
// CORS configuration - dynamic from environment
app.use(cors(getCorsOptions()));
// JSON body parser
app.use(express.json());
// API 请求频率限制 — 从环境变量读取参数
const rateLimitWindowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);
const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX || '200', 10);
const authRateLimitMax = parseInt(process.env.AUTH_RATE_LIMIT_MAX || '20', 10);
const apiLimiter = expressRateLimit({
    windowMs: rateLimitWindowMs,
    max: rateLimitMax,
    message: { error: '请求过于频繁，请稍后再试' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', apiLimiter);
// 登录/注册更严格的限制
const authLimiter = expressRateLimit({
    windowMs: rateLimitWindowMs,
    max: authRateLimitMax,
    message: { error: '登录尝试过于频繁，请15分钟后再试' },
});
app.use('/api/auth', authLimiter);
// CSRF 防护 — 要求非 GET 请求携带自定义头 + Origin/Referer 域名验证
app.use('/api/', (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method))
        return next();
    // 登录/注册/重置密码不需要 CSRF 保护（使用 JWT 认证）
    if (req.path.startsWith('/auth/'))
        return next();
    // 允许 multipart/form-data (文件上传)
    const ct = req.headers['content-type'] || '';
    if (ct.includes('multipart/form-data'))
        return next();
    // 同源请求放行：无 Origin/Referer，或 Origin/Referer 匹配当前 Host
    const origin = req.headers['origin'];
    const referer = req.headers['referer'];
    const host = req.headers['host'];
    // 调试日志（已确认CSRF正常）
    // console.log('[CSRF]', req.method, req.path, { origin, referer, host, xrw: req.headers['x-requested-with'] });
    // 无 Origin 且无 Referer → 同源请求
    if (!origin && !referer)
        return next();
    // Origin 或 Referer 的 host 部分匹配当前 Host → 同源
    const requestOrigin = origin || (() => {
        try {
            return new URL(referer).origin;
        }
        catch {
            return '';
        }
    })();
    if (requestOrigin && host) {
        try {
            const originHost = new URL(requestOrigin).host;
            if (originHost === host) {
                return next();
            }
        }
        catch { /* continue to check */ }
    }
    // 跨域请求：检查自定义头
    const csrfHeader = req.headers['x-requested-with'];
    if (csrfHeader !== 'XMLHttpRequest') {
        res.status(403).json({ error: 'CSRF验证失败' });
        return;
    }
    // 验证 Origin 或 Referer 头与允许的域名列表匹配
    const rawOrigins = getCorsOptions().origin;
    const allowedOrigins: string[] = Array.isArray(rawOrigins)
        ? (rawOrigins as unknown[]).filter((o): o is string => typeof o === 'string')
        : typeof rawOrigins === 'string'
            ? [rawOrigins]
            : [];
    if (requestOrigin && !allowedOrigins.includes(requestOrigin)) {
        res.status(403).json({ error: 'CSRF验证失败：来源不在允许列表中' });
        return;
    }
    next();
});
// Register routes
app.use('/api/auth', auth);
app.use('/api/competitions/compare', competitionCompare);
app.use('/api/competitions', competitions);
app.use('/api/ranking', ranking);
app.use('/api/teams', teams);
app.use('/api/teams', chat); // Chat routes: /api/teams/:teamId/messages
app.use('/api/colleges', colleges);
app.use('/api/majors', majors);
app.use('/api/profile', profile);
app.use('/api/favorites', favorites);
app.use('/api/posts', posts);
app.use('/api/notifications', notifications);
app.use('/api/admin', admin);
app.use('/api/recruitments', recruitments);
app.use('/api/resources', resources);
app.use('/api/recommendations', recommendations);
app.use('/api/private-messages', privateMessages);
app.use('/api/team-match', teamMatch);
app.use('/api/dashboard', dashboard);
app.use('/api/competitions', competitionExtras);
app.use('/api/registrations', registrations);
app.use('/api/follows', follows);
app.use('/api/search', search);
app.use('/api/users/online-status', onlineStatus);
app.use('/api/export', exportRoutes);
app.use('/api/feedback', feedback);
app.use('/api/prep-todos', prepTodos);
app.use('/api/activities', activities);
app.use('/api/subscriptions', subscriptions);
app.use('/api/study-groups', studyGroups);
app.use('/api/ratings', ratings);
app.use('/api/kanban', kanban);
app.use('/api/timeline', timeline);
app.use('/api/recommend', recommend);
app.use('/api/team-files', teamFiles);
app.use('/api/qa', qa);
app.use('/api/study-checkin', studyCheckin);
app.use('/api/study-buddy', studyBuddy);
app.use('/api/notebook', notebook);
app.use('/api/award-certs', awardCert);
// Serve public uploaded files only. Private team files must go through authenticated download routes.
const uploadBasePath = path.join(__dirname, '..', 'data', 'uploads');
const uploadStaticOptions = {
    setHeaders: (res) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
    },
};
app.use('/uploads/avatars', express.static(path.join(uploadBasePath, 'avatars'), uploadStaticOptions));
app.use('/uploads/proofs', express.static(path.join(uploadBasePath, 'proofs'), uploadStaticOptions));
app.use('/uploads/resources', express.static(path.join(uploadBasePath, 'resources'), uploadStaticOptions));
// 生产环境：托管前端静态文件
const clientDistPath = path.join(__dirname, '..', '..', 'client', 'dist');
// Service Worker 文件不缓存，确保浏览器总是获取最新版本
app.get('/sw.js', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(clientDistPath, 'sw.js'));
});
app.use(express.static(clientDistPath));
// 所有非 API 路由返回 index.html（SPA 路由支持）
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/') || req.path.startsWith('/socket.io/')) {
        return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
});
// 全局错误处理中间件（必须在所有路由之后注册）
app.use(errorHandler);
export default app;
