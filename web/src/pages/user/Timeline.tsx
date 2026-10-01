import PagePlaceholder from '@/components/PagePlaceholder'

export default function Timeline() {
  return (
    <PagePlaceholder
      title="成长轨迹"
      description="个人竞赛成长记录"
      endpoints={['GET /api/timeline/my', 'GET /api/timeline/my/growth']}
    />
  )
}
