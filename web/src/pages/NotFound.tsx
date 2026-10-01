import PagePlaceholder from '@/components/PagePlaceholder'

export default function NotFound() {
  return (
    <PagePlaceholder
      title="页面不存在"
      description="请检查地址是否正确"
      endpoints={[]}
    />
  )
}
