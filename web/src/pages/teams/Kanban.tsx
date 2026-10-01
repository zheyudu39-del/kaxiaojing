import PagePlaceholder from '@/components/PagePlaceholder'

export default function Kanban() {
  return (
    <PagePlaceholder
      title="任务看板"
      description="队伍任务分配与进度管理"
      endpoints={['GET /api/kanban/team/:teamId', 'POST /api/kanban/team/:teamId', 'PATCH /api/kanban/task/:taskId/status']}
    />
  )
}
