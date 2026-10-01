import PagePlaceholder from '@/components/PagePlaceholder'

export default function UserProfile() {
  return (
    <PagePlaceholder
      title="用户主页"
      description="查看他人公开资料与动态"
      endpoints={['GET /api/profile/:userId', 'GET /api/timeline/user/:userId']}
    />
  )
}
