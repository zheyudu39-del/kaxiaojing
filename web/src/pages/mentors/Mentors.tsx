import PagePlaceholder from '@/components/PagePlaceholder'

export default function Mentors() {
  return (
    <PagePlaceholder
      title="导师指导"
      description="寻找导师、提交指导申请"
      endpoints={['GET /api/mentors', 'POST /api/mentors/:id/request', 'POST /api/mentors/apply']}
    />
  )
}
