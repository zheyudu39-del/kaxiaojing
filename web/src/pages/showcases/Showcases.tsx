import PagePlaceholder from '@/components/PagePlaceholder'

export default function Showcases() {
  return (
    <PagePlaceholder
      title="作品展示"
      description="展示获奖作品与项目"
      endpoints={['GET /api/showcases', 'POST /api/showcases', 'POST /api/showcases/:id/like']}
    />
  )
}
