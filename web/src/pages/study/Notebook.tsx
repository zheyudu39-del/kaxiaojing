import PagePlaceholder from '@/components/PagePlaceholder'

export default function Notebook() {
  return (
    <PagePlaceholder
      title="学习笔记"
      description="记录与检索学习笔记"
      endpoints={['GET /api/notebook', 'POST /api/notebook', 'POST /api/notebook/:id/pin']}
    />
  )
}
