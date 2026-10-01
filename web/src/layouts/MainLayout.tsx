import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import AppHeader from './AppHeader'
import AppSider from './AppSider'
import BottomNav from './BottomNav'
import { useIsMobile } from '@/hooks/useMediaQuery'

const SIDER_W = 280

export default function MainLayout() {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const location = useLocation()
  const [siderOpen, setSiderOpen] = useState(true)

  const handleSearch = (kw: string) => {
    if (kw.trim()) navigate(`/competitions?keyword=${encodeURIComponent(kw.trim())}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <AppHeader
        onToggleSider={isMobile ? undefined : () => setSiderOpen((v) => !v)}
        onSearch={handleSearch}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {!isMobile && siderOpen && (
          <aside
            style={{
              width: SIDER_W,
              flexShrink: 0,
              position: 'sticky',
              top: 64,
              height: 'calc(100vh - 64px)',
              borderRight: '1px solid #f0f0f0',
            }}
          >
            <AppSider />
          </aside>
        )}

        <main
          className="page-container"
          style={{
            flex: 1,
            minWidth: 0,
            padding: isMobile ? 12 : 16,
          }}
        >
          <div className="fade-in" key={location.pathname}>
            <Outlet />
          </div>
        </main>
      </div>

      {isMobile && <BottomNav />}
    </div>
  )
}
