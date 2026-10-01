/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/config/cors.ts

// ===== 类型定义（自 .d.ts 还原）=====
import type cors from 'cors';

/**
 * 动态 CORS 配置模块
 * 从 CORS_ORIGINS 环境变量读取允许的域名列表，支持多域名配置
 */
export function getCorsOptions(): cors.CorsOptions {
    const originsEnv = process.env.CORS_ORIGINS;
    const origins = originsEnv
        ? originsEnv.split(',').map((o) => o.trim()).filter(Boolean)
        : ['http://localhost:3000'];
    return {
        origin: origins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    };
}