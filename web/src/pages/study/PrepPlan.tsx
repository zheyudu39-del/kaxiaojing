import PagePlaceholder from '@/components/PagePlaceholder'

export default function PrepPlan() {
  return (
    <PagePlaceholder
      title="备赛计划"
      description="管理备赛待办事项"
      endpoints={['GET /api/prep-todos', 'POST /api/prep-todos', 'POST /api/prep-todos/:id/toggle']}
    />
  )
}
