import PagePlaceholder from '@/components/PagePlaceholder'

export default function Recruitment() {
  return (
    <PagePlaceholder
      title="招募广场"
      description="发布与申请组队招募"
      endpoints={['GET /api/recruitments', 'POST /api/recruitments', 'POST /api/recruitments/:id/apply']}
    />
  )
}
