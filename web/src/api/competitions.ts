import { request } from '@/utils/request'
import type { Competition, College, Major, CompetitionStage, RankingItem } from '@/types'

export const competitionApi = {
  /** 竞赛列表（支持分页/筛选/搜索） */
  list: (params?: {
    page?: number
    pageSize?: number
    category?: string
    month?: number
    keyword?: string
    collegeId?: number
    majorId?: number
    sort?: string
  }) => request.get<{ competitions: Competition[]; total: number }>('/competitions', { params }),

  detail: (id: number | string) => request.get<Competition>(`/competitions/${id}`),

  related: (id: number | string) => request.get<Competition[]>(`/competitions/${id}/related`),

  categories: () =>
    request.get<{ categories: string[] }>('/competitions/categories').then((r) => r?.categories ?? []),

  deadlineSoon: (params?: { days?: number }) =>
    request
      .get<{ competitions: Competition[] }>('/competitions/deadline-soon', { params })
      .then((r) => r?.competitions ?? []),

  create: (body: Partial<Competition>) => request.post<{ id: number }>('/competitions', body),

  /** 竞赛对比 */
  compare: (ids: number[] | string) =>
    request.get<Competition[]>('/competitions/compare', {
      params: { ids: Array.isArray(ids) ? ids.join(',') : ids },
    }),

  // ---- 扩展信息 ----
  difficulty: (id: number | string) => request.get<any>(`/competitions/${id}/difficulty`),
  groupInfo: (id: number | string) => request.get<any>(`/competitions/${id}/group-info`),
  updateGroupInfo: (id: number | string, body: any) =>
    request.put(`/competitions/${id}/group-info`, body),
  prepPlan: (id: number | string) => request.get<any>(`/competitions/${id}/prep-plan`),
  awards: (id: number | string) => request.get<any[]>(`/competitions/${id}/awards`),
  timeline: (id: number | string) => request.get<any[]>(`/competitions/${id}/timeline`),

  // ---- 阶段 ----
  createStage: (id: number | string, body: Partial<CompetitionStage>) =>
    request.post(`/competitions/${id}/stages`, body),
  updateStage: (id: number | string, stageId: number, body: Partial<CompetitionStage>) =>
    request.put(`/competitions/${id}/stages/${stageId}`, body),
  deleteStage: (id: number | string, stageId: number) =>
    request.delete(`/competitions/${id}/stages/${stageId}`),

  // ---- 评价 ----
  reviews: (id: number | string, params?: { page?: number; pageSize?: number }) =>
    request.get<{ reviews: any[]; total: number }>(`/competitions/${id}/reviews`, { params }),
  myReview: (id: number | string) => request.get<any>(`/competitions/${id}/my-review`),
  createReview: (id: number | string, body: { rating: number; content?: string }) =>
    request.post(`/competitions/${id}/reviews`, body),
  deleteReview: (id: number | string) => request.delete(`/competitions/${id}/reviews`),

  updateRegistrationUrl: (id: number | string, url: string) =>
    request.put(`/competitions/${id}/registration-url`, { url }),
}

export const collegeApi = {
  /** 后端返回 { colleges: [...] } */
  list: () =>
    request.get<{ colleges: College[] }>('/colleges').then((r) => r?.colleges ?? []),
  majors: (collegeId: number) =>
    request
      .get<{ majors: Major[] }>(`/colleges/${collegeId}/majors`)
      .then((r) => r?.majors ?? []),
  competitions: (collegeId: number, params?: any) =>
    request
      .get<{ competitions: Competition[] }>(`/colleges/${collegeId}/competitions`, { params })
      .then((r) => r?.competitions ?? []),
}

export const majorApi = {
  competitions: (majorId: number, params?: any) =>
    request
      .get<{ competitions: Competition[] }>(`/majors/${majorId}/competitions`, { params })
      .then((r) => r?.competitions ?? []),
}

export const rankingApi = {
  /** 后端返回 { rankings: [...] }，字段为 id/username/participation_count/award_count/gold_count... */
  list: (params?: { type?: string; category?: string; limit?: number }) =>
    request.get<{ rankings: any[] }>('/ranking', { params }).then((r) =>
      (r?.rankings ?? []).map((x: any, i: number) => ({
        rank: i + 1,
        user_id: x.id ?? x.user_id,
        username: x.username,
        avatar_url: x.avatar_url,
        score: x.participation_count ?? 0,
        award_count: x.award_count ?? 0,
        competition_count: x.participation_count ?? 0,
        gold_count: x.gold_count ?? 0,
        silver_count: x.silver_count ?? 0,
        bronze_count: x.bronze_count ?? 0,
      })),
    ),
  award: (body: any) => request.post('/ranking/award', body),
}

export const ratingApi = {
  get: (competitionId: number | string) => request.get<any>(`/ratings/${competitionId}`),
  mine: (competitionId: number | string) => request.get<any>(`/ratings/${competitionId}/my`),
  submit: (competitionId: number | string, body: any) =>
    request.post(`/ratings/${competitionId}`, body),
}

export const registrationApi = {
  my: () => request.get<any[]>('/registrations/my'),
  create: (body: { competition_id: number; [k: string]: any }) =>
    request.post('/registrations', body),
  cancel: (competitionId: number | string) =>
    request.delete(`/registrations/${competitionId}`),
  check: (competitionId: number | string) =>
    request.get<{ registered: boolean }>(`/registrations/check/${competitionId}`),
}

export const subscriptionApi = {
  my: () => request.get<any[]>('/subscriptions/my'),
  create: (body: { competition_id: number; reminder_days?: number }) =>
    request.post('/subscriptions', body),
  cancel: (competitionId: number | string) =>
    request.delete(`/subscriptions/${competitionId}`),
  check: (competitionId: number | string) =>
    request.get<{ subscribed: boolean }>(`/subscriptions/check/${competitionId}`),
}
