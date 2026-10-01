import PagePlaceholder from '@/components/PagePlaceholder'

export default function AiAssistant() {
  return (
    <PagePlaceholder
      title="AI 助手"
      description="竞赛咨询与备赛建议"
      endpoints={['POST /api/ai/chat', 'GET /api/ai/history']}
    />
  )
}
