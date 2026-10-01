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
  SafetyCertificateOutlined,
  RobotOutlined,
  SwapOutlined,
  BulbOutlined,
  UsergroupAddOutlined,
  CheckSquareOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  StarOutlined,
  MedicineBoxOutlined,
  DashboardOutlined,
  FundOutlined,
  NotificationOutlined,
  BookOutlined,
} from '@ant-design/icons'

export interface NavItem {
  key: string
  label: string
  path: string
  icon: ReactNode
  /** 需要登录 */
  auth?: boolean
  /** 仅管理员 */
  admin?: boolean
  /** 是否出现在顶部主导航 */
  primary?: boolean
  /** 是否出现在移动端底部导航 */
  tab?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: '首页', path: '/dashboard', icon: <HomeOutlined />, primary: true, tab: true },
  { key: 'competitions', label: '竞赛列表', path: '/competitions', icon: <TrophyOutlined />, primary: true, tab: true },
  { key: 'calendar', label: '竞赛日历', path: '/calendar', icon: <CalendarOutlined />, primary: true },
  { key: 'ranking', label: '排行榜', path: '/ranking', icon: <BarChartOutlined />, primary: true },
  { key: 'forum', label: '经验分享', path: '/forum', icon: <FileTextOutlined />, primary: true },
  { key: 'lobby', label: '交流大厅', path: '/lobby', icon: <MessageOutlined />, primary: true },
  { key: 'qa', label: '问答', path: '/qa', icon: <BulbOutlined />, primary: true },
  { key: 'recruitment', label: '招募广场', path: '/recruitment', icon: <UsergroupAddOutlined />, primary: true },

  { key: 'resources', label: '资料库', path: '/resources', icon: <ReadOutlined /> },
  { key: 'certificates', label: '证书考取', path: '/certificates', icon: <SafetyCertificateOutlined /> },
  { key: 'mentors', label: '导师指导', path: '/mentors', icon: <TeamOutlined /> },
  { key: 'showcases', label: '作品展示', path: '/showcases', icon: <AppstoreOutlined /> },
  { key: 'compare', label: '竞赛对比', path: '/competitions/compare', icon: <SwapOutlined /> },
  { key: 'statistics', label: '数据统计', path: '/statistics', icon: <FundOutlined /> },
  { key: 'data-dashboard', label: '数据看板', path: '/data-dashboard', icon: <DashboardOutlined /> },
  { key: 'quiz', label: '知识测验', path: '/quiz', icon: <BookOutlined /> },
  { key: 'study-groups', label: '学习小组', path: '/study-groups', icon: <TeamOutlined /> },
  { key: 'timeline', label: '成长轨迹', path: '/timeline', icon: <FundOutlined /> },
  { key: 'ai-assistant', label: 'AI 助手', path: '/ai-assistant', icon: <RobotOutlined />, auth: true },

  { key: 'my-teams', label: '我的队伍', path: '/my-teams', icon: <TeamOutlined />, auth: true, tab: true },
  { key: 'team-match', label: '组队匹配', path: '/team-match', icon: <UsergroupAddOutlined />, auth: true },
  { key: 'study-checkin', label: '学习打卡', path: '/study-checkin', icon: <CheckSquareOutlined />, auth: true },
  { key: 'study-buddy', label: '找学伴', path: '/study-buddy', icon: <TeamOutlined />, auth: true },
  { key: 'notebook', label: '学习笔记', path: '/notebook', icon: <BookOutlined />, auth: true },
  { key: 'prep-plan', label: '备赛计划', path: '/prep-plan', icon: <CheckSquareOutlined />, auth: true },
  { key: 'award-certs', label: '获奖证书', path: '/award-certs', icon: <SafetyCertificateOutlined />, auth: true },
  { key: 'badges', label: '成就徽章', path: '/badges', icon: <StarOutlined />, auth: true },
  { key: 'favorites', label: '我的收藏', path: '/favorites', icon: <StarOutlined />, auth: true },
  { key: 'my-report', label: '我的报告', path: '/my-report', icon: <FundOutlined />, auth: true },
  { key: 'messages', label: '私信', path: '/messages', icon: <MessageOutlined />, auth: true },
  { key: 'notifications', label: '通知', path: '/notifications', icon: <BellOutlined />, auth: true },
  { key: 'feedback', label: '意见反馈', path: '/feedback', icon: <MedicineBoxOutlined />, auth: true },
  { key: 'settings', label: '设置', path: '/settings', icon: <SettingOutlined />, auth: true },
  { key: 'admin', label: '管理后台', path: '/admin', icon: <NotificationOutlined />, auth: true, admin: true },
  { key: 'profile', label: '个人中心', path: '/profile', icon: <UserOutlined />, auth: true, tab: true },
]

/** 顶部主导航显示的数量（其余进「更多」下拉，避免旧版溢出成 "..."） */
export const PRIMARY_LIMIT = 8
