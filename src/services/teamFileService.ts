/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/teamFileService.ts

import { getDb } from '../db/database';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'data', 'uploads', 'team_files');
// 确保上传目录存在
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
// 队伍文件共享服务
export const teamFileService = {
    // 检查是否是队伍成员
    isTeamMember(teamId, userId) {
        const db = getDb();
        const member = db.prepare(`
      SELECT id FROM team_members WHERE team_id = @teamId AND user_id = @userId
    `).get({ teamId, userId });
        return !!member;
    },
    // 获取队伍文件列表
    getTeamFiles(teamId, folderId) {
        const db = getDb();
        if (folderId) {
            return db.prepare(`
        SELECT f.*, u.username as uploader_name
        FROM team_files f
        JOIN users u ON f.uploader_id = u.id
        WHERE f.team_id = @teamId AND f.folder_id = @folderId AND f.deleted_at IS NULL
        ORDER BY f.is_folder DESC, f.created_at DESC
      `).all({ teamId, folderId });
        }
        return db.prepare(`
      SELECT f.*, u.username as uploader_name
      FROM team_files f
      JOIN users u ON f.uploader_id = u.id
      WHERE f.team_id = @teamId AND f.folder_id IS NULL AND f.deleted_at IS NULL
      ORDER BY f.is_folder DESC, f.created_at DESC
    `).all({ teamId });
    },
    // 创建文件夹
    createFolder(teamId, uploaderId, name, parentFolderId) {
        const db = getDb();
        return db.prepare(`
      INSERT INTO team_files (team_id, uploader_id, file_name, is_folder, folder_id)
      VALUES (@teamId, @uploaderId, @name, 1, @parentFolderId)
    `).run({ teamId, uploaderId, name, parentFolderId: parentFolderId || null });
    },
    // 上传文件
    uploadFile(teamId, uploaderId, file, folderId, description) {
        const db = getDb();
        // 移动文件到队伍目录
        const teamDir = path.join(UPLOAD_DIR, teamId.toString());
        if (!fs.existsSync(teamDir)) {
            fs.mkdirSync(teamDir, { recursive: true });
        }
        const newPath = path.join(teamDir, file.filename);
        fs.renameSync(file.path, newPath);
        return db.prepare(`
      INSERT INTO team_files (team_id, uploader_id, file_name, file_path, file_type, file_size, folder_id, description)
      VALUES (@teamId, @uploaderId, @fileName, @filePath, @fileType, @fileSize, @folderId, @description)
    `).run({
            teamId,
            uploaderId,
            fileName: file.originalname,
            filePath: newPath,
            fileType: file.mimetype,
            fileSize: file.size,
            folderId: folderId || null,
            description: description || null
        });
    },
    // 获取文件详情
    getFileById(fileId) {
        const db = getDb();
        return db.prepare(`
      SELECT f.*, u.username as uploader_name
      FROM team_files f
      JOIN users u ON f.uploader_id = u.id
      WHERE f.id = @fileId AND f.deleted_at IS NULL
    `).get({ fileId });
    },
    // 下载文件（增加下载计数）
    downloadFile(fileId) {
        const db = getDb();
        db.prepare('UPDATE team_files SET download_count = download_count + 1 WHERE id = @fileId').run({ fileId });
        return this.getFileById(fileId);
    },
    // 删除文件/文件夹
    deleteFile(fileId, userId) {
        const db = getDb();
        const file = this.getFileById(fileId);
        if (!file)
            return null;
        // 只有上传者或队长可以删除
        const team = db.prepare('SELECT leader_id FROM teams WHERE id = @teamId').get({ teamId: file.team_id });
        if (file.uploader_id !== userId && team?.leader_id !== userId) {
            return null;
        }
        // 软删除
        db.prepare("UPDATE team_files SET deleted_at = datetime('now') WHERE id = @fileId").run({ fileId });
        // 如果是文件夹，递归删除子文件
        if (file.is_folder) {
            db.prepare("UPDATE team_files SET deleted_at = datetime('now') WHERE folder_id = @fileId").run({ fileId });
        }
        return { success: true };
    },
    // 重命名文件/文件夹
    renameFile(fileId, newName, userId) {
        const db = getDb();
        const file = this.getFileById(fileId);
        if (!file)
            return null;
        // 只有上传者或队长可以重命名
        const team = db.prepare('SELECT leader_id FROM teams WHERE id = @teamId').get({ teamId: file.team_id });
        if (file.uploader_id !== userId && team?.leader_id !== userId) {
            return null;
        }
        return db.prepare('UPDATE team_files SET file_name = @newName WHERE id = @fileId').run({ fileId, newName });
    },
    // 移动文件到其他文件夹
    moveFile(fileId, targetFolderId, userId) {
        const db = getDb();
        const file = this.getFileById(fileId);
        if (!file)
            return null;
        // 验证目标文件夹
        if (targetFolderId) {
            const targetFolder = this.getFileById(targetFolderId);
            if (!targetFolder || !targetFolder.is_folder || targetFolder.team_id !== file.team_id) {
                return null;
            }
        }
        return db.prepare('UPDATE team_files SET folder_id = @targetFolderId WHERE id = @fileId').run({ fileId, targetFolderId });
    },
    // 获取队伍存储统计
    getTeamStorageStats(teamId) {
        const db = getDb();
        const stats = db.prepare(`
      SELECT 
        COUNT(*) as file_count,
        SUM(file_size) as total_size,
        COUNT(CASE WHEN is_folder = 1 THEN 1 END) as folder_count
      FROM team_files
      WHERE team_id = @teamId AND deleted_at IS NULL
    `).get({ teamId });
        return {
            fileCount: stats.file_count - stats.folder_count,
            folderCount: stats.folder_count,
            totalSize: stats.total_size || 0
        };
    },
    // 搜索文件
    searchFiles(teamId, keyword) {
        const db = getDb();
        return db.prepare(`
      SELECT f.*, u.username as uploader_name
      FROM team_files f
      JOIN users u ON f.uploader_id = u.id
      WHERE f.team_id = @teamId 
        AND f.deleted_at IS NULL
        AND f.file_name LIKE '%' || @keyword || '%'
      ORDER BY f.created_at DESC
    `).all({ teamId, keyword });
    }
};