/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/authService.ts

import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import jsonwebtoken from 'jsonwebtoken';
import { getDb } from '../db/database';
import { loadEnvConfig } from '../config/env';

// ===== 类型定义（自 .d.ts 还原）=====
export interface User {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    created_at: string;
}
export interface TokenPayload {
    userId: number;
    email: string;
    role: string;
}

const JWT_EXPIRES_IN = '24h';
const BCRYPT_COST_FACTOR = 10;
function getJwtSecret() {
    return loadEnvConfig().JWT_SECRET;
}
export class AuthService {
    register(username: string, email: string, password: string): Omit<User, 'password_hash'> {
        const db = getDb();
        // Check if email already exists
        const existing = db.prepare('SELECT id FROM users WHERE email = @email').get({ email });
        if (existing) {
            throw new AuthError('该邮箱已被注册', 409);
        }
        // Hash password
        const password_hash = bcryptjs.hashSync(password, BCRYPT_COST_FACTOR);
        // First non-system user gets admin role
        const userCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE id > 1').get();
        const role = userCount.count === 0 ? 'admin' : 'user';
        // Insert user
        let result;
        try {
            result = db.prepare('INSERT INTO users (username, email, password_hash, role) VALUES (@username, @email, @password_hash, @role)').run({ username, email, password_hash, role });
        }
        catch (err) {
            // 并发注册时查重与 INSERT 之间可能产生竞争，捕获 UNIQUE 约束错误转为友好提示
            if (err && (err.code === 'SQLITE_CONSTRAINT' || err.code === 'SQLITE_CONSTRAINT_UNIQUE')) {
                throw new AuthError('该邮箱已被注册', 409);
            }
            throw err;
        }
        return {
            id: result.lastInsertRowid,
            username,
            email,
            created_at: new Date().toISOString(),
        };
    }
    login(email: string, password: string): { token: string; user: { id: number; username: string; email: string; role: string; }; } {
        const db = getDb();
        const user = db.prepare('SELECT * FROM users WHERE email = @email').get({ email });
        if (!user) {
            throw new AuthError('邮箱或密码错误', 401);
        }
        const valid = bcryptjs.compareSync(password, user.password_hash);
        if (!valid) {
            throw new AuthError('邮箱或密码错误', 401);
        }
        const payload = { userId: user.id, email: user.email, role: user.role };
        const token = jsonwebtoken.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
        return {
            token,
            user: { id: user.id, username: user.username, email: user.email, role: user.role || 'user' },
        };
    }
    /** 通过邮箱直接登录（验证码登录用，不需要密码） */
    loginByEmail(email: string): { token: string; user: { id: number; username: string; email: string; role: string; }; } {
        const db = getDb();
        const user = db.prepare('SELECT * FROM users WHERE email = @email').get({ email });
        if (!user) {
            throw new AuthError('该邮箱未注册，请先注册账号', 404);
        }
        const payload = { userId: user.id, email: user.email, role: user.role };
        const token = jsonwebtoken.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
        return {
            token,
            user: { id: user.id, username: user.username, email: user.email, role: user.role || 'user' },
        };
    }
    verifyToken(token: string): TokenPayload {
        try {
            const decoded = jsonwebtoken.verify(token, getJwtSecret());
            return decoded;
        }
        catch {
            throw new AuthError('认证已过期，请重新登录', 401);
        }
    }
    generateResetToken(email: string): string {
        const db = getDb();
        const user = db.prepare('SELECT id FROM users WHERE email = @email').get({ email });
        if (!user)
            throw new AuthError('该邮箱未注册', 404);
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min
        db.prepare('UPDATE users SET reset_token = @token, reset_token_expires = @expires WHERE id = @id')
            .run({ token, expires, id: user.id });
        return token;
    }
    resetPassword(token: string, newPassword: string): void {
        const db = getDb();
        const user = db.prepare('SELECT id, reset_token_expires FROM users WHERE reset_token = @token').get({ token });
        if (!user)
            throw new AuthError('重置链接无效', 400);
        if (new Date(user.reset_token_expires) < new Date())
            throw new AuthError('重置链接已过期', 400);
        const password_hash = bcryptjs.hashSync(newPassword, BCRYPT_COST_FACTOR);
        db.prepare('UPDATE users SET password_hash = @hash, reset_token = NULL, reset_token_expires = NULL WHERE id = @id')
            .run({ hash: password_hash, id: user.id });
    }
    /** 通过邮箱直接重置密码（验证码验证后使用） */
    resetPasswordByEmail(email: string, newPassword: string): void {
        const db = getDb();
        const user = db.prepare('SELECT id FROM users WHERE email = @email').get({ email });
        if (!user)
            throw new AuthError('该邮箱未注册', 404);
        const password_hash = bcryptjs.hashSync(newPassword, BCRYPT_COST_FACTOR);
        db.prepare('UPDATE users SET password_hash = @hash, reset_token = NULL, reset_token_expires = NULL WHERE id = @id')
            .run({ hash: password_hash, id: user.id });
    }
}
export class AuthError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message);
        this.name = 'AuthError';
        this.statusCode = statusCode;
    }
}
export const authService: AuthService = new AuthService();