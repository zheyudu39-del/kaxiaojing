import type { ReactNode } from 'react'
import {
  HomeOutlined,
  TrophyOutlined,
  CalendarOutlined,
  BarChartOutlined,
  TeamOutlined,
  MessageOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  ReadOutlined,
  RobotOutlined,
  SwapOutlined,
  BulbOutlined,
  UsergroupAddOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  StarOutlined,
  MedicineBoxOutlined,
  NotificationOutlined,
  FundOutlined,
  SmileOutlined,
  CheckSquareOutlined,
  BookOutlined,
  ScheduleOutlined,
} from '@ant-design/icons'

/**
 * 导航模型（精简后）
 *
 * 分层原则：同一件事只留一个入口。
 *  - core：核心亮点模块，桌面端直接铺在顶栏，移动端进「导航」下拉
 *  - secondary：并入 core 的子功能入口（如竞赛对比、问答），挂在顶栏「更多」里
 *  - personal：个人向工具，收进右上角头像下拉，不占导航位
 *  - auth/admin：鉴权标记
 *
 * 页面与接口均未删除，仅调整入口位置，可随时回退。
 */
export interface NavItem {
  key: string
  label: string
  path: string
  icon: ReactNode
  /** 需要登录 */
  auth?: boolean
  /** 仅管理员 */
  admin?: boolean
  /** 出现在移动端底部导航 */
  tab?: boolean
  /** 导航层级，默认 core */
  group?: 'core' | 'secondary' | 'personal'
}

export const NAV_ITEMS: NavItem[] = [
  // ---------- 核心亮点（6 个，顶栏常驻） ----------
  { key: 'dashboard', label: '首页', path: '/dashboard', icon: <HomeOutlined />, group: 'core', tab: true },
  { key: 'competitions', label: '竞赛库', path: '/competitions', icon: <TrophyOutlined />, group: 'core', tab: true },
  { key: 'calendar', label: '竞赛日历', path: '/calendar', icon: <CalendarOutlined />, group: 'core' },
  { key: 'recruitment', label: '组队招募', path: '/recruitment', icon: <UsergroupAddOutlined />, group: 'core' },
  { key: 'forum', label: '经验分享', path: '/forum', icon: <FileTextOutlined />, group: 'core', tab: true },
  { key: 'resources', label: '资料库', path: '/resources', icon: <ReadOutlined />, group: 'core' },
  { key: 'ranking', label: '排行榜', path: '/ranking', icon: <BarChartOutlined />, group: 'core' },

  // ---------- 二级入口（并入核心模块，收进「更多」） ----------
  { key: 'compare', label: '竞赛对比', path: '/competitions/compare', icon: <SwapOutlined />, group: 'secondary' },
  { key: 'qa', label: '问答', path: '/qa', icon: <BulbOutlined />, group: 'secondary' },
  { key: 'lobby', label: '交流大厅', path: '/lobby', icon: <MessageOutlined />, group: 'secondary' },
  { key: 'showcases', label: '作品展示', path: '/showcases', icon: <AppstoreOutlined />, group: 'secondary' },
  { key: 'ai-assistant', label: 'AI 助手', path: '/ai-assistant', icon: <RobotOutlined />, group: 'secondary', auth: true },

  // ---------- 个人中心（收进头像下拉，不占导航位） ----------
  { key: 'my-teams', label: '我的队伍', path: '/my-teams', icon: <TeamOutlined />, group: 'personal', auth: true, tab: true },
  { key: 'team-match', label: '组队匹配', path: '/team-match', icon: <UsergroupAddOutlined />, group: 'personal', auth: true },
  { key: 'study-groups', label: '学习小组', path: '/study-groups', icon: <TeamOutlined />, group: 'personal', auth: true },
  { key: 'study-buddy', label: '找学伴', path: '/study-buddy', icon: <SmileOutlined />, group: 'personal', auth: true },
  { key: 'study-checkin', label: '学习打卡', path: '/study-checkin', icon: <CheckSquareOutlined />, group: 'personal', auth: true },
  { key: 'notebook', label: '学习笔记', path: '/notebook', icon: <BookOutlined />, group: 'personal', auth: true },
  { key: 'prep-plan', label: '备赛计划', path: '/prep-plan', icon: <ScheduleOutlined />, group: 'personal', auth: true },
  { key: 'award-certs', label: '获奖证书', path: '/award-certs', icon: <TrophyOutlined />, group: 'personal', auth: true },
  { key: 'timeline', label: '成长轨迹', path: '/timeline', icon: <FundOutlined />, group: 'personal', auth: true },
  { key: 'badges', label: '成就徽章', path: '/badges', icon: <StarOutlined />, group: 'personal', auth: true },
  { key: 'favorites', label: '我的收藏', path: '/favorites', icon: <StarOutlined />, group: 'personal', auth: true },
  { key: 'my-report', label: '我的报告', path: '/my-report', icon: <FundOutlined />, group: 'personal', auth: true },
  { key: 'messages', label: '私信', path: '/messages', icon: <MessageOutlined />, group: 'personal', auth: true },
  { key: 'notifications', label: '通知', path: '/notifications', icon: <BellOutlined />, group: 'personal', auth: true },
  { key: 'feedback', label: '意见反馈', path: '/feedback', icon: <MedicineBoxOutlined />, group: 'personal', auth: true },
  { key: 'settings', label: '设置', path: '/settings', icon: <SettingOutlined />, group: 'personal', auth: true },

  // ---------- 其他 ----------
  { key: 'profile', label: '个人中心', path: '/profile', icon: <UserOutlined />, group: 'personal', auth: true, tab: true },
  { key: 'admin', label: '管理后台', path: '/admin', icon: <NotificationOutlined />, group: 'personal', auth: true, admin: true },
]

/** 按层级 + 鉴权过滤导航项 */
export function filterNav(
  group: NavItem['group'],
  opts: { token?: string | null; role?: string } = {},
): NavItem[] {
  return NAV_ITEMS.filter(
    (i) =>
      (i.group ?? 'core') === group &&
      (!i.auth || opts.token) &&
      (!i.admin || opts.role === 'admin'),
  )
}
