/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/config/env.ts

// ===== 类型定义（自 .d.ts 还原）=====
export interface EnvConfig {
    JWT_SECRET: string;
    DB_PATH: string;
    CORS_ORIGINS: string;
    BACKUP_CRON: string;
    BACKUP_DIR: string;
    BACKUP_MAX: number;
    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX: number;
    AUTH_RATE_LIMIT_MAX: number;
    NODE_ENV: string;
    PORT: number;
    DEEPSEEK_API_KEY: string;
    SMTP_HOST: string;
    SMTP_PORT: string;
    SMTP_USER: string;
    SMTP_PASS: string;
}

/**
 * 环境变量配置模块
 * 验证所有必需环境变量，缺失时抛出明确错误
 */
/** 必需的环境变量（缺失时启动失败） */
const REQUIRED_VARS = ['JWT_SECRET'];
/**
 * 加载并验证环境变量配置。
 * 必需变量缺失时抛出包含所有缺失变量名的错误。
 * 可选变量提供合理默认值。
 */
export function loadEnvConfig(): EnvConfig {
    const missing = [];
    for (const key of REQUIRED_VARS) {
        if (!process.env[key]) {
            missing.push(key);
        }
    }
    if (missing.length > 0) {
        throw new Error(`缺少必需的环境变量: ${missing.join(', ')}。` +
            `请在 .env 文件中配置或通过环境变量设置。`);
    }
    return {
        JWT_SECRET: process.env.JWT_SECRET,
        DB_PATH: process.env.DB_PATH || './data/competition.db',
        CORS_ORIGINS: process.env.CORS_ORIGINS || 'http://localhost:3000',
        BACKUP_CRON: process.env.BACKUP_CRON || '0 2 * * *',
        BACKUP_DIR: process.env.BACKUP_DIR || './data/backups',
        BACKUP_MAX: parseInt(process.env.BACKUP_MAX || '7', 10),
        RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '200', 10),
        AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '20', 10),
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: parseInt(process.env.PORT || '5000', 10),
        DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || '',
        SMTP_HOST: process.env.SMTP_HOST || 'smtp.qq.com',
        SMTP_PORT: process.env.SMTP_PORT || '465',
        SMTP_USER: process.env.SMTP_USER || '',
        SMTP_PASS: process.env.SMTP_PASS || '',
    };
}