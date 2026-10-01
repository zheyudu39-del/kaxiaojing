import PagePlaceholder from '@/components/PagePlaceholder'

export default function DataDashboard() {
  return (
    <PagePlaceholder
      title="数据看板"
      description="平台运营数据可视化"
      endpoints={['GET /api/data-dashboard/overview', 'GET /api/data-dashboard/registration-trend']}
    />
  )
}
