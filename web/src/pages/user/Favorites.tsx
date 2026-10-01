import PagePlaceholder from '@/components/PagePlaceholder'

export default function Favorites() {
  return (
    <PagePlaceholder
      title="我的收藏"
      description="收藏的竞赛与标签管理"
      endpoints={['GET /api/favorites', 'GET /api/favorites/tags']}
    />
  )
}
