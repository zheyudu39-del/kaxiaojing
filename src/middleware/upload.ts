/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/middleware/upload.ts

import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_BASE = path.join(__dirname, '..', '..', 'data', 'uploads');
const AVATAR_DIR = path.join(UPLOAD_BASE, 'avatars');
const RESOURCE_DIR = path.join(UPLOAD_BASE, 'resources');
const PROOF_DIR = path.join(UPLOAD_BASE, 'proofs');
const RESOURCE_ALLOWED_EXTENSIONS = new Set([
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.ppt',
    '.pptx',
    '.txt',
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.zip',
    '.rar',
]);
// Ensure directories exist
[AVATAR_DIR, RESOURCE_DIR, PROOF_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});
// Avatar upload: JPEG/PNG only, max 2MB
const avatarStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, AVATAR_DIR),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `avatar_${Date.now()}${ext}`);
    },
});
export const avatarUpload: multer.Multer = multer({
    storage: avatarStorage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('仅支持 JPEG 和 PNG 格式的图片'));
        }
    },
});
// Resource upload: whitelisted MIME types only, max 10MB
const resourceStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, RESOURCE_DIR),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `resource_${Date.now()}${ext}`);
    },
});
export const RESOURCE_ALLOWED_MIMES: string[] = [
    // PDF
    'application/pdf',
    // Word
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Excel
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // PowerPoint
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // Plain text
    'text/plain',
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    // Archives
    'application/zip',
    'application/x-rar-compressed',
    'application/vnd.rar',
];
export const resourceUpload: multer.Multer = multer({
    storage: resourceStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (RESOURCE_ALLOWED_MIMES.includes(file.mimetype) && RESOURCE_ALLOWED_EXTENSIONS.has(ext)) {
            cb(null, true);
        }
        else {
            cb(new Error('不支持的文件类型'));
        }
    },
});
// Proof image upload: JPG/PNG/WEBP only, max 5MB
const proofStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, PROOF_DIR),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `proof_${Date.now()}${ext}`);
    },
});
export const proofUpload: multer.Multer = multer({
    storage: proofStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('仅支持 JPG、PNG、WEBP 格式的图片'));
        }
    },
});