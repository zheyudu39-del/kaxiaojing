import { request } from '@/utils/request'
import type { Team, TeamMember, JoinRequest, TeamTask } from '@/types'

export const teamApi = {
  my: () => request.get<Team[]>('/teams/my'),
  all: (params?: { page?: number; pageSize?: number; keyword?: string }) =>
    request.get<{ teams: Team[]; total: number }>('/teams/all', { params }),
  byCompetition: (competitionId: number | string) =>
    request.get<Team[]>(`/teams/competition/${competitionId}`),
  detail: (teamId: number | string) => request.get<Team>(`/teams/${teamId}`),

  create: (body: { name: string; competition_id: number; description?: string; max_members?: number }) =>
    request.post<{ id: number }>('/teams', body),
  remove: (teamId: number | string) => request.delete(`/teams/${teamId}`),
  leave: (teamId: number | string) => request.delete(`/teams/${teamId}/leave`),

  members: (teamId: number | string) => request.get<TeamMember[]>(`/teams/${teamId}/members`),
  removeMember: (teamId: number | string, userId: number) =>
    request.delete(`/teams/${teamId}/members/${userId}`),
  transferLeader: (teamId: number | string, userId: number) =>
    request.put(`/teams/${teamId}/transfer-leader`, { userId }),

  joinRequests: (teamId: number | string) => request.get<JoinRequest[]>(`/teams/${teamId}/join-requests`),
  apply: (teamId: number | string, message?: string) =>
    request.post(`/teams/${teamId}/join-requests`, { message }),
  reviewRequest: (teamId: number | string, requestId: number, action: 'approve' | 'reject') =>
    request.put(`/teams/${teamId}/join-requests/${requestId}`, { action }),

  invites: (teamId: number | string) => request.get<any[]>(`/teams/${teamId}/invites`),
  createInvite: (teamId: number | string, body?: { expires_in_hours?: number; max_uses?: number }) =>
    request.post<any>(`/teams/${teamId}/invites`, body),
  revokeInvite: (teamId: number | string, inviteId: number) =>
    request.delete(`/teams/${teamId}/invites/${inviteId}`),
  joinByCode: (invite_code: string) => request.post<{ team_id: number }>('/teams/join-by-code', { invite_code }),

  /** 队伍群聊消息 */
  messages: (teamId: number | string, params?: { limit?: number; before?: number }) =>
    request.get<any[]>(`/teams/${teamId}/messages`, { params }),
}

export const teamMatchApi = {
  match: (params?: { competition_id?: number }) => request.get<any[]>('/team-match', { params }),
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
