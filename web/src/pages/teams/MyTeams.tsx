import PagePlaceholder from '@/components/PagePlaceholder'

export default function MyTeams() {
  return (
    <PagePlaceholder
      title="我的队伍"
      description="查看已加入的队伍"
      endpoints={['GET /api/teams/my', 'POST /api/teams', 'POST /api/teams/join-by-code']}
    />
  )
}
