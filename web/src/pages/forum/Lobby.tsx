import PagePlaceholder from '@/components/PagePlaceholder'

export default function Lobby() {
  return (
    <PagePlaceholder
      title="交流大厅"
      description="全站公开聊天室"
      endpoints={['GET /api/lobby/messages', 'POST /api/lobby/messages']}
    />
  )
}
