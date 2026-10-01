import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Badge, Button, Dropdown, Input, Space, Tooltip, Avatar } from 'antd'
import {
  BellOutlined,
  SearchOutlined,
  UserOutlined,
  MenuOutlined,
  DownOutlined,
  LogoutOutlined,
  SettingOutlined,
  RobotOutlined,
} from '@ant-design/icons'
import { NAV_ITEMS, PRIMARY_LIMIT } from './navConfig'
import { useAuthStore } from '@/stores/auth'
import { useNotificationCount } from '@/hooks/useNotificationCount'

interface Props {
  onToggleSider?: () => void
  onSearch?: (kw: string) => void
}

export default function AppHeader({ onToggleSider, onSearch }: Props) {
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const logout = useAuthStore((s) => s.logout)
  const unread = useNotificationCount()

  const isActive = (path: string) =>
    path === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(path)

  const visible = useMemo(
    () => NAV_ITEMS.filter((i) => i.primary && (!i.auth || token) && (!i.admin || user?.role === 'admin')),
    [token, user?.role],
  )

  // 超出 PRIMARY_LIMIT 的进「更多」下拉 —— 修复旧版溢出成 "..." 的问题
  const mainItems = visible.slice(0, PRIMARY_LIMIT)
  const moreItems = NAV_ITEMS.filter(
    (i) => !i.primary && (!i.auth || token) && (!i.admin || user?.role === 'admin'),
  )

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: 64,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '0 16px',
        background: '#001529',
        color: '#fff',
      }}
    >
      {onToggleSider && (
        <Button type="text" icon={<MenuOutlined />} onClick={onToggleSider} style={{ color: '#fff' }} />
      )}

      <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', flexShrink: 0 }}>
        <img src="/logo.png" alt="喀小竞" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />
        <span style={{ fontSize: 16, fontWeight: 500, whiteSpace: 'nowrap' }}>喀小竞</span>
      </Link>

      <nav style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, overflow: 'hidden' }}>
        {mainItems.map((item) => (
          <Link
            key={item.key}
            to={item.path}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 14,
              whiteSpace: 'nowrap',
              color: isActive(item.path) ? '#fff' : 'rgba(255,255,255,.72)',
              background: isActive(item.path) ? 'rgba(24,144,255,.35)' : 'transparent',
            }}
          >
            {item.label}
          </Link>
        ))}

        <Dropdown
          menu={{
            items: moreItems.map((i) => ({
              key: i.key,
              icon: i.icon,
              label: <Link to={i.path}>{i.label}</Link>,
            })),
          }}
        >
          <span
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 14,
              cursor: 'pointer',
              color: 'rgba(255,255,255,.72)',
              whiteSpace: 'nowrap',
            }}
          >
            更多 <DownOutlined style={{ fontSize: 10 }} />
          </span>
        </Dropdown>
      </nav>

      <Space size={12} style={{ flexShrink: 0 }}>
        <Input
          allowClear
          prefix={<SearchOutlined style={{ color: 'rgba(255,255,255,.45)' }} />}
          placeholder="搜索竞赛、帖子、资料"
          style={{ width: 200 }}
          onPressEnter={(e) => onSearch?.((e.target as HTMLInputElement).value)}
        />

        <Tooltip title="AI 助手">
          <Link to="/ai-assistant" style={{ color: '#fff' }}>
            <RobotOutlined style={{ fontSize: 18 }} />
          </Link>
        </Tooltip>

        <Tooltip title="通知">
          <Link to="/notifications" style={{ color: '#fff' }}>
            <Badge count={unread} size="small">
              <BellOutlined style={{ fontSize: 18, color: '#fff' }} />
            </Badge>
          </Link>
        </Tooltip>

        {token ? (
          <Dropdown
            menu={{
              items: [
                { key: 'profile', icon: <UserOutlined />, label: <Link to="/profile">个人中心</Link> },
                { key: 'settings', icon: <SettingOutlined />, label: <Link to="/settings">设置</Link> },
                { type: 'divider' },
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: '退出登录',
                  onClick: () => {
                    logout().then(() => (location.pathname = '/login'))
                  },
                },
              ],
            }}
          >
            <Space style={{ cursor: 'pointer', color: '#fff' }}>
              <Avatar size={28} src={user?.avatar_url || undefined} icon={<UserOutlined />} />
              <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.username}
              </span>
            </Space>
          </Dropdown>
        ) : (
          <Space>
            <Link to="/login">
              <Button type="text" style={{ color: '#fff' }}>
                登录
              </Button>
            </Link>
            <Link to="/register">
              <Button type="primary">注册</Button>
            </Link>
          </Space>
        )}
      </Space>
    </header>
  )
}
