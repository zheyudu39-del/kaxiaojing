/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/backupScheduler.ts

import nodeCron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { loadEnvConfig } from '../config/env';
import { getDb } from '../db/database';

// ===== 类型定义（自 .d.ts 还原）=====
export interface BackupConfig {
    cronExpression: string;
    backupDir: string;
    maxBackups: number;
}

/**
 * 备份调度器
 * 定时执行数据库备份，自动清理旧备份文件
 */
export class BackupScheduler {
    private task;
    private config;
    constructor() {
        this.task = null;
        this.config = null;
    }
    /**
     * 启动备份调度器
     * Requirement 7.1: 按照可配置的 cron 表达式定时执行数据库备份
     */
    start(config?: BackupConfig): void {
        const envConfig = loadEnvConfig();
        this.config = config || {
            cronExpression: envConfig.BACKUP_CRON,
            backupDir: envConfig.BACKUP_DIR,
            maxBackups: envConfig.BACKUP_MAX,
        };
        if (this.task) {
            this.task.stop();
        }
        this.task = nodeCron.schedule(this.config.cronExpression, () => {
            try {
                this.executeBackup();
                this.cleanOldBackups();
            }
            catch (err) {
                // Requirement 7.4: 记录错误日志并在下次调度时重试
                console.error('[BackupScheduler] 备份执行失败，将在下次调度时重试:', err);
            }
        });
        console.log(`[BackupScheduler] 已启动，cron: ${this.config.cronExpression}, 备份目录: ${this.config.backupDir}`);
    }
    /**
     * 停止备份调度器
     */
    stop(): void {
        if (this.task) {
            this.task.stop();
            this.task = null;
            console.log('[BackupScheduler] 已停止');
        }
    }
    /**
     * 执行一次数据库备份
     * Requirement 7.2: 将数据库文件复制到指定备份目录，文件名包含时间戳
     * Requirement 7.4: 失败时记录错误日志
     * Requirement 7.5: 成功时记录备份文件路径和大小信息
     */
    executeBackup(): { filePath: string; sizeBytes: number; } {
        const envConfig = loadEnvConfig();
        const config = this.config || {
            cronExpression: envConfig.BACKUP_CRON,
            backupDir: envConfig.BACKUP_DIR,
            maxBackups: envConfig.BACKUP_MAX,
        };
        // 确保备份目录存在
        if (!fs.existsSync(config.backupDir)) {
            fs.mkdirSync(config.backupDir, { recursive: true });
        }
        // 生成带时间戳的备份文件名
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFileName = `backup_${timestamp}.db`;
        const filePath = path.join(config.backupDir, backupFileName);
        try {
            // 用内存 export 导出数据库快照，避免 copyFileSync 在并发写入时读到半写状态导致备份损坏
            const db = getDb();
            const rawDb = db.getRawDb();
            const data = rawDb.export();
            const buffer = Buffer.from(data);
            fs.writeFileSync(filePath, buffer);
            const sizeBytes = buffer.length;
            // Requirement 7.5: 记录备份文件路径和大小信息
            console.log(`[BackupScheduler] 备份成功: ${filePath} (${sizeBytes} bytes)`);
            return { filePath, sizeBytes };
        }
        catch (err) {
            // Requirement 7.4: 记录错误日志
            console.error('[BackupScheduler] 备份执行失败:', err);
            throw err;
        }
    }
    /**
     * 清理旧备份文件
     * Requirement 7.3: 备份文件数量超过保留数量时，自动删除最旧的备份文件
     * @returns 删除的文件数
     */
    cleanOldBackups(): number {
        const envConfig = loadEnvConfig();
        const config = this.config || {
            cronExpression: envConfig.BACKUP_CRON,
            backupDir: envConfig.BACKUP_DIR,
            maxBackups: envConfig.BACKUP_MAX,
        };
        if (!fs.existsSync(config.backupDir)) {
            return 0;
        }
        // 列出所有备份文件
        const files = fs.readdirSync(config.backupDir)
            .filter(f => f.startsWith('backup_') && f.endsWith('.db'))
            .map(f => ({
            name: f,
            fullPath: path.join(config.backupDir, f),
            mtime: fs.statSync(path.join(config.backupDir, f)).mtimeMs,
        }))
            .sort((a, b) => a.mtime - b.mtime); // 按修改时间升序（最旧的在前）
        const toDelete = files.length - config.maxBackups;
        if (toDelete <= 0) {
            return 0;
        }
        let deleted = 0;
        for (let i = 0; i < toDelete; i++) {
            try {
                fs.unlinkSync(files[i].fullPath);
                deleted++;
                console.log(`[BackupScheduler] 已删除旧备份: ${files[i].name}`);
            }
            catch (err) {
                console.error(`[BackupScheduler] 删除备份失败: ${files[i].name}`, err);
            }
        }
        return deleted;
    }
}
export const backupScheduler: BackupScheduler = new BackupScheduler();