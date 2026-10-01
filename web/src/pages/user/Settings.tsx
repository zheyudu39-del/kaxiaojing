import PagePlaceholder from '@/components/PagePlaceholder'

export default function Settings() {
  return (
    <PagePlaceholder
      title="设置"
      description="显示、通知与通用设置"
      endpoints={['PUT /api/profile']}
    />
  )
}
