import PagePlaceholder from '@/components/PagePlaceholder'

export default function Forum() {
  return (
    <PagePlaceholder
      title="经验分享"
      description="浏览与发布竞赛经验帖"
      endpoints={['GET /api/posts', 'POST /api/posts']}
    />
  )
}
