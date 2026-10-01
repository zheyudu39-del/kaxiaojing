import { Link, useLocation } from 'react-router-dom'
import { Badge } from 'antd'
import { NAV_ITEMS } from './navConfig'
import { useAuthStore } from '@/stores/auth'
import { useNotificationCount } from '@/hooks/useNotificationCount'

/** 移动端底部导航。高度由 global.css 的 --bottom-nav-h 控制，页面容器已预留安全区。 */
export default function BottomNav() {
  const location = useLocation()
  const token = useAuthStore((s) => s.token)
  const unread = useNotificationCount()

  const items = NAV_ITEMS.filter((i) => i.tab && (!i.auth || token))

  return (
    <nav
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        height: 'var(--bottom-nav-h)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        display: 'flex',
        background: '#fff',
        borderTop: '1px solid #f0f0f0',
      }}
    >
      {items.map((item) => {
        const active = item.path === '/dashboard'
          ? location.pathname === '/dashboard'
          : location.pathname.startsWith(item.path)
        return (
          <Link
            key={item.key}
            to={item.path}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              fontSize: 11,
              color: active ? '#1890ff' : '#8c8c8c',
            }}
          >
            <Badge dot={item.key === 'profile' && unread > 0} offset={[4, 0]}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
            </Badge>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
