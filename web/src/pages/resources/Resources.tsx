import PagePlaceholder from '@/components/PagePlaceholder'

export default function Resources() {
  return (
    <PagePlaceholder
      title="资料库"
      description="竞赛资料上传、下载与评分"
      endpoints={['GET /api/resources', 'POST /api/resources', 'POST /api/resources/:id/rate']}
    />
  )
}
