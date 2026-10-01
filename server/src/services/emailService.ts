/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/emailService.ts

import nodemailer from 'nodemailer';
import { loadEnvConfig } from '../config/env';
import { getDb } from '../db/database';

const CODE_EXPIRY_MS = 10 * 60 * 1000; // 10分钟
const RATE_LIMIT_MS = 60 * 1000; // 60秒内只能发一次
// 发送频率限制：email -> lastSentAt（频率限制用内存即可）
const rateLimitStore = new Map();
function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
function getTransporter() {
    const env = loadEnvConfig();
    return nodemailer.createTransport({
        host: env.SMTP_HOST || 'smtp.qq.com',
        port: parseInt(env.SMTP_PORT || '465', 10),
        secure: true,
        auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
        },
    });
}
/** 确保验证码表存在 */
function ensureCodeTable() {
    const db = getDb();
    db.exec(`
    CREATE TABLE IF NOT EXISTS verification_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_vcode_email ON verification_codes(email)');
}
export class EmailService {
    /** 发送验证码到指定邮箱 */
    async sendVerificationCode(email: string): Promise<void> {
        // 频率限制
        const lastSent = rateLimitStore.get(email);
        if (lastSent && Date.now() - lastSent < RATE_LIMIT_MS) {
            const wait = Math.ceil((RATE_LIMIT_MS - (Date.now() - lastSent)) / 1000);
            throw new Error(`请${wait}秒后再试`);
        }
        const code = generateCode();
        // 先写库（存验证码 + 设频率限制），再发邮件，避免邮件发送失败却已占用频率配额
        ensureCodeTable();
        const db = getDb();
        // 先删除该邮箱旧的验证码
        db.prepare('DELETE FROM verification_codes WHERE email = @email').run({ email });
        // 插入新验证码
        const expiresAt = Date.now() + CODE_EXPIRY_MS;
        db.prepare('INSERT INTO verification_codes (email, code, expires_at) VALUES (@email, @code, @expiresAt)')
            .run({ email, code, expiresAt });
        rateLimitStore.set(email, Date.now());
        // 发送邮件
        const transporter = getTransporter();
        const env = loadEnvConfig();
        try {
            await transporter.sendMail({
                from: `"喀小竞" <${env.SMTP_USER}>`,
                to: email,
                subject: '【喀小竞】登录验证码',
                html: `
          <div style="padding:20px;font-family:sans-serif;">
            <h2 style="color:#1890ff;">喀小竞 - 邮箱验证码</h2>
            <p>您的验证码是：</p>
            <div style="font-size:32px;font-weight:bold;color:#1890ff;letter-spacing:8px;margin:20px 0;">${code}</div>
            <p>验证码有效期为 <strong>10分钟</strong>，请尽快使用。</p>
            <p style="color:#999;font-size:12px;">如非本人操作，请忽略此邮件。</p>
          </div>
        `,
            });
            console.log(`[EmailService] 验证码已发送到 ${email}，过期时间: ${new Date(expiresAt).toISOString()}`);
        }
        catch (err) {
            // 邮件发送失败：删除刚写入的验证码记录并清除频率限制，允许用户立即重试
            db.prepare('DELETE FROM verification_codes WHERE email = @email').run({ email });
            rateLimitStore.delete(email);
            console.error(`[EmailService] 发送验证码到 ${email} 失败`);
            throw err;
        }
    }
    /** 验证验证码是否正确 */
    verifyCode(email: string, code: string): boolean {
        ensureCodeTable();
        const db = getDb();
        const stored = db.prepare('SELECT code, expires_at FROM verification_codes WHERE email = @email')
            .get({ email });
        // 注意：日志中不打印验证码明文（code / storedCode），仅记录 email 与结果
        if (!stored) {
            console.log(`[EmailService] 验证失败: email=${email}, 原因=没有找到该邮箱的验证码`);
            return false;
        }
        if (Date.now() > stored.expires_at) {
            console.log(`[EmailService] 验证失败: email=${email}, 原因=验证码已过期`);
            db.prepare('DELETE FROM verification_codes WHERE email = @email').run({ email });
            return false;
        }
        if (stored.code !== code) {
            console.log(`[EmailService] 验证失败: email=${email}, 原因=验证码不匹配`);
            return false;
        }
        // 验证成功后删除
        db.prepare('DELETE FROM verification_codes WHERE email = @email').run({ email });
        console.log(`[EmailService] 验证成功: email=${email}`);
        return true;
    }
}
export const emailService: EmailService = new EmailService();