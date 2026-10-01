import PagePlaceholder from '@/components/PagePlaceholder'

export default function Qa() {
  return (
    <PagePlaceholder
      title="问答广场"
      description="提问与回答竞赛相关问题"
      endpoints={['GET /api/qa/questions', 'POST /api/qa/questions', 'GET /api/qa/tags/popular']}
    />
  )
}
