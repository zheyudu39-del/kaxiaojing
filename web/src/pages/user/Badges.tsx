import PagePlaceholder from '@/components/PagePlaceholder'

export default function Badges() {
  return (
    <PagePlaceholder
      title="成就徽章"
      description="已获得与未解锁的徽章"
      endpoints={['GET /api/badges/my/all', 'POST /api/badges/check']}
    />
  )
}
