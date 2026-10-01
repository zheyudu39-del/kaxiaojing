import { request } from '@/utils/request'
import type { User } from '@/types'

export interface LoginResult {
  token: string
  user: Pick<User, 'id' | 'username' | 'email' | 'role'>
}

export const authApi = {
  register: (body: { username: string; email: string; password: string }) =>
    request.post<User>('/auth/register', body),

  login: (body: { email: string; password: string }) =>
    request.post<LoginResult>('/auth/login', body),

  /** 验证码登录 */
  loginByCode: (body: { email: string; code: string }) =>
    request.post<LoginResult>('/auth/login-code', body),

  logout: () => request.post<{ message: string }>('/auth/logout'),

  /** 发送验证码（注册/登录/找回密码通用） */
  sendCode: (email: string) => request.post<{ message: string }>('/auth/send-code', { email }),

  forgotPassword: (email: string) =>
    request.post<{ message: string }>('/auth/forgot-password', { email }),

  verifyResetCode: (body: { email: string; code: string }) =>
    request.post<{ message: string; resetToken: string }>('/auth/verify-reset-code', body),

  resetPassword: (body: { email: string; resetToken?: string; code?: string; password: string }) =>
    request.post<{ message: string }>('/auth/reset-password', body),
}
