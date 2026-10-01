import PagePlaceholder from '@/components/PagePlaceholder'

export default function Admin() {
  return (
    <PagePlaceholder
      title="管理后台"
      description="用户、竞赛、内容审核管理"
      endpoints={['GET /api/admin/dashboard-stats', 'GET /api/admin/reviews', 'GET /api/admin/users']}
    />
  )
}
