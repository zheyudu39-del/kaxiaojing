import PagePlaceholder from '@/components/PagePlaceholder'

export default function TeamForum() {
  return (
    <PagePlaceholder
      title="队伍讨论"
      description="队伍内部群聊"
      endpoints={['GET /api/teams/:teamId/messages']}
    />
  )
}
