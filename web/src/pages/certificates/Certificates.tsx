import PagePlaceholder from '@/components/PagePlaceholder'

export default function Certificates() {
  return (
    <PagePlaceholder
      title="证书考取"
      description="浏览证书、制定考取计划"
      endpoints={['GET /api/certificates', 'GET /api/cert-plans/my', 'POST /api/cert-plans']}
    />
  )
}
