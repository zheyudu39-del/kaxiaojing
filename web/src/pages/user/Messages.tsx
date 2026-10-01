import PagePlaceholder from '@/components/PagePlaceholder'

export default function Messages() {
  return (
    <PagePlaceholder
      title="私信"
      description="用户间一对一聊天"
      endpoints={['GET /api/private-messages/conversations', 'GET /api/private-messages/:userId']}
    />
  )
}
