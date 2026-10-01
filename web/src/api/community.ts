import { request } from '@/utils/request'
import type { Post, Comment, PrivateMessage, Conversation, Activity, QAQuestion, QAAnswer, Showcase, Mentor, User } from '@/types'

export const postApi = {
  list: (params?: { page?: number; pageSize?: number; category?: string; keyword?: string; sort?: string }) =>
    request.get<{ posts: Post[]; total: number }>('/posts', { params }),
  detail: (id: number | string) => request.get<Post & { comments?: Comment[] }>(`/posts/${id}`),
  create: (body: { title: string; content: string; category?: string; tags?: string }) =>
    request.post<{ id: number }>('/posts', body),
  update: (id: number | string, body: Partial<Post>) => request.put(`/posts/${id}`, body),
  remove: (id: number | string) => request.delete(`/posts/${id}`),

  like: (id: number | string) => request.post<{ liked: boolean; like_count: number }>(`/posts/${id}/like`),
  bookmark: (id: number | string) => request.post<{ bookmarked: boolean }>(`/posts/${id}/bookmark`),
  bookmarks: (params?: { page?: number; pageSize?: number }) =>
    request.get<{ posts: Post[]; total: number }>('/posts/bookmarks', { params }),

  comments: (id: number | string) => request.get<Comment[]>(`/posts/${id}/comments`).catch(() => [] as Comment[]),
  addComment: (id: number | string, content: string) =>
    request.post(`/posts/${id}/comments`, { content }),
  updateComment: (id: number | string, commentId: number, content: string) =>
    request.put(`/posts/${id}/comments/${commentId}`, { content }),
  removeComment: (id: number | string, commentId: number) =>
    request.delete(`/posts/${id}/comments/${commentId}`),

  uploadImage: (formData: FormData) =>
    request.post<{ url: string }>('/posts/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  searchUsers: (keyword: string) => request.get<User[]>('/posts/users/search', { params: { keyword } }),
}

export const lobbyApi = {
  messages: (params?: { limit?: number; before?: number }) =>
    request.get<any[]>('/lobby/messages', { params }),
  send: (content: string) => request.post('/lobby/messages', { content }),
  remove: (id: number) => request.delete(`/lobby/messages/${id}`),
}

export const messageApi = {
  conversations: () => request.get<Conversation[]>('/private-messages/conversations'),
  history: (userId: number, params?: { limit?: number; before?: number }) =>
    request.get<PrivateMessage[]>(`/private-messages/${userId}`, { params }),
  send: (receiver_id: number, content: string) =>
    request.post<{ id: number }>('/private-messages', { receiver_id, content }),
  searchUsers: (keyword: string) =>
    request.get<User[]>('/private-messages/users/search', { params: { keyword } }),
}

export const followApi = {
  follow: (userId: number) => request.post(`/follows/${userId}`),
  unfollow: (userId: number) => request.delete(`/follows/${userId}`),
  followers: (userId?: number) =>
    userId ? request.get<User[]>(`/follows/${userId}/followers`) : request.get<User[]>('/follows/followers'),
  following: (userId?: number) =>
    userId ? request.get<User[]>(`/follows/${userId}/following`) : request.get<User[]>('/follows/following'),
  counts: (userId: number) =>
    request.get<{ followers: number; following: number }>(`/follows/${userId}/counts`),
  check: (userId: number) => request.get<{ following: boolean }>(`/follows/check/${userId}`),
  status: (userId: number) => request.get<any>(`/follows/${userId}/status`),
}

export const activityApi = {
  my: (params?: { page?: number; pageSize?: number }) =>
    request.get<{ activities: Activity[]; total: number }>('/activities/my', { params }),
  following: (params?: { page?: number; pageSize?: number }) =>
    request.get<{ activities: Activity[]; total: number }>('/activities/following', { params }),
  byUser: (userId: number, params?: any) =>
    request.get<{ activities: Activity[]; total: number }>(`/activities/user/${userId}`, { params }),
  detail: (id: number) => request.get<Activity>(`/activities/${id}`),
}

export const qaApi = {
  questions: (params?: { page?: number; pageSize?: number; tag?: string; keyword?: string; sort?: string }) =>
    request.get<{ questions: QAQuestion[]; total: number }>('/qa/questions', { params }),
  question: (id: number | string) => request.get<QAQuestion>(`/qa/questions/${id}`),
  createQuestion: (body: { title: string; content: string; tags?: string; competition_id?: number }) =>
    request.post<{ success: boolean; question_id: number }>('/qa/questions', body),
  updateQuestion: (id: number | string, body: Partial<QAQuestion>) =>
    request.patch(`/qa/questions/${id}`, body),
  removeQuestion: (id: number | string) => request.delete(`/qa/questions/${id}`),
  answers: (id: number | string) =>
    request.get<{ answers: QAAnswer[] }>(`/qa/questions/${id}/answers`).then((r) => r?.answers ?? []),
  createAnswer: (id: number | string, content: string) =>
    request.post(`/qa/questions/${id}/answers`, { content }),
  updateAnswer: (id: number, content: string) => request.patch(`/qa/answers/${id}`, { content }),
  removeAnswer: (id: number) => request.delete(`/qa/answers/${id}`),
  accept: (questionId: number, answerId: number) =>
    request.post(`/qa/questions/${questionId}/accept/${answerId}`),
  vote: (body: { target_type: 'question' | 'answer'; target_id: number; vote_type: 1 | -1 }) =>
    request.post('/qa/vote', body),
  votesStatus: (body: { target_type: string; target_ids: number[] }) =>
    request.post('/qa/votes/status', body),
  popularTags: () =>
    request.get<{ tags: { tag: string; count: number }[] }>('/qa/tags/popular').then((r) => r?.tags ?? []),
}

export const showcaseApi = {
  list: (params?: { page?: number; pageSize?: number; competition_id?: number; year?: number; keyword?: string }) =>
    request.get<{ showcases: Showcase[] }>('/showcases', { params }),
  detail: (id: number | string) => request.get<Showcase & { is_liked?: boolean }>(`/showcases/${id}`),
  create: (body: Partial<Showcase>) =>
    request.post<{ success: boolean; showcase_id: number }>('/showcases', body),
  my: () => request.get<{ showcases: Showcase[] }>('/showcases/user/my').then((r) => r?.showcases ?? []),
  like: (id: number | string) => request.post(`/showcases/${id}/like`),
  unlike: (id: number | string) => request.delete(`/showcases/${id}/like`),
}

export const mentorApi = {
  list: (params?: { page?: number; pageSize?: number; competition_id?: number; keyword?: string }) =>
    request.get<{ mentors: Mentor[] }>('/mentors', { params }),
  detail: (id: number | string) =>
    request.get<{ mentor: Mentor; reviews: any[] }>(`/mentors/${id}`),
  apply: (body: { introduction: string; achievements: string; skills?: string; competition_ids?: number[] }) =>
    request.post<{ success: boolean; mentor_id: number }>('/mentors/apply', body),
  requestMentor: (id: number | string, body: { message?: string; competition_id?: number }) =>
    request.post(`/mentors/${id}/request`, body),
  review: (id: number | string, body: { rating: number; content?: string }) =>
    request.post(`/mentors/${id}/review`, body),

  myInfo: () => request.get<{ mentor: Mentor | null }>('/mentors/my/info').then((r) => r?.mentor ?? null),
  myApplications: () =>
    request.get<{ applications: any[] }>('/mentors/my/applications').then((r) => r?.applications ?? []),
  myMentees: () => request.get<{ mentees: any[] }>('/mentors/my/mentees').then((r) => r?.mentees ?? []),
  myMentors: () => request.get<{ mentors: any[] }>('/mentors/my/mentors').then((r) => r?.mentors ?? []),
  myRequests: () => request.get<{ requests: any[] }>('/mentors/my/requests').then((r) => r?.requests ?? []),
  updateStatus: (body: { is_active: boolean }) => request.patch('/mentors/my/status', body),
  handleRequest: (id: number, action: 'approve' | 'reject') =>
    request.patch(`/mentors/request/${id}`, { action }),
}
