import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Col, Input, Row, Statistic, Tag, Typography } from 'antd'
import { FireOutlined, SearchOutlined } from '@ant-design/icons'
import { dashboardApi, recommendApi } from '@/api/stats'
import { CompetitionCard, EmptyState, Loading, PageHeader } from '@/components/common'
import type { Competition } from '@/types'

const { Title, Text } = Typography

const QUICK_ENTRIES = [
  { label: '交流大厅', path: '/lobby' },
  { label: '经验分享', path: '/forum' },
  { label: '知识测验', path: '/quiz' },
  { label: '排行榜', path: '/ranking' },
  { label: '导师指导', path: '/mentors' },
  { label: '资料库', path: '/resources' },
  { label: '组队匹配', path: '/team-match' },
  { label: '证书考取', path: '/certificates' },
]

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null)
  const [hot, setHot] = useState<Competition[]>([])
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([dashboardApi.overview(), recommendApi.trending({ limit: 8 })])
      .then(([s, h]) => {
        if (s.status === 'fulfilled') setStats(s.value)
        if (h.status === 'fulfilled') setHot(Array.isArray(h.value) ? h.value : [])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  return (
    <div>
      <Card
        style={{
          marginBottom: 16,
          background: 'linear-gradient(135deg,#1890ff 0%,#0050b3 100%)',
          border: 'none',
        }}
        styles={{ body: { padding: 24 } }}
      >
        <Title level={3} style={{ color: '#fff', margin: 0 }}>
          喀小竞 · 竞赛交流平台
        </Title>
        <Text style={{ color: 'rgba(255,255,255,.85)' }}>
          发现竞赛、找到队友、沉淀经验
        </Text>
        <Input.Search
          size="large"
          placeholder="搜索竞赛名称、类别..."
          enterButton="搜索"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ maxWidth: 520, marginTop: 16 }}
          onSearch={(v) => {
            if (v.trim()) location.href = `/competitions?keyword=${encodeURIComponent(v.trim())}`
          }}
        />
      </Card>

      <PageHeader title="快捷入口" />
      <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
        {QUICK_ENTRIES.map((e) => (
          <Col key={e.path} xs={12} sm={8} md={6} lg={3}>
            <Link to={e.path}>
              <Card size="small" hoverable styles={{ body: { padding: 12, textAlign: 'center' } }}>
                <div style={{ fontSize: 13 }}>{e.label}</div>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>

      <PageHeader title="平台数据" />
      <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
        {[
          { title: '用户总数', value: stats?.user_count ?? 0 },
          { title: '竞赛总数', value: stats?.competition_count ?? 0 },
          { title: '队伍总数', value: stats?.team_count ?? 0 },
          { title: '帖子总数', value: stats?.post_count ?? 0 },
        ].map((s) => (
          <Col key={s.title} xs={12} md={6}>
            <Card size="small">
              <Statistic title={s.title} value={s.value} />
            </Card>
          </Col>
        ))}
      </Row>

      <PageHeader
        title={
          <span>
            <FireOutlined style={{ color: '#fa541c' }} /> 热门竞赛推荐
          </span>
        }
        extra={<Link to="/competitions">查看全部</Link>}
      />

      {hot.length === 0 ? (
        <EmptyState description="暂无推荐竞赛" />
      ) : (
        <Row gutter={[12, 12]}>
          {hot.map((c) => (
            <Col key={c.id} xs={24} sm={12} md={8} lg={6}>
              <CompetitionCard item={c} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}
