import PagePlaceholder from '@/components/PagePlaceholder'

export default function TeamMatch() {
  return (
    <PagePlaceholder
      title="组队匹配"
      description="按竞赛推荐合适的队友"
      endpoints={['GET /api/team-match']}
    />
  )
}
