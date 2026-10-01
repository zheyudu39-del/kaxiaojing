import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar, Card, Segmented, Table, Tag } from 'antd'
import { CrownOutlined, UserOutlined } from '@ant-design/icons'
import { rankingApi } from '@/api/competitions'
import { PageHeader } from '@/components/common'
import type { RankingItem } from '@/types'

const TYPES = [
  { label: '综合榜', value: 'overall' },
  { label: '获奖榜', value: 'award' },
  { label: '参赛榜', value: 'participation' },
]

export default function Ranking() {
  const [type, setType] = useState('overall')
  const [data, setData] = useState<RankingItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    rankingApi
      .list({ type, limit: 100 })
      .then((d) => setData(Array.isArray(d) ? d : []))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [type])

  return (
    <div>
      <PageHeader
        title="竞赛排行榜"
        description="根据获奖与参赛情况综合排名"
        extra={<Segmented options={TYPES} value={type} onChange={(v) => setType(v as string)} />}
      />

      <Card>
        <Table
          rowKey={(r) => r.user_id}
          loading={loading}
          dataSource={data}
          pagination={{ pageSize: 20, showSizeChanger: false }}
          columns={[
            {
              title: '排名',
              dataIndex: 'rank',
              width: 80,
              render: (rank: number) =>
                rank <= 3 ? (
                  <Tag color={['gold', 'silver', 'orange'][rank - 1]} icon={<CrownOutlined />}>
                    {rank}
                  </Tag>
                ) : (
                  rank
                ),
            },
            {
              title: '用户',
              dataIndex: 'username',
              render: (_: string, r: RankingItem) => (
                <Link to={`/users/${r.user_id}`}>
                  <Avatar size="small" src={r.avatar_url || undefined} icon={<UserOutlined />} style={{ marginRight: 8 }} />
                  {r.username}
                </Link>
              ),
            },
            { title: '积分', dataIndex: 'score', width: 100, sorter: (a: any, b: any) => a.score - b.score },
            { title: '获奖数', dataIndex: 'award_count', width: 100, render: (v: number) => v ?? 0 },
            { title: '参赛数', dataIndex: 'competition_count', width: 100, render: (v: number) => v ?? 0 },
          ]}
        />
      </Card>
    </div>
  )
}
