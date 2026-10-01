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
    request.get<{ favorites: Competition[]; total: number }>('/favorites', { params }),
  add: (competitionId: number) => request.post('/favorites', { competition_id: competitionId }),
  remove: (competitionId: number) => request.delete(`/favorites/${competitionId}`),
  check: (competitionId: number) =>
    request.get<{ favorited: boolean }>(`/favorites/check/${competitionId}`),

  tags: () => request.get<string[]>('/favorites/tags'),
  tagsOf: (competitionId: number) => request.get<string[]>(`/favorites/${competitionId}/tags`),
  addTag: (competitionId: number, tag: string) =>
    request.post(`/favorites/${competitionId}/tags`, { tag }),
  removeTag: (competitionId: number, tag: string) =>
    request.delete(`/favorites/${competitionId}/tags/${encodeURIComponent(tag)}`),
  byTag: (tag: string) => request.get<Competition[]>(`/favorites/by-tag/${encodeURIComponent(tag)}`),
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
  my: (params?: { page?: number; pageSize?: number }) =>
    request.get<{ items: any[]; total: number }>('/timeline/my', { params }),
  myGrowth: () => request.get<any[]>('/timeline/my/growth'),
  myMilestones: () => request.get<any[]>('/timeline/my/milestones'),
  myStats: () => request.get<any>('/timeline/my/stats'),

  byUser: (userId: number | string, params?: any) =>
    request.get<{ items: any[]; total: number }>(`/timeline/user/${userId}`, { params }),
  userGrowth: (userId: number | string) => request.get<any[]>(`/timeline/user/${userId}/growth`),
  userMilestones: (userId: number | string) => request.get<any[]>(`/timeline/user/${userId}/milestones`),
  userStats: (userId: number | string) => request.get<any>(`/timeline/user/${userId}/stats`),
}

export const reportApi = {
  weekly: () => request.get<any>('/report/weekly'),
  monthly: () => request.get<any>('/report/monthly'),
  growth: () => request.get<any>('/growth-report'),
}
