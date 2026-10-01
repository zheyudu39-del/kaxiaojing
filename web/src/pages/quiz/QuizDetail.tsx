import PagePlaceholder from '@/components/PagePlaceholder'

export default function QuizDetail() {
  return (
    <PagePlaceholder
      title="答题"
      description="作答并查看得分"
      endpoints={['GET /api/quiz/:id/questions', 'POST /api/quiz/:id/submit']}
    />
  )
}
