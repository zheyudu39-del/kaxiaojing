import PagePlaceholder from '@/components/PagePlaceholder'

export default function Calendar() {
  return (
    <PagePlaceholder
      title="竞赛日历"
      description="按月份查看竞赛报名与赛程安排"
      endpoints={['GET /api/competitions?month=', 'GET /api/competitions/:id/timeline']}
    />
  )
}
