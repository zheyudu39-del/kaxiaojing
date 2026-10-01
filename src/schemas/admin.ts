/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/schemas/admin.ts

import { z } from 'zod';

export const createCompetitionSchema = z.object({
    name: z.string().min(1, '竞赛名称不能为空'),
    category: z.string().min(1, '类别不能为空'),
    reg_start_month: z.number().int().min(1).max(12),
    reg_end_month: z.number().int().min(1).max(12).optional(),
    description: z.string().optional(),
    target_audience: z.string().optional(),
    fee: z.string().optional(),
    format: z.enum(['individual', 'team', 'both']).optional(),
    requirements: z.string().optional(),
});
export const updateUserRoleSchema = z.object({
    role: z.enum(['user', 'teacher', 'admin'], { message: '角色值无效，仅支持 user、teacher 或 admin' }),
});
export const createAwardSchema = z.object({
    user_id: z.number().int().positive(),
    competition_id: z.number().int().positive(),
    award_level: z.string().min(1),
    award_date: z.string().min(1),
    proof_image_url: z.string().optional(),
});
export const batchAwardsSchema = z.object({
    awards: z.array(createAwardSchema).min(1, '请提供获奖记录数组'),
});
export const announcementSchema = z.object({
    title: z.string().min(1, '标题不能为空'),
    content: z.string().min(1, '内容不能为空'),
});
export const rejectReviewSchema = z.object({
    comment: z.string().min(1, '请填写拒绝理由'),
});
export const batchApproveSchema = z.object({
    items: z.array(z.object({
        content_type: z.string().min(1),
        content_id: z.number().int().positive(),
    })).min(1, '请提供审核项数组'),
});
export const paginationSchema = z.object({
    page: z.string().regex(/^\d+$/).optional(),
    pageSize: z.string().regex(/^\d+$/).optional(),
});