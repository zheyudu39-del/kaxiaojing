import { useState } from 'react'
import { Button, Card, Divider, Modal, Segmented, Space, Switch, Typography, App } from 'antd'
import { DeleteOutlined, ExportOutlined, LogoutOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'

const { Text, Paragraph } = Typography

/**
 * 设置页。
 * 修复旧版问题：表单宽度只用了卡片的一半、右侧大片留白 —— 这里让内容区自适应撑满。
 */
export default function Settings() {
  const { message, modal } = App.useApp()
  const navigate = useNavigate()
  const { mode, fontSize, compact, setMode, setFontSize, setCompact } = useThemeStore()
  const logout = useAuthStore((s) => s.logout)

  const handleLogout = () => {
    modal.confirm({
      title: '确认退出登录？',
      content: '退出后需要重新登录才能使用需要登录的功能。',
      okText: '退出',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        await logout()
        navigate('/login', { replace: true })
      },
    })
  }

  const clearLocalCache = () => {
    const keep = ['token', 'user', 'theme-pref']
    Object.keys(localStorage)
      .filter((k) => !keep.includes(k))
      .forEach((k) => localStorage.removeItem(k))
    message.success('本地缓存已清理')
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <Card title="显示设置" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <SettingRow label="深色模式" hint="夜间使用更护眼">
            <Switch checked={mode === 'dark'} onChange={(v) => setMode(v ? 'dark' : 'light')} />
          </SettingRow>
          <Divider style={{ margin: '12px 0' }} />

          <SettingRow label="字体大小" hint="影响全站文字与控件尺寸">
            <Segmented
              value={fontSize}
              onChange={(v) => setFontSize(v as 'small' | 'middle' | 'large')}
              options={[
                { label: '小', value: 'small' },
                { label: '中', value: 'middle' },
                { label: '大', value: 'large' },
              ]}
            />
          </SettingRow>
          <Divider style={{ margin: '12px 0' }} />

          <SettingRow label="紧凑模式" hint="减少页面间距，一屏显示更多内容">
            <Switch checked={compact} onChange={setCompact} />
          </SettingRow>
        </div>
      </Card>

      <Card title="通知设置" style={{ marginBottom: 16 }}>
        <Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 12 }}>
          通知由服务端统一管理，可在
          <a onClick={() => navigate('/notifications')}> 通知中心 </a>
          查看和管理。
        </Paragraph>
        <Space wrap>
          <Button onClick={() => navigate('/notifications')}>打开通知中心</Button>
        </Space>
      </Card>

      <Card title="通用设置">
        <SettingRow label="清理本地缓存" hint="清除离线数据等本地缓存，不影响账号数据">
          <Button icon={<DeleteOutlined />} onClick={clearLocalCache}>
            清理
          </Button>
        </SettingRow>
        <Divider style={{ margin: '12px 0' }} />

        <SettingRow label="导出我的数据" hint="导出个人资料与参赛记录（CSV）">
          <Button
            icon={<ExportOutlined />}
            href="/api/export/profile"
            target="_blank"
            onClick={() => message.info('若浏览器未自动下载，请检查登录状态')}
          >
            导出
          </Button>
        </SettingRow>
        <Divider style={{ margin: '12px 0' }} />

        <SettingRow label="退出登录" hint="当前账号将退出，需要重新登录">
          <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>
            退出登录
          </Button>
        </SettingRow>
      </Card>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          喀小竞 · 大学生竞赛交流平台
        </Text>
      </div>
    </div>
  )
}

function SettingRow({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        minHeight: 44,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14 }}>{label}</div>
        {hint && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {hint}
          </Text>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}
