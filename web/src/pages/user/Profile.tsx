import PagePlaceholder from '@/components/PagePlaceholder'

export default function Profile() {
  return (
    <PagePlaceholder
      title="个人中心"
      description="编辑资料、技能、获奖经历"
      endpoints={['GET /api/profile', 'PUT /api/profile', 'POST /api/profile/avatar']}
    />
  )
}
