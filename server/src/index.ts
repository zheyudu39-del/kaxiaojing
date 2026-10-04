/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/index.ts

import 'dotenv/config';
import http from 'http';
import app from './app';
import { initializeDatabase } from './db/database';
import { initializeSocket } from './socket/index';
import { loadEnvConfig } from './config/env';

const env = loadEnvConfig();
const PORT = env.PORT;
// 兜底：任何未捕获异常 / 未处理的 Promise 拒绝都不应该让整个服务下线。
// 此前没有这两个处理器，socket 层一个参数类型错误（对象被当作 SQL 绑定值）
// 就能把 Node 进程直接打挂——前端打开队伍聊天页即可触发。
process.on('uncaughtException', (err) => {
    console.error('[uncaughtException] 已拦截，服务继续运行:', err && (err as any).stack ? (err as any).stack : err);
});
process.on('unhandledRejection', (reason) => {
    console.error('[unhandledRejection] 已拦截，服务继续运行:', reason && (reason as any).stack ? (reason as any).stack : reason);
});
async function main() {
    // Initialize database and seed data
    await initializeDatabase(env.DB_PATH);
    console.log('数据库初始化完成');
    // Create HTTP server from Express app
    const server = http.createServer(app);
    // Initialize Socket.io on the HTTP server
    initializeSocket(server);
    console.log('Socket.io 初始化完成');
    // Start listening
    server.listen(PORT, () => {
        console.log(`服务器已启动，端口: ${PORT}`);
    });
}
main().catch((err) => {
    console.error('服务器启动失败:', err);
    process.exit(1);
});