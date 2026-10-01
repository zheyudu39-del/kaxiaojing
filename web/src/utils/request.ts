import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { message } from 'antd'

const TOKEN_KEY = 'token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem('user')
}

/** 401 时的回调，由 App 注入（跳登录页），避免 request 层依赖 router */
let onUnauthorized: (() => void) | null = null
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn
}

const http: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 20000,
})

http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (res) => res.data,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    const status = error.response?.status
    const data = error.response?.data
    const msg = data?.error || data?.message

    if (status === 401) {
      clearToken()
      // 只在非登录页提示，避免刷屏
      if (!location.pathname.startsWith('/login')) {
        message.warning('登录已过期，请重新登录')
      }
      onUnauthorized?.()
      return Promise.reject(error)
    }

    if (status === 403) {
      message.error(msg || '没有权限执行此操作')
    } else if (status === 429) {
      message.error('操作过于频繁，请稍后再试')
    } else if (status && status >= 500) {
      message.error(msg || '服务器开小差了，请稍后再试')
    } else if (msg) {
      message.error(msg)
    } else if (error.code === 'ECONNABORTED') {
      message.error('请求超时，请检查网络')
    }

    return Promise.reject(error)
  },
)

/** 统一的请求方法（返回值已解包为 data） */
export const request = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => http.get(url, config) as unknown as Promise<T>,
  post: <T = any>(url: string, body?: any, config?: AxiosRequestConfig) => http.post(url, body, config) as unknown as Promise<T>,
  put: <T = any>(url: string, body?: any, config?: AxiosRequestConfig) => http.put(url, body, config) as unknown as Promise<T>,
  patch: <T = any>(url: string, body?: any, config?: AxiosRequestConfig) => http.patch(url, body, config) as unknown as Promise<T>,
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => http.delete(url, config) as unknown as Promise<T>,
}

export default http
