import PagePlaceholder from '@/components/PagePlaceholder'

export default function TeamDetail() {
  return (
    <PagePlaceholder
      title="队伍详情"
      description="成员管理、加入申请、邀请码"
      endpoints={['GET /api/teams/:id', 'GET /api/teams/:id/members', 'POST /api/teams/:id/join-requests']}
    />
  )
}
