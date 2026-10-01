import { request } from '@/utils/request'

export const dashboardApi = {
  /** 后端字段是 total_users / total_competitions / total_teams，这里统一成页面用的名字 */
  overview: () =>
    request.get<any>('/dashboard').then((r) => ({
      user_count: r?.total_users ?? 0,
      competition_count: r?.total_competitions ?? 0,
      team_count: r?.total_teams ?? 0,
      post_count: r?.total_posts ?? 0,
      hot_competitions: r?.upcoming_competitions ?? [],
      raw: r,
    })),
}

export const statisticsApi = {
  /** 后端字段是 total_* */
  overview: () =>
    request.get<any>('/statistics/overview').then((r) => ({
      competition_count: r?.total_competitions ?? 0,
      user_count: r?.total_users ?? 0,
      team_count: r?.total_teams ?? 0,
      award_count: r?.total_awards ?? 0,
      resource_count: r?.total_resources ?? 0,
      raw: r,
    })),
  collegeParticipation: () =>
    request.get<any>('/statistics/college-participation').then((r: any) => (Array.isArray(r) ? r : (r?.data ?? []))),
  competitionPopularity: (params?: { limit?: number }) =>
    request
      .get<any>('/statistics/competition-popularity', { params })
      .then((r: any) => (Array.isArray(r) ? r : (r?.data ?? []))),
  monthlyTrend: () =>
    request.get<any>('/statistics/monthly-trend').then((r: any) => (Array.isArray(r) ? r : (r?.data ?? []))),
  competitionDetail: (id: number | string) => request.get<any>(`/statistics/competition/${id}`),
  rankingByCollege: () =>
    request.get<any>('/statistics/ranking-by-college').then((r: any) => (Array.isArray(r) ? r : (r?.data ?? []))),
  rankingByCategory: () =>
    request.get<any>('/statistics/ranking-by-category').then((r: any) => (Array.isArray(r) ? r : (r?.data ?? []))),
  registrationTrend: () =>
    request.get<any>('/statistics/registration-trend').then((r: any) => (Array.isArray(r) ? r : (r?.data ?? []))),
  participantsByCategory: () =>
    request.get<any>('/statistics/participants-by-category').then((r: any) => (Array.isArray(r) ? r : (r?.data ?? []))),
  awardDistribution: () =>
    request.get<any>('/statistics/award-distribution').then((r: any) => (Array.isArray(r) ? r : (r?.data ?? []))),
  awardsByCollege: () =>
    request.get<any>('/statistics/awards-by-college').then((r: any) => (Array.isArray(r) ? r : (r?.data ?? []))),
  awardsByCompetition: () =>
    request.get<any>('/statistics/awards-by-competition').then((r: any) => (Array.isArray(r) ? r : (r?.data ?? []))),
}

export const dataDashboardApi = {
  /** 后端字段是 camelCase：totalUsers / totalCompetitions ... */
  overview: () =>
    request.get<any>('/data-dashboard/overview').then((r) => ({
      competition_count: r?.totalCompetitions ?? 0,
      user_count: r?.totalUsers ?? 0,
      team_count: r?.totalTeams ?? 0,
      resource_count: r?.totalPosts ?? 0,
      raw: r,
    })),
  competitionsByCategory: () =>
    request
      .get<any>('/data-dashboard/competitions-by-category')
      .then((r: any) => (Array.isArray(r) ? r : (r?.data ?? []))),
  participantsByCategory: () =>
    request
      .get<any>('/data-dashboard/participants-by-category')
      .then((r: any) => (Array.isArray(r) ? r : (r?.data ?? []))),
  participantsByCollege: () =>
    request
      .get<any>('/data-dashboard/participants-by-college')
      .then((r: any) => (Array.isArray(r) ? r : (r?.data ?? []))),
  awardDistribution: () =>
    request.get<any>('/data-dashboard/award-distribution').then((r: any) => (Array.isArray(r) ? r : (r?.data ?? []))),
  registrationTrend: () =>
    request.get<any>('/data-dashboard/registration-trend').then((r: any) => (Array.isArray(r) ? r : (r?.data ?? []))),
  userGrowth: () =>
    request.get<any>('/data-dashboard/user-growth').then((r: any) => (Array.isArray(r) ? r : (r?.data ?? []))),
  hotCompetitions: () =>
    request.get<any>('/data-dashboard/hot-competitions').then((r: any) => (Array.isArray(r) ? r : (r?.data ?? []))),
  activeUsers: () =>
    request.get<any>('/data-dashboard/active-users').then((r: any) => (Array.isArray(r) ? r : (r?.data ?? []))),
}

export const searchApi = {
  /** 后端返回扁平的 { results: [{type,id,title,description,relevance}] } */
  all: (keyword: string, params?: { types?: string; limit?: number }) =>
    request.get<{ results: any[] }>('/search', { params: { keyword, ...params } }),
}

export const recommendApi = {
  personalized: () =>
    request.get<{ competitions: any[] }>('/recommend/personalized').then((r) => r?.competitions ?? []),
  trending: (params?: { limit?: number }) =>
    request
      .get<{ competitions: any[] }>('/recommend/trending', { params })
      .then((r) => r?.competitions ?? []),
  deadlineSoon: (params?: { days?: number }) =>
    request
      .get<{ competitions: any[] }>('/recommend/deadline-soon', { params })
      .then((r) => r?.competitions ?? []),
  similar: (competitionId: number | string) =>
    request
      .get<{ competitions: any[] }>(`/recommend/similar/${competitionId}`)
      .then((r) => r?.competitions ?? []),
  list: () =>
    request.get<{ competitions: any[] }>('/recommendations').then((r) => r?.competitions ?? []),
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
