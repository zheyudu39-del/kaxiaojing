import PagePlaceholder from '@/components/PagePlaceholder'

export default function QaDetail() {
  return (
    <PagePlaceholder
      title="问题详情"
      description="查看回答、投票、采纳"
      endpoints={['GET /api/qa/questions/:id', 'GET /api/qa/questions/:id/answers', 'POST /api/qa/vote']}
    />
  )
}
