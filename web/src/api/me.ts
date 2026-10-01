import { request } from '@/utils/request'
import type { User, Competition, Notification } from '@/types'

export const profileApi = {
  /** 当前登录用户资料 */
  me: () => request.get<User>('/profile'),
  update: (body: Partial<User>) => request.put<User>('/profile', body),
  /** 他人主页 */
  byUser: (userId: number | string) => request.get<User & { awards?: any[]; skills?: string[]; teams?: any[] }>(`/profile/${userId}`),
  viewStats: (userId: number | string) => request.get<any>(`/profile/${userId}/view-stats`),

  uploadAvatar: (formData: FormData) =>
    request.post<{ url: string }>('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadProof: (formData: FormData) =>
    request.post<{ url: string }>('/profile/upload-proof', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  awards: () => request.get<any[]>('/profile/awards').catch(() => []),
  addAward: (body: any) => request.post('/profile/awards', body),
  removeAward: (awardId: number) => request.delete(`/profile/awards/${awardId}`),

  skills: () => request.get<{ skills: string[] }>('/profile/skills').then((r) => r?.skills ?? []),
  addSkill: (skill: string) => request.post('/profile/skills', { skill }),
  removeSkill: (skill: string) => request.delete(`/profile/skills/${encodeURIComponent(skill)}`),
}

export const favoriteApi = {
  list: (params?: { page?: number; pageSize?: number }) =>
    request.get<{ favorites: Competition[] }>('/favorites', { params }),
  add: (competitionId: number) => request.post('/favorites', { competition_id: competitionId }),
  remove: (competitionId: number) => request.delete(`/favorites/${competitionId}`),
  /** 注意：后端返回字段是 is_favorited */
  check: (competitionId: number) =>
    request
      .get<{ is_favorited: boolean }>(`/favorites/check/${competitionId}`)
      .then((r) => ({ favorited: !!(r?.is_favorited ?? (r as any)?.favorited) })),

  tags: () => request.get<{ tags: string[] }>('/favorites/tags').then((r) => r?.tags ?? []),
  tagsOf: (competitionId: number) =>
    request.get<{ tags: string[] }>(`/favorites/${competitionId}/tags`).then((r) => r?.tags ?? []),
  addTag: (competitionId: number, tag: string) =>
    request.post(`/favorites/${competitionId}/tags`, { tag }),
  removeTag: (competitionId: number, tag: string) =>
    request.delete(`/favorites/${competitionId}/tags/${encodeURIComponent(tag)}`),
  byTag: (tag: string) =>
    request
      .get<{ favorites: Competition[] }>(`/favorites/by-tag/${encodeURIComponent(tag)}`)
      .then((r) => r?.favorites ?? []),
}

export const notificationApi = {
  list: (params?: { page?: number; pageSize?: number; unread_only?: boolean }) =>
    request.get<{ notifications: Notification[]; total: number }>('/notifications', { params }),
  unreadCount: () => request.get<{ count: number }>('/notifications/unread-count'),
  markRead: (id: number) => request.put(`/notifications/${id}/read`),
  markAllRead: () => request.put('/notifications/read-all'),
  remove: (id: number) => request.delete(`/notifications/${id}`),
  removeBatch: (ids: number[]) => request.delete('/notifications/batch', { data: { ids } }),
  removeAll: () => request.delete('/notifications/all'),
  removeRead: () => request.delete('/notifications/read'),
}

export const timelineApi = {
  my: () => request.get<{ timeline: any[] }>('/timeline/my').then((r) => r?.timeline ?? []),
  myGrowth: () => request.get<{ growth: any[] }>('/timeline/my/growth').then((r) => r?.growth ?? []),
  myMilestones: () =>
    request.get<{ milestones: any[] }>('/timeline/my/milestones').then((r) => r?.milestones ?? []),
  myStats: () => request.get<any>('/timeline/my/stats'),

  byUser: (userId: number | string) =>
    request.get<{ timeline: any[] }>(`/timeline/user/${userId}`).then((r) => r?.timeline ?? []),
  userGrowth: (userId: number | string) =>
    request.get<{ growth: any[] }>(`/timeline/user/${userId}/growth`).then((r) => r?.growth ?? []),
  userMilestones: (userId: number | string) =>
    request
      .get<{ milestones: any[] }>(`/timeline/user/${userId}/milestones`)
      .then((r) => r?.milestones ?? []),
  userStats: (userId: number | string) => request.get<any>(`/timeline/user/${userId}/stats`),
}

export const reportApi = {
  weekly: () => request.get<any>('/report/weekly'),
  monthly: () => request.get<any>('/report/monthly'),
  growth: () => request.get<any>('/growth-report'),
}
