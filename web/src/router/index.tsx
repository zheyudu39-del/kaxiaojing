import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom'
import { Spin } from 'antd'
import MainLayout from '@/layouts/MainLayout'
import { useAuthStore } from '@/stores/auth'

const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 240 }}>
    <Spin size="large" />
  </div>
)

const wrap = (node: ReactNode) => <Suspense fallback={<Loading />}>{node}</Suspense>

/** 需要登录 */
function RequireAuth({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token)
  const ready = useAuthStore((s) => s.ready)
  const location = useLocation()

  if (!ready) return <Loading />
  if (!token) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return <>{children}</>
}

/** 需要管理员 */
function RequireAdmin({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const ready = useAuthStore((s) => s.ready)

  if (!ready) return <Loading />
  if (!token) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

// ---------- 页面（懒加载） ----------
const Login = lazy(() => import('@/pages/auth/Login'))
const Register = lazy(() => import('@/pages/auth/Register'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'))

const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'))
const Competitions = lazy(() => import('@/pages/competitions/Competitions'))
const CompetitionDetail = lazy(() => import('@/pages/competitions/CompetitionDetail'))
const CompetitionCompare = lazy(() => import('@/pages/competitions/Compare'))
const Calendar = lazy(() => import('@/pages/competitions/Calendar'))
const Ranking = lazy(() => import('@/pages/ranking/Ranking'))

const Forum = lazy(() => import('@/pages/forum/Forum'))
const PostDetail = lazy(() => import('@/pages/forum/PostDetail'))
const Qa = lazy(() => import('@/pages/qa/Qa'))
const QaDetail = lazy(() => import('@/pages/qa/QaDetail'))

const Resources = lazy(() => import('@/pages/resources/Resources'))
const Recruitment = lazy(() => import('@/pages/recruitment/Recruitment'))
const AwardCerts = lazy(() => import('@/pages/certificates/AwardCerts'))

const StudyGroups = lazy(() => import('@/pages/study/StudyGroups'))
const StudyGroupDetail = lazy(() => import('@/pages/study/StudyGroupDetail'))
const StudyCheckin = lazy(() => import('@/pages/study/StudyCheckin'))
const StudyBuddy = lazy(() => import('@/pages/study/StudyBuddy'))
const Notebook = lazy(() => import('@/pages/study/Notebook'))
const PrepPlan = lazy(() => import('@/pages/study/PrepPlan'))

const Teams = lazy(() => import('@/pages/teams/MyTeams'))
const TeamDetail = lazy(() => import('@/pages/teams/TeamDetail'))
const TeamMatch = lazy(() => import('@/pages/teams/TeamMatch'))
const TeamForum = lazy(() => import('@/pages/teams/TeamForum'))
const Kanban = lazy(() => import('@/pages/teams/Kanban'))

const Messages = lazy(() => import('@/pages/user/Messages'))
const Notifications = lazy(() => import('@/pages/user/Notifications'))
const Profile = lazy(() => import('@/pages/user/Profile'))
const UserProfile = lazy(() => import('@/pages/user/UserProfile'))
const Favorites = lazy(() => import('@/pages/user/Favorites'))
const Settings = lazy(() => import('@/pages/user/Settings'))
const Feedback = lazy(() => import('@/pages/user/Feedback'))

const Admin = lazy(() => import('@/pages/admin/Admin'))
const NotFound = lazy(() => import('@/pages/NotFound'))

export const router = createBrowserRouter([
  { path: '/login', element: wrap(<Login />) },
  { path: '/register', element: wrap(<Register />) },
  { path: '/forgot-password', element: wrap(<ForgotPassword />) },

  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },

      // ---- 公开 ----
      { path: 'dashboard', element: wrap(<Dashboard />) },
      { path: 'competitions', element: wrap(<Competitions />) },
      { path: 'competitions/compare', element: wrap(<CompetitionCompare />) },
      { path: 'competitions/:id', element: wrap(<CompetitionDetail />) },
      { path: 'calendar', element: wrap(<Calendar />) },
      { path: 'ranking', element: wrap(<Ranking />) },
      { path: 'forum', element: wrap(<Forum />) },
      { path: 'forum/:id', element: wrap(<PostDetail />) },
      { path: 'qa', element: wrap(<Qa />) },
      { path: 'qa/:id', element: wrap(<QaDetail />) },
      { path: 'resources', element: wrap(<Resources />) },
      { path: 'recruitment', element: wrap(<Recruitment />) },
      { path: 'study-groups', element: wrap(<StudyGroups />) },
      { path: 'study-groups/:id', element: wrap(<StudyGroupDetail />) },
      { path: 'users/:id', element: wrap(<UserProfile />) },

      // ---- 需登录 ----
      { path: 'profile', element: <RequireAuth>{wrap(<Profile />)}</RequireAuth> },
      { path: 'favorites', element: <RequireAuth>{wrap(<Favorites />)}</RequireAuth> },
      { path: 'messages', element: <RequireAuth>{wrap(<Messages />)}</RequireAuth> },
      { path: 'notifications', element: <RequireAuth>{wrap(<Notifications />)}</RequireAuth> },
      { path: 'settings', element: <RequireAuth>{wrap(<Settings />)}</RequireAuth> },
      { path: 'feedback', element: <RequireAuth>{wrap(<Feedback />)}</RequireAuth> },
      { path: 'award-certs', element: <RequireAuth>{wrap(<AwardCerts />)}</RequireAuth> },

      { path: 'my-teams', element: <RequireAuth>{wrap(<Teams />)}</RequireAuth> },
      { path: 'teams/:id', element: <RequireAuth>{wrap(<TeamDetail />)}</RequireAuth> },
      { path: 'teams/:id/kanban', element: <RequireAuth>{wrap(<Kanban />)}</RequireAuth> },
      { path: 'teams/:id/forum', element: <RequireAuth>{wrap(<TeamForum />)}</RequireAuth> },
      { path: 'team-match', element: <RequireAuth>{wrap(<TeamMatch />)}</RequireAuth> },

      { path: 'study-checkin', element: <RequireAuth>{wrap(<StudyCheckin />)}</RequireAuth> },
      { path: 'study-buddy', element: <RequireAuth>{wrap(<StudyBuddy />)}</RequireAuth> },
      { path: 'notebook', element: <RequireAuth>{wrap(<Notebook />)}</RequireAuth> },
      { path: 'prep-plan', element: <RequireAuth>{wrap(<PrepPlan />)}</RequireAuth> },

      // ---- 管理员 ----
      { path: 'admin', element: <RequireAdmin>{wrap(<Admin />)}</RequireAdmin> },

      { path: '*', element: wrap(<NotFound />) },
    ],
  },
])
