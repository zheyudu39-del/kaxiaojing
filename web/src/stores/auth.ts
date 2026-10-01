import { create } from 'zustand'
import { authApi } from '@/api/auth'
import { profileApi } from '@/api/me'
import { getToken, setToken, clearToken } from '@/utils/request'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  /** 首次校验登录态是否完成 */
  ready: boolean
  loading: boolean

  init: () => Promise<void>
  login: (email: string, password: string) => Promise<User>
  loginByCode: (email: string, code: string) => Promise<User>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  setUser: (u: User | null) => void
}

function readCachedUser(): User | null {
  try {
    const raw = localStorage.getItem('user')
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: readCachedUser(),
  token: getToken(),
  ready: false,
  loading: false,

  /** 应用启动时调用：有 token 就拉一次用户信息，失败则视为未登录 */
  init: async () => {
    const token = getToken()
    if (!token) {
      set({ ready: true, user: null, token: null })
      return
    }
    try {
      const me = await profileApi.me()
      localStorage.setItem('user', JSON.stringify(me))
      set({ user: me, token, ready: true })
    } catch {
      clearToken()
      set({ user: null, token: null, ready: true })
    }
  },

  login: async (email, password) => {
    set({ loading: true })
    try {
      const res = await authApi.login({ email, password })
      setToken(res.token)
      localStorage.setItem('user', JSON.stringify(res.user))
      set({ token: res.token, user: res.user as User })
      return res.user as User
    } finally {
      set({ loading: false })
    }
  },

  loginByCode: async (email, code) => {
    set({ loading: true })
    try {
      const res = await authApi.loginByCode({ email, code })
      setToken(res.token)
      localStorage.setItem('user', JSON.stringify(res.user))
      set({ token: res.token, user: res.user as User })
      return res.user as User
    } finally {
      set({ loading: false })
    }
  },

  register: async (username, email, password) => {
    set({ loading: true })
    try {
      await authApi.register({ username, email, password })
    } finally {
      set({ loading: false })
    }
  },

  logout: async () => {
    try {
      await authApi.logout()
    } catch {
      /* 忽略登出接口失败 */
    }
    clearToken()
    set({ user: null, token: null })
  },

  refresh: async () => {
    try {
      const me = await profileApi.me()
      localStorage.setItem('user', JSON.stringify(me))
      set({ user: me })
    } catch {
      /* ignore */
    }
  },

  setUser: (u) => {
    if (u) localStorage.setItem('user', JSON.stringify(u))
    else localStorage.removeItem('user')
    set({ user: u })
  },
}))
