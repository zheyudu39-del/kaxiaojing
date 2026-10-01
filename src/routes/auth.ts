/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/auth.ts

import { Router } from 'express';
import { z } from 'zod';
import { AuthError, authService } from '../services/authService';
import { emailService } from '../services/emailService';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AppError } from '../middleware/errorHandler';

const router = Router();
// --- Zod Schemas ---
const registerSchema = z.object({
    username: z.string({ error: '缺少必填字段: username' })
        .min(2, '用户名长度应为2-20个字符')
        .max(20, '用户名长度应为2-20个字符'),
    email: z.string({ error: '缺少必填字段: email' })
        .email('邮箱格式无效'),
    password: z.string({ error: '缺少必填字段: password' })
        .min(6, '密码长度至少为6位')
        .regex(/[A-Z]/, '密码必须包含至少一个大写字母')
        .regex(/[a-z]/, '密码必须包含至少一个小写字母')
        .regex(/[0-9]/, '密码必须包含至少一个数字'),
});
const loginSchema = z.object({
    email: z.string({ error: '缺少必填字段: email' }).min(1, '缺少必填字段: email'),
    password: z.string({ error: '缺少必填字段: password' }).min(1, '缺少必填字段: password'),
});
const forgotPasswordSchema = z.object({
    email: z.string({ error: '请输入邮箱' }).min(1, '请输入邮箱'),
});
const resetPasswordSchema = z.object({
    token: z.string({ error: '缺少必填字段' }).min(1, '缺少必填字段'),
    password: z.string({ error: '缺少必填字段' }).min(6, '密码长度至少为6位'),
});
/**
 * Helper to convert legacy AuthError to AppError so the global errorHandler
 * can process it uniformly.
 */
function mapAuthError(err) {
    if (err instanceof AuthError) {
        const codeMap = {
            400: 'VALIDATION_ERROR',
            401: 'AUTH_ERROR',
            403: 'FORBIDDEN',
            404: 'NOT_FOUND',
            409: 'CONFLICT',
        };
        throw new AppError(err.statusCode, codeMap[err.statusCode] || 'AUTH_ERROR', err.message);
    }
    throw err;
}
// POST /api/auth/register
router.post('/register', validate({ body: registerSchema }), (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = authService.register(username, email, password);
        res.status(201).json(user);
    }
    catch (err) {
        try {
            mapAuthError(err);
        }
        catch (e) {
            next(e);
        }
    }
});
// POST /api/auth/login
router.post('/login', validate({ body: loginSchema }), (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = authService.login(email, password);
        res.json(result);
    }
    catch (err) {
        try {
            mapAuthError(err);
        }
        catch (e) {
            next(e);
        }
    }
});
// POST /api/auth/logout
router.post('/logout', authMiddleware, (_req, res) => {
    res.json({ message: '已成功登出' });
});
// POST /api/auth/forgot-password — 发送密码重置验证码
router.post('/forgot-password', validate({ body: forgotPasswordSchema }), async (req, res, next) => {
    try {
        const { email } = req.body;
        // 检查邮箱是否存在
        authService.generateResetToken(email); // 验证邮箱存在
        // 发送验证码邮件
        await emailService.sendVerificationCode(email);
        res.json({ message: '验证码已发送到您的邮箱' });
    }
    catch (err) {
        if (err instanceof AuthError) {
            try {
                mapAuthError(err);
            }
            catch (e) {
                next(e);
                return;
            }
        }
        res.status(400).json({ error: err.message || '发送失败，请稍后重试' });
    }
});
// POST /api/auth/verify-reset-code — 验证重置密码的验证码（第2步）
const verifyResetCodeSchema = z.object({
    email: z.string({ error: '请输入邮箱' }).email('邮箱格式无效'),
    code: z.string({ error: '请输入验证码' }).length(6, '验证码为6位数字'),
});
// 已验证的重置请求：email -> { token, expiresAt }
const verifiedResets = new Map();
// 清理所有过期的重置 token，防止内存泄漏
function cleanupExpiredResets() {
    const now = Date.now();
    for (const [key, value] of verifiedResets) {
        if (now >= value.expiresAt) {
            verifiedResets.delete(key);
        }
    }
}
// 定期清理过期 token（每小时执行一次）
setInterval(cleanupExpiredResets, 60 * 60 * 1000).unref();
router.post('/verify-reset-code', validate({ body: verifyResetCodeSchema }), (req, res, next) => {
    try {
        const { email, code } = req.body;
        const valid = emailService.verifyCode(email, code);
        if (!valid) {
            res.status(401).json({ error: '验证码错误或已过期' });
            return;
        }
        // 验证码正确，生成临时 token，15分钟有效
        const crypto = require('crypto');
        const token = crypto.randomBytes(32).toString('hex');
        // 写入前先清理所有过期项，防止 Map 无限增长
        cleanupExpiredResets();
        verifiedResets.set(email, { token, expiresAt: Date.now() + 15 * 60 * 1000 });
        res.json({ message: '验证码验证成功', resetToken: token });
    }
    catch (err) {
        try {
            mapAuthError(err);
        }
        catch (e) {
            next(e);
        }
    }
});
// POST /api/auth/reset-password — 通过验证码重置密码
const resetWithCodeSchema = z.object({
    email: z.string({ error: '请输入邮箱' }).email('邮箱格式无效'),
    code: z.string().optional(), // 兼容旧方式
    resetToken: z.string().optional(), // 新方式：用 verify-reset-code 返回的 token
    password: z.string({ error: '请输入新密码' }).min(6, '密码长度至少为6位'),
});
router.post('/reset-password', validate({ body: resetWithCodeSchema }), (req, res, next) => {
    try {
        const { email, code, resetToken, password } = req.body;
        let authorized = false;
        // 优先用 resetToken 验证（新方式）
        if (resetToken) {
            const stored = verifiedResets.get(email);
            if (stored && stored.token === resetToken && Date.now() < stored.expiresAt) {
                authorized = true;
                verifiedResets.delete(email);
            }
        }
        // 兼容旧方式：直接用验证码
        if (!authorized && code) {
            authorized = emailService.verifyCode(email, code);
        }
        if (!authorized) {
            res.status(401).json({ error: '验证码错误或已过期' });
            return;
        }
        // 重置密码
        authService.resetPasswordByEmail(email, password);
        res.json({ message: '密码重置成功' });
    }
    catch (err) {
        try {
            mapAuthError(err);
        }
        catch (e) {
            next(e);
        }
    }
});
const sendCodeSchema = z.object({
    email: z.string({ error: '请输入邮箱' }).email('邮箱格式无效'),
});
const loginCodeSchema = z.object({
    email: z.string({ error: '请输入邮箱' }).email('邮箱格式无效'),
    code: z.string({ error: '请输入验证码' }).length(6, '验证码为6位数字'),
});
// POST /api/auth/send-code — 发送验证码
router.post('/send-code', validate({ body: sendCodeSchema }), async (req, res, next) => {
    try {
        const { email } = req.body;
        await emailService.sendVerificationCode(email);
        res.json({ message: '验证码已发送，请查收邮箱' });
    }
    catch (err) {
        res.status(400).json({ error: err.message || '发送失败，请稍后重试' });
    }
});
// POST /api/auth/login-code — 验证码登录
router.post('/login-code', validate({ body: loginCodeSchema }), (req, res, next) => {
    try {
        const { email, code } = req.body;
        // 验证验证码
        const valid = emailService.verifyCode(email, code);
        if (!valid) {
            res.status(401).json({ error: '验证码错误或已过期' });
            return;
        }
        // 验证码正确，执行登录（用户必须已注册）
        const result = authService.loginByEmail(email);
        res.json(result);
    }
    catch (err) {
        try {
            mapAuthError(err);
        }
        catch (e) {
            next(e);
        }
    }
});
export default router;
