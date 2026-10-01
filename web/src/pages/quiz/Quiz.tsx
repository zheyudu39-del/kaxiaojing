import PagePlaceholder from '@/components/PagePlaceholder'

export default function Quiz() {
  return (
    <PagePlaceholder
      title="知识测验"
      description="竞赛知识题库与测验"
      endpoints={['GET /api/quiz', 'GET /api/quiz/my/attempts']}
    />
  )
}
