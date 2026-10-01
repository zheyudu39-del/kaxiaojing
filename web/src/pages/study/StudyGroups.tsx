import PagePlaceholder from '@/components/PagePlaceholder'

export default function StudyGroups() {
  return (
    <PagePlaceholder
      title="学习小组"
      description="创建与加入学习小组"
      endpoints={['GET /api/study-groups', 'POST /api/study-groups', 'POST /api/study-groups/:id/join']}
    />
  )
}
