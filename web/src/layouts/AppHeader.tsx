import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Badge, Button, Dropdown, Input, Space, Tooltip, Avatar } from 'antd'
import {
  BellOutlined,
  SearchOutlined,
  UserOutlined,
  MenuOutlined,
  DownOutlined,
  LogoutOutlined,
  RobotOutlined,
  CompassOutlined,
} from '@ant-design/icons'
import { filterNav } from './navConfig'
import { useAuthStore } from '@/stores/auth'
import { useNotificationCount } from '@/hooks/useNotificationCount'
import { useIsMobile } from '@/hooks/useMediaQuery'

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
  const isMobile = useIsMobile()
  const [searchOpen, setSearchOpen] = useState(false)

  const isActive = (path: string) =>
    path === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(path)

  const authOpts = { token, role: user?.role }

  // 核心模块：顶栏常驻（移动端进「导航」下拉）
  const coreItems = useMemo(() => filterNav('core', authOpts), [token, user?.role])
  // 二级入口：并入核心模块的子功能，收进「更多」
  const secondaryItems = useMemo(() => filterNav('secondary', authOpts), [token, user?.role])
  // 个人向工具：收进头像下拉，不占导航位
  const personalItems = useMemo(() => filterNav('personal', authOpts), [token, user?.role])

  // 移动端顶部下拉只放核心 + 二级（个人项已在底部导航和头像菜单里）
  const mobileNavItems = useMemo(
    () => [...coreItems, ...secondaryItems],
    [coreItems, secondaryItems],
  )

  // 头像下拉里的个人工具链接（排除「个人中心」本身，它在菜单首项单独渲染）
  const personalMenuItems = personalItems
    .filter((i) => i.key !== 'profile')
    .map((i) => ({ key: i.key, icon: i.icon, label: <Link to={i.path}>{i.label}</Link> }))

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: 64,
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? 8 : 16,
        padding: isMobile ? '0 10px' : '0 16px',
        background: '#001529',
        color: '#fff',
      }}
    >
      {onToggleSider && (
        <Button type="text" icon={<MenuOutlined />} onClick={onToggleSider} style={{ color: '#fff' }} />
      )}

      <Link
        to="/dashboard"
        style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', flexShrink: 0 }}
      >
        <img src="/logo.png" alt="喀小竞" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />
        {!isMobile && <span style={{ fontSize: 16, fontWeight: 500, whiteSpace: 'nowrap' }}>喀小竞</span>}
      </Link>

      {/* 移动端：导航收进下拉，避免旧版顶部导航横向溢出 */}
      {isMobile ? (
        <div style={{ flex: 1, minWidth: 0 }}>
          <Dropdown
            placement="bottomLeft"
            menu={{
              items: mobileNavItems.map((i) => ({
                key: i.key,
                icon: i.icon,
                label: <Link to={i.path}>{i.label}</Link>,
              })),
            }}
          >
            <Button type="text" icon={<CompassOutlined />} style={{ color: '#fff' }}>
              导航 <DownOutlined style={{ fontSize: 10 }} />
            </Button>
          </Dropdown>
        </div>
      ) : (
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, overflow: 'hidden' }}>
          {coreItems.map((item) => (
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

          {secondaryItems.length > 0 && (
            <Dropdown
              menu={{
                items: secondaryItems.map((i) => ({
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
          )}
        </nav>
      )}

      <Space size={isMobile ? 8 : 12} style={{ flexShrink: 0 }}>
        {/* 移动端搜索框改为图标展开，避免固定 200px 撑破头部 */}
        {isMobile ? (
          searchOpen ? (
            <Input
              autoFocus
              allowClear
              size="small"
              prefix={<SearchOutlined style={{ color: 'rgba(255,255,255,.45)' }} />}
              placeholder="搜索"
              style={{ width: 130 }}
              onBlur={() => setSearchOpen(false)}
              onPressEnter={(e) => {
                onSearch?.((e.target as HTMLInputElement).value)
                setSearchOpen(false)
              }}
            />
          ) : (
            <Button
              type="text"
              icon={<SearchOutlined style={{ fontSize: 18 }} />}
              onClick={() => setSearchOpen(true)}
              style={{ color: '#fff' }}
              aria-label="搜索"
            />
          )
        ) : (
          <Input
            allowClear
            prefix={<SearchOutlined style={{ color: 'rgba(255,255,255,.45)' }} />}
            placeholder="搜索竞赛、帖子、资料"
            style={{ width: 200 }}
            onPressEnter={(e) => onSearch?.((e.target as HTMLInputElement).value)}
          />
        )}

        {!isMobile && (
          <Tooltip title="AI 助手">
            <Link to="/ai-assistant" style={{ color: '#fff' }}>
              <RobotOutlined style={{ fontSize: 18 }} />
            </Link>
          </Tooltip>
        )}

        <Tooltip title="通知">
          <Link to="/notifications" style={{ color: '#fff' }}>
            <Badge count={unread} size="small">
              <BellOutlined style={{ fontSize: 18, color: '#fff' }} />
            </Badge>
          </Link>
        </Tooltip>

        {token ? (
          <Dropdown
            placement="bottomRight"
            menu={{
              items: [
                { key: 'profile', icon: <UserOutlined />, label: <Link to="/profile">个人中心</Link> },
                { type: 'divider' },
                ...personalMenuItems,
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
              style: { maxHeight: 420, overflowY: 'auto' },
            }}
          >
            <Space style={{ cursor: 'pointer', color: '#fff' }}>
              <Avatar size={28} src={user?.avatar_url || undefined} icon={<UserOutlined />} />
              {!isMobile && (
                <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.username}
                </span>
              )}
            </Space>
          </Dropdown>
        ) : (
          <Space size={isMobile ? 4 : 8}>
            <Link to="/login">
              <Button type="text" style={{ color: '#fff' }}>
                登录
              </Button>
            </Link>
            {!isMobile && (
              <Link to="/register">
                <Button type="primary">注册</Button>
              </Link>
            )}
          </Space>
        )}
      </Space>
    </header>
  )
}
