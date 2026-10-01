import PagePlaceholder from '@/components/PagePlaceholder'

export default function StudyGroupDetail() {
  return (
    <PagePlaceholder
      title="小组详情"
      description="查看成员与小组消息"
      endpoints={['GET /api/study-groups/:id', 'GET /api/study-groups/:id/members', 'GET /api/study-groups/:id/messages']}
    />
  )
}
