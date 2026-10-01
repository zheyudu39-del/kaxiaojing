import PagePlaceholder from '@/components/PagePlaceholder'

export default function PostDetail() {
  return (
    <PagePlaceholder
      title="帖子详情"
      description="阅读帖子、点赞、评论、收藏"
      endpoints={['GET /api/posts/:id', 'POST /api/posts/:id/comments', 'POST /api/posts/:id/like']}
    />
  )
}
