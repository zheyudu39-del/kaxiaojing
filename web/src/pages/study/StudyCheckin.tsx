import PagePlaceholder from '@/components/PagePlaceholder'

export default function StudyCheckin() {
  return (
    <PagePlaceholder
      title="学习打卡"
      description="制定学习计划并每日打卡"
      endpoints={['GET /api/study-checkin/plans', 'POST /api/study-checkin/plans/:id/checkins']}
    />
  )
}
