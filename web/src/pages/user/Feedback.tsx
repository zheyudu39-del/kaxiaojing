import PagePlaceholder from '@/components/PagePlaceholder'

export default function Feedback() {
  return (
    <PagePlaceholder
      title="意见反馈"
      description="提交建议与问题反馈"
      endpoints={['POST /api/feedback', 'GET /api/feedback/my']}
    />
  )
}
