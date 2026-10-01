import { request } from '@/utils/request'

export const dashboardApi = {
  overview: () => request.get<{
    user_count: number
    competition_count: number
    team_count: number
    post_count: number
    hot_competitions?: any[]
    recent_notices?: any[]
  }>('/dashboard'),
}

export const statisticsApi = {
  overview: () => request.get<any>('/statistics/overview'),
  collegeParticipation: () => request.get<any[]>('/statistics/college-participation'),
  competitionPopularity: (params?: { limit?: number }) =>
    request.get<any[]>('/statistics/competition-popularity', { params }),
  monthlyTrend: () => request.get<any[]>('/statistics/monthly-trend'),
  competitionDetail: (id: number | string) => request.get<any>(`/statistics/competition/${id}`),
  rankingByCollege: () => request.get<any[]>('/statistics/ranking-by-college'),
  rankingByCategory: () => request.get<any[]>('/statistics/ranking-by-category'),
  registrationTrend: () => request.get<any[]>('/statistics/registration-trend'),
  participantsByCategory: () => request.get<any[]>('/statistics/participants-by-category'),
  awardDistribution: () => request.get<any[]>('/statistics/award-distribution'),
  awardsByCollege: () => request.get<any[]>('/statistics/awards-by-college'),
  awardsByCompetition: () => request.get<any[]>('/statistics/awards-by-competition'),
}

export const dataDashboardApi = {
  overview: () => request.get<any>('/data-dashboard/overview'),
  competitionsByCategory: () => request.get<any[]>('/data-dashboard/competitions-by-category'),
  participantsByCategory: () => request.get<any[]>('/data-dashboard/participants-by-category'),
  participantsByCollege: () => request.get<any[]>('/data-dashboard/participants-by-college'),
  awardDistribution: () => request.get<any[]>('/data-dashboard/award-distribution'),
  registrationTrend: () => request.get<any[]>('/data-dashboard/registration-trend'),
  userGrowth: () => request.get<any[]>('/data-dashboard/user-growth'),
  hotCompetitions: () => request.get<any[]>('/data-dashboard/hot-competitions'),
  activeUsers: () => request.get<any[]>('/data-dashboard/active-users'),
}

export const searchApi = {
  all: (keyword: string, params?: { type?: string; limit?: number }) =>
    request.get<{
      competitions?: any[]
      posts?: any[]
      resources?: any[]
      users?: any[]
      teams?: any[]
    }>('/search', { params: { keyword, ...params } }),
}

export const recommendApi = {
  personalized: () => request.get<any[]>('/recommend/personalized'),
  trending: (params?: { limit?: number }) => request.get<any[]>('/recommend/trending', { params }),
  deadlineSoon: (params?: { days?: number }) => request.get<any[]>('/recommend/deadline-soon', { params }),
  similar: (competitionId: number | string) =>
    request.get<any[]>(`/recommend/similar/${competitionId}`),
  list: () => request.get<any[]>('/recommendations'),
}

export const onlineStatusApi = {
  list: () => request.get<number[]>('/users/online-status'),
}

export const feedbackApi = {
  submit: (body: { type: string; title: string; content: string; contact?: string }) =>
    request.post('/feedback', body),
  my: () => request.get<any[]>('/feedback/my'),
  adminList: (params?: { page?: number; pageSize?: number; status?: string }) =>
    request.get<{ items: any[]; total: number }>('/feedback/admin', { params }),
  reply: (id: number, admin_reply: string) =>
    request.post(`/feedback/admin/${id}/reply`, { admin_reply }),
  updateStatus: (id: number, status: string) =>
    request.patch(`/feedback/admin/${id}/status`, { status }),
}

export const aiApi = {
  chat: (body: { message: string; history?: any[] }) => request.post<{ reply: string }>('/ai/chat', body),
  history: () => request.get<any[]>('/ai/history'),
  saveHistory: (body: any) => request.post('/ai/history', body),
  historyDetail: (id: number) => request.get<any>(`/ai/history/${id}`),
  removeHistory: (id: number) => request.delete(`/ai/history/${id}`),
}

export const exportApi = {
  /** 下载导出文件：直接打开链接即可（带 token 由 axios 处理，这里走 blob） */
  download: (dataType: string, params?: Record<string, any>) =>
    request.get<Blob>(`/export/${dataType}`, { params, responseType: 'blob' }),
  adminBatchUrl: (params: Record<string, any>) => {
    const qs = new URLSearchParams(params as any).toString()
    return `/api/export/admin/batch?${qs}`
  },
}

export const adminApi = {
  competitions: (params?: any) => request.get<{ competitions: any[]; total: number }>('/admin/competitions', { params }),
  createCompetition: (body: any) => request.post('/admin/competitions', body),
  updateCompetition: (id: number, body: any) => request.put(`/admin/competitions/${id}`, body),
  removeCompetition: (id: number) => request.delete(`/admin/competitions/${id}`),

  users: (params?: any) => request.get<{ users: any[]; total: number }>('/admin/users', { params }),
  updateUserRole: (id: number, role: string) => request.put(`/admin/users/${id}/role`, { role }),

  awards: (params?: any) => request.get<any>('/admin/awards', { params }),
  createAward: (body: any) => request.post('/admin/awards', body),
  batchAwards: (body: any) => request.post('/admin/awards/batch', body),
  removeAward: (id: number) => request.delete(`/admin/awards/${id}`),

  reviews: (params?: { status?: string; type?: string; page?: number; pageSize?: number }) =>
    request.get<{ items: any[]; total: number }>('/admin/reviews', { params }),
  reviewDetail: (type: string, id: number) => request.get<any>(`/admin/reviews/${type}/${id}`),
  approve: (type: string, id: number, body?: any) => request.put(`/admin/reviews/${type}/${id}/approve`, body ?? {}),
  reject: (type: string, id: number, body?: any) => request.put(`/admin/reviews/${type}/${id}/reject`, body ?? {}),
  batchApprove: (body: { type: string; ids: number[] }) => request.post('/admin/reviews/batch-approve', body),
  reviewStats: () => request.get<any>('/admin/reviews/stats'),

  dashboardStats: () => request.get<any>('/admin/dashboard-stats'),
  logs: (params?: any) => request.get<{ logs: any[]; total: number }>('/admin/logs', { params }),
  announcements: (body: any) => request.post('/admin/announcements', body),
  restore: (type: string, id: number) => request.put(`/admin/${type}/${id}/restore`),
  uploadProof: (formData: FormData) =>
    request.post<{ url: string }>('/admin/upload/proof', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}
