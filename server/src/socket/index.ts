/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/socket/index.ts

import { Server } from 'socket.io';
import { authService } from '../services/authService';
import { chatService } from '../services/chatService';
import { lobbyService } from '../services/lobbyService';
import { getCorsOptions } from '../config/cors';

// ===== 类型定义（自 .d.ts 还原）=====
import type { Server as HttpServer } from 'http';

let io = null;
// In-memory online user tracking: userId -> Set of socketIds
const onlineUsers = new Map();
/**
 * 从 socket 载荷里安全取出 teamId。
 *
 * 客户端发的是对象 `{ teamId: N }`，而早期处理器把它当数字直接传进 SQL 绑定，
 * sql.js 遇到对象参数会抛 "tried to bind a value of an unknown type"，
 * 该异常未被捕获时**会直接崩掉整个 Node 进程**（前端一打开队伍聊天页就能触发）。
 * 这里统一兼容「数字」与「{teamId}」两种形态，并强制转成正整数。
 */
function parseTeamId(payload: any): number | null {
    const raw = payload && typeof payload === 'object' ? payload.teamId : payload;
    const id = Number(raw);
    return Number.isInteger(id) && id > 0 ? id : null;
}
/**
 * Check if a user is currently online (has at least one active socket connection).
 */
export function isUserOnline(userId: number): boolean {
    return onlineUsers.has(userId) && onlineUsers.get(userId).size > 0;
}
/**
 * Get the online users map (for use by the online-status API route).
 */
export function getOnlineUsers(): Map<number, Set<string>> {
    return onlineUsers;
}
export function initializeSocket(httpServer: HttpServer): Server {
    const corsOptions = getCorsOptions();
    io = new Server(httpServer, {
        cors: {
            origin: corsOptions.origin,
            methods: ['GET', 'POST'],
            credentials: corsOptions.credentials,
        },
    });
    // JWT authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error('认证失败：缺少 token'));
        }
        try {
            const payload = authService.verifyToken(token);
            socket.userId = payload.userId;
            socket.email = payload.email;
            next();
        }
        catch {
            next(new Error('认证失败：token 无效'));
        }
    });
    io.on('connection', (socket) => {
        const userId = socket.userId;
        // Track online status
        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, new Set());
        }
        onlineUsers.get(userId).add(socket.id);
        // 加入个人房间，用于私信推送
        socket.join(`user-${userId}`);
        socket.emit('connection-status', 'connected');
        socket.on('join-team-chat', (payload) => {
            const teamId = parseTeamId(payload);
            if (!teamId) {
                socket.emit('error', { message: '缺少有效的 teamId' });
                return;
            }
            try {
                if (!chatService.isTeamMember(teamId, userId)) {
                    socket.emit('error', { message: '您不是该队伍成员' });
                    return;
                }
                socket.join(`team-${teamId}`);
            }
            catch (err) {
                socket.emit('error', { message: err.message || '加入队伍聊天失败' });
            }
        });
        socket.on('leave-team-chat', (payload) => {
            const teamId = parseTeamId(payload);
            if (!teamId) {
                socket.emit('error', { message: '缺少有效的 teamId' });
                return;
            }
            socket.leave(`team-${teamId}`);
        });
        socket.on('send-message', (payload) => {
            const teamId = parseTeamId(payload);
            const content = payload && typeof payload === 'object' ? payload.content : undefined;
            if (!teamId || !content) {
                socket.emit('error', { message: '缺少必填字段' });
                return;
            }
            try {
                const message = chatService.sendMessage(teamId, userId, content);
                io.to(`team-${teamId}`).emit('new-message', message);
            }
            catch (err) {
                socket.emit('error', { message: err.message || '发送消息失败' });
            }
        });
        // === 交流大厅 ===
        socket.on('join-lobby', () => {
            socket.join('lobby');
        });
        socket.on('leave-lobby', () => {
            socket.leave('lobby');
        });
        socket.on('send-lobby-message', (data) => {
            const { content, msgType, competitionId } = data;
            if (!content || !content.trim()) {
                socket.emit('error', { message: '消息内容不能为空' });
                return;
            }
            try {
                const message = lobbyService.sendMessage(userId, content.trim(), msgType || 'chat', competitionId);
                io.to('lobby').emit('new-lobby-message', message);
            }
            catch (err) {
                socket.emit('error', { message: err.message || '发送消息失败' });
            }
        });
        // === 正在输入提示 ===
        socket.on('user-typing', (data) => {
            if (data && data.teamId) {
                socket.to(`team-${data.teamId}`).emit('user-typing', {
                    userId,
                    teamId: data.teamId,
                });
            }
        });
        socket.on('user-stopped-typing', (data) => {
            if (data && data.teamId) {
                socket.to(`team-${data.teamId}`).emit('user-stopped-typing', {
                    userId,
                    teamId: data.teamId,
                });
            }
        });
        socket.on('disconnect', () => {
            // Remove socket from online tracking
            const sockets = onlineUsers.get(userId);
            if (sockets) {
                sockets.delete(socket.id);
                if (sockets.size === 0) {
                    onlineUsers.delete(userId);
                }
            }
        });
    });
    return io;
}
export function getIO(): Server | null {
    return io;
}
/**
 * Push a private message to a user in real-time via WebSocket.
 */
export function pushPrivateMessage(receiverId: number, message: any): void {
    if (!io)
        return;
    io.to(`user-${receiverId}`).emit('new-private-message', message);
}
/**
 * Push a notification to a user in real-time via WebSocket.
 */
export function pushNotification(userId: number, notification: any): void {
    if (!io)
        return;
    io.to(`user-${userId}`).emit('new-notification', notification);
}
/**
 * Notify team members that a member has been removed, then disconnect that member's sockets.
 */
export function notifyMemberRemoved(teamId: number, userId: number): void {
    if (!io)
        return;
    io.to(`team-${teamId}`).emit('member-removed', { teamId, userId });
    // Disconnect the removed user's sockets from the team room
    const room = `team-${teamId}`;
    const sockets = io.sockets.sockets;
    for (const [, socket] of sockets) {
        if (socket.userId === userId && socket.rooms.has(room)) {
            socket.leave(room);
        }
    }
}
/**
 * Notify all team members that the team has been dissolved.
 */
export function notifyTeamDissolved(teamId: number): void {
    if (!io)
        return;
    io.to(`team-${teamId}`).emit('team-dissolved', { teamId });
    // Remove all sockets from the team room
    io.in(`team-${teamId}`).socketsLeave(`team-${teamId}`);
}