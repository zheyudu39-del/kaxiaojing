import { useEffect, useMemo } from 'react'
import { ConfigProvider, App as AntApp, theme as antdTheme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { RouterProvider } from 'react-router-dom'

import { router } from './router'
import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'
import { setUnauthorizedHandler } from './utils/request'

dayjs.locale('zh-cn')

export default function App() {
  const mode = useThemeStore((s) => s.mode)
  const fontSize = useThemeStore((s) => s.fontSize)
  const compact = useThemeStore((s) => s.compact)
  const init = useAuthStore((s) => s.init)

  useEffect(() => {
    init()
  }, [init])

  // 401 时统一跳登录页
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (!location.pathname.startsWith('/login')) {
        location.href = '/login'
      }
    })
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode)
  }, [mode])

  const algorithm = useMemo(() => {
    const base = mode === 'dark' ? [antdTheme.darkAlgorithm] : [antdTheme.defaultAlgorithm]
    return compact ? [...base, antdTheme.compactAlgorithm] : base
  }, [mode, compact])

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
          fontSize: fontSize === 'small' ? 12 : fontSize === 'large' ? 16 : 14,
        },
        components: {
          Layout: { headerHeight: 64, headerPadding: '0 16px' },
          Menu: { itemHeight: 40 },
        },
      }}
    >
      <AntApp>
        <RouterProvider router={router} />
      </AntApp>
    </ConfigProvider>
  )
}
