import PagePlaceholder from '@/components/PagePlaceholder'

export default function Notifications() {
  return (
    <PagePlaceholder
      title="通知中心"
      description="查看系统与互动通知"
      endpoints={['GET /api/notifications', 'PUT /api/notifications/read-all']}
    />
  )
}
