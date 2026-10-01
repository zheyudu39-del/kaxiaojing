import PagePlaceholder from '@/components/PagePlaceholder'

export default function AwardCerts() {
  return (
    <PagePlaceholder
      title="获奖证书"
      description="管理并生成获奖证书"
      endpoints={['GET /api/award-certs', 'POST /api/award-certs/auto-generate']}
    />
  )
}
