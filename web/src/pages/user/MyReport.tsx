import PagePlaceholder from '@/components/PagePlaceholder'

export default function MyReport() {
  return (
    <PagePlaceholder
      title="我的报告"
      description="周报、月报与成长报告"
      endpoints={['GET /api/report/weekly', 'GET /api/report/monthly', 'GET /api/growth-report']}
    />
  )
}
