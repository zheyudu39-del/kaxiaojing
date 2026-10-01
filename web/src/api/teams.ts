import { request } from '@/utils/request'
import type { Team, TeamMember, JoinRequest, TeamTask } from '@/types'

/**
 * 注意：后端多个接口返回的是包装对象而非裸数组，这里统一解包。
 * 另外创建队伍用的字段是 camelCase 的 competitionId（不是 competition_id）。
 */
export const teamApi = {
  my: () => request.get<{ teams: Team[] }>('/teams/my').then((r) => r?.teams ?? []),

  all: (params?: { page?: number; pageSize?: number; keyword?: string }) =>
    request.get<{ teams: Team[]; total?: number }>('/teams/all', { params }),

  byCompetition: (competitionId: number | string) =>
    request
      .get<{ teams: Team[] }>(`/teams/competition/${competitionId}`)
      .then((r) => r?.teams ?? []),

  detail: (teamId: number | string) => request.get<Team>(`/teams/${teamId}`),

  create: (body: { competitionId: number; name: string; description?: string }) =>
    request.post<Team>('/teams', body),

  remove: (teamId: number | string) => request.delete<{ message: string }>(`/teams/${teamId}`),
  leave: (teamId: number | string) => request.delete<{ message: string }>(`/teams/${teamId}/leave`),

  members: (teamId: number | string) =>
    request
      .get<{ members: TeamMember[] }>(`/teams/${teamId}/members`)
      .then((r) => r?.members ?? []),

  removeMember: (teamId: number | string, userId: number) =>
    request.delete<{ message: string }>(`/teams/${teamId}/members/${userId}`),

  transferLeader: (teamId: number | string, newLeaderId: number) =>
    request.put<{ message: string }>(`/teams/${teamId}/transfer-leader`, { newLeaderId }),

  joinRequests: (teamId: number | string) =>
    request
      .get<{ requests: JoinRequest[] }>(`/teams/${teamId}/join-requests`)
      .then((r) => r?.requests ?? []),

  apply: (teamId: number | string) =>
    request.post<{ message: string }>(`/teams/${teamId}/join-requests`),

  reviewRequest: (teamId: number | string, requestId: number, action: 'approve' | 'reject') =>
    request.put<{ message: string }>(`/teams/${teamId}/join-requests/${requestId}`, { action }),

  invites: (teamId: number | string) =>
    request
      .get<{ invites: any[] }>(`/teams/${teamId}/invites`)
      .then((r) => r?.invites ?? []),

  createInvite: (teamId: number | string, body?: { expires_hours?: number; max_uses?: number }) =>
    request.post<any>(`/teams/${teamId}/invites`, body ?? {}),

  revokeInvite: (teamId: number | string, inviteId: number) =>
    request.delete<{ message: string }>(`/teams/${teamId}/invites/${inviteId}`),

  joinByCode: (invite_code: string) =>
    request.post<{ message: string; team_name: string; team_id: number }>('/teams/join-by-code', {
      invite_code,
    }),

  /** 队伍群聊消息 */
  messages: (teamId: number | string, params?: { limit?: number; before?: number }) =>
    request.get<any[]>(`/teams/${teamId}/messages`, { params }),
}

export const teamMatchApi = {
  /** 后端返回 { matches: [...] } */
  match: (params?: { competition_id?: number }) =>
    request
      .get<{ matches: any[] }>('/team-match', { params })
      .then((r) => r?.matches ?? []),
}

export const kanbanApi = {
  board: (teamId: number | string) => request.get<TeamTask[]>(`/kanban/team/${teamId}`),
  createTask: (teamId: number | string, body: Partial<TeamTask>) =>
    request.post<{ id: number }>(`/kanban/team/${teamId}`, body),
  updateTask: (taskId: number, body: Partial<TeamTask>) =>
    request.patch(`/kanban/task/${taskId}`, body),
  updateStatus: (taskId: number, status: string) =>
    request.patch(`/kanban/task/${taskId}/status`, { status }),
  removeTask: (taskId: number) => request.delete(`/kanban/task/${taskId}`),
}

export const teamFileApi = {
  list: (teamId: number | string, params?: { folder_id?: number }) =>
    request.get<any[]>(`/team-files/team/${teamId}`, { params }),
  createFolder: (teamId: number | string, body: { name: string; parent_id?: number }) =>
    request.post(`/team-files/team/${teamId}/folder`, body),
  search: (teamId: number | string, keyword: string) =>
    request.get<any[]>(`/team-files/team/${teamId}/search`, { params: { keyword } }),
  upload: (teamId: number | string, formData: FormData) =>
    request.post(`/team-files/team/${teamId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  downloadUrl: (fileId: number) => `/api/team-files/file/${fileId}/download`,
  rename: (fileId: number, name: string) =>
    request.patch(`/team-files/file/${fileId}/rename`, { name }),
  move: (fileId: number, folderId: number | null) =>
    request.patch(`/team-files/file/${fileId}/move`, { folder_id: folderId }),
  remove: (fileId: number) => request.delete(`/team-files/file/${fileId}`),
}
