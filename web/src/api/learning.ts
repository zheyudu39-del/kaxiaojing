import { request } from '@/utils/request'
import type { Resource, Recruitment, Certificate, CertPlan, Badge, StudyGroup, StudyPlan, StudyCheckin, PrepTodo, College } from '@/types'

export const resourceApi = {
  list: (params?: { page?: number; pageSize?: number; competition_id?: number; type?: string; keyword?: string; sort?: string }) =>
    request.get<{ resources: Resource[]; total: number }>('/resources', { params }),
  create: (body: Partial<Resource>) => request.post<{ id: number }>('/resources', body),
  remove: (id: number) => request.delete(`/resources/${id}`),
  downloadUrl: (id: number) => `/api/resources/${id}/download`,
  rate: (id: number, rating: number) => request.post(`/resources/${id}/rate`, { rating }),
  rating: (id: number) => request.get<{ average: number; count: number; mine?: number }>(`/resources/${id}/rating`),
  /** 上传资料文件（后端 multer 字段名 resourceUpload） */
  uploadFile: (formData: FormData) =>
    request.post<{ url: string; name: string; size: number }>('/resources/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

export const recruitmentApi = {
  /** 注意：后端返回的键名是 posts，不是 recruitments */
  list: (params?: { page?: number; pageSize?: number; competition_id?: number; keyword?: string }) =>
    request.get<{ posts: Recruitment[]; total: number }>('/recruitments', { params }),
  detail: (id: number | string) => request.get<Recruitment>(`/recruitments/${id}`),
  create: (body: Partial<Recruitment>) => request.post<{ id: number }>('/recruitments', body),
  remove: (id: number) => request.delete(`/recruitments/${id}`),
  close: (id: number) => request.put(`/recruitments/${id}/close`),
  apply: (id: number, body: { message?: string }) => request.post(`/recruitments/${id}/apply`, body),
  applications: (id: number) => request.get<any[]>(`/recruitments/${id}/applications`),
  handleApplication: (id: number, action: 'approve' | 'reject') =>
    request.put(`/recruitments/applications/${id}`, { action }),
}

export const certificateApi = {
  list: (params?: { category?: string; keyword?: string }) =>
    request.get<Certificate[]>('/certificates', { params }),
  detail: (id: number | string) => request.get<Certificate>(`/certificates/${id}`),
  categories: () => request.get<string[]>('/certificates/categories'),
}

export const certPlanApi = {
  my: () => request.get<CertPlan[]>('/cert-plans/my'),
  create: (body: { certificate_id: number; target_date?: string }) => request.post('/cert-plans', body),
  update: (certificateId: number, body: Partial<CertPlan>) =>
    request.put(`/cert-plans/${certificateId}`, body),
  remove: (certificateId: number) => request.delete(`/cert-plans/${certificateId}`),
  checkin: (certificateId: number, body?: { content?: string; duration?: number }) =>
    request.post(`/cert-plans/${certificateId}/checkin`, body ?? {}),
  checkins: (certificateId: number) => request.get<any[]>(`/cert-plans/${certificateId}/checkins`),
}

export const awardCertApi = {
  list: () => request.get<any[]>('/award-certs'),
  detail: (id: number | string) => request.get<any>(`/award-certs/${id}`),
  renderUrl: (id: number | string) => `/api/award-certs/${id}/render`,
  create: (body: any) => request.post('/award-certs', body),
  remove: (id: number) => request.delete(`/award-certs/${id}`),
  autoGenerate: (body?: any) => request.post('/award-certs/auto-generate', body ?? {}),
  stats: () => request.get<any>('/award-certs/stats'),
  verify: (certNumber: string) => request.get<any>(`/award-certs/verify/${certNumber}`),
}

export const badgeApi = {
  all: () => request.get<Badge[]>('/badges/all'),
  my: () => request.get<Badge[]>('/badges/my'),
  myAll: () => request.get<{ earned: Badge[]; locked: Badge[] }>('/badges/my/all'),
  byUser: (userId: number) => request.get<Badge[]>(`/badges/user/${userId}`),
  check: () => request.post<Badge[]>('/badges/check'),
}

export const teacherCertApi = {
  apply: (body: any) => request.post('/teacher-cert/apply', body),
  status: () => request.get<{ status: string; review_comment?: string } | null>('/teacher-cert/status'),
}

export const studyGroupApi = {
  list: (params?: { page?: number; pageSize?: number; category?: string; keyword?: string }) =>
    request.get<{ groups: StudyGroup[]; total: number }>('/study-groups', { params }),
  detail: (id: number | string) => request.get<StudyGroup>(`/study-groups/${id}`),
  create: (body: { name: string; category: string; description?: string }) =>
    request.post<{ id: number }>('/study-groups', body),
  join: (id: number | string) => request.post(`/study-groups/${id}/join`),
  leave: (id: number | string) => request.post(`/study-groups/${id}/leave`),
  members: (id: number | string) => request.get<any[]>(`/study-groups/${id}/members`),
  messages: (id: number | string, params?: any) =>
    request.get<any[]>(`/study-groups/${id}/messages`, { params }),
  send: (id: number | string, content: string) =>
    request.post(`/study-groups/${id}/messages`, { content }),
  my: () => request.get<StudyGroup[]>('/study-groups/user/my'),
}

export const studyCheckinApi = {
  plans: () => request.get<StudyPlan[]>('/study-checkin/plans'),
  createPlan: (body: Partial<StudyPlan>) => request.post<{ id: number }>('/study-checkin/plans', body),
  updateStatus: (planId: number, status: string) =>
    request.patch(`/study-checkin/plans/${planId}/status`, { status }),
  checkins: (planId: number) => request.get<StudyCheckin[]>(`/study-checkin/plans/${planId}/checkins`),
  checkin: (planId: number, body: { content?: string; duration?: number }) =>
    request.post(`/study-checkin/plans/${planId}/checkins`, body),
  removeCheckin: (checkinId: number) => request.delete(`/study-checkin/checkins/${checkinId}`),
  stats: () => request.get<any>('/study-checkin/stats'),
}

export const studyBuddyApi = {
  match: (params?: { competition_id?: number }) => request.get<any[]>('/study-buddy/match', { params }),
  byCompetition: (competitionId: number | string) =>
    request.get<any[]>(`/study-buddy/competition/${competitionId}`),
}

export const notebookApi = {
  list: (params?: { page?: number; pageSize?: number; keyword?: string }) =>
    request.get<{ notes: any[]; total: number }>('/notebook', { params }),
  detail: (id: number | string) => request.get<any>(`/notebook/${id}`),
  create: (body: { title: string; content: string; tags?: string }) =>
    request.post<{ id: number }>('/notebook', body),
  update: (id: number | string, body: any) => request.put(`/notebook/${id}`, body),
  remove: (id: number | string) => request.delete(`/notebook/${id}`),
  pin: (id: number | string) => request.post(`/notebook/${id}/pin`),
  search: (keyword: string) => request.get<any[]>('/notebook/search', { params: { keyword } }),
  stats: () => request.get<any>('/notebook/stats'),
}

export const prepTodoApi = {
  list: (params?: { competition_id?: number; is_completed?: number }) =>
    request.get<PrepTodo[]>('/prep-todos', { params }),
  today: () => request.get<PrepTodo[]>('/prep-todos/today'),
  stats: () => request.get<{ total: number; completed: number; overdue: number }>('/prep-todos/stats'),
  create: (body: Partial<PrepTodo>) => request.post<{ id: number }>('/prep-todos', body),
  update: (id: number, body: Partial<PrepTodo>) => request.patch(`/prep-todos/${id}`, body),
  toggle: (id: number) => request.post(`/prep-todos/${id}/toggle`),
  remove: (id: number) => request.delete(`/prep-todos/${id}`),
}

export const quizApi = {
  list: (params?: { competition_id?: number }) => request.get<any[]>('/quiz', { params }),
  detail: (id: number | string) => request.get<any>(`/quiz/${id}`),
  questions: (id: number | string) => request.get<any[]>(`/quiz/${id}/questions`),
  submit: (id: number | string, answers: Record<string, any>) =>
    request.post<{ score: number; total_points: number }>(`/quiz/${id}/submit`, { answers }),
  leaderboard: (id: number | string) => request.get<any[]>(`/quiz/${id}/leaderboard`),
  myAttempts: () => request.get<any[]>('/quiz/my/attempts'),
  create: (body: any) => request.post<{ id: number }>('/quiz', body),
  addQuestion: (id: number | string, body: any) => request.post(`/quiz/${id}/questions`, body),
}

export const collegeOptions = (): Promise<College[]> => request.get<College[]>('/colleges')
