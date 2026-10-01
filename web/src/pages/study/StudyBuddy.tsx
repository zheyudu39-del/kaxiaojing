import PagePlaceholder from '@/components/PagePlaceholder'

export default function StudyBuddy() {
  return (
    <PagePlaceholder
      title="找学伴"
      description="按竞赛匹配学习伙伴"
      endpoints={['GET /api/study-buddy/match', 'GET /api/study-buddy/competition/:id']}
    />
  )
}
