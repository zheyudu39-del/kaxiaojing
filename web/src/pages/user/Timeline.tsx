import { useEffect, useState } from 'react'
import { Card, Col, Empty, List, Row, Space, Statistic, Tag, Timeline as AntTimeline, Typography } from 'antd'
import { CheckCircleOutlined, RiseOutlined, TrophyOutlined } from '@ant-design/icons'
import { timelineApi } from '@/api/me'
import { Loading, PageHeader } from '@/components/common'

const { Text } = Typography

export default function Timeline() {
  const [items, setItems] = useState<any[]>([])
  const [growth, setGrowth] = useState<any[]>([])
  const [milestones, setMilestones] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      timelineApi.my(),
      timelineApi.myGrowth(),
      timelineApi.myMilestones(),
      timelineApi.myStats(),
    ])
      .then(([t, g, m, s]) => {
        if (t.status === 'fulfilled') setItems(t.value)
        if (g.status === 'fulfilled') setGrowth(g.value)
        if (m.status === 'fulfilled') setMilestones(m.value)
        if (s.status === 'fulfilled') setStats(s.value ?? {})
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  const display = items.length > 0 ? items : milestones

  return (
    <div style={{ maxWidth: 960 }}>
      <PageHeader title="成长轨迹" description="记录你在喀小竞的每一步" />

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        {[
          { title: '参赛次数', value: stats?.competition_count ?? 0 },
          { title: '获奖次数', value: stats?.award_count ?? 0 },
          { title: '队伍数', value: stats?.team_count ?? 0 },
          { title: '动态数', value: stats?.activity_count ?? items.length },
        ].map((s) => (
          <Col key={s.title} xs={12} md={6}>
            <Card size="small">
              <Statistic title={s.title} value={s.value} />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="成长时间线" size="small">
            {display.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无记录" />
            ) : (
              <AntTimeline
                style={{ marginTop: 16 }}
                items={display.map((t: any) => ({
                  dot:
                    t.type === 'award' ? (
                      <TrophyOutlined style={{ color: '#faad14' }} />
                    ) : t.type === 'growth' ? (
                      <RiseOutlined style={{ color: '#1890ff' }} />
                    ) : (
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    ),
                  children: (
                    <div>
                      <Space size={6}>
                        <Text strong style={{ fontSize: 13 }}>
                          {t.title || t.content || t.activity_type || '动态'}
                        </Text>
                        {t.tag && <Tag color="blue">{t.tag}</Tag>}
                      </Space>
                      {t.description && (
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>{t.description}</div>
                      )}
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {t.created_at || t.date}
                      </Text>
                    </div>
                  ),
                }))}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="成长曲线" size="small">
            {growth.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />
            ) : (
              <List
                size="small"
                dataSource={growth}
                renderItem={(g: any) => (
                  <List.Item>
                    <List.Item.Meta
                      title={<Text style={{ fontSize: 13 }}>{g.label || g.month || g.date}</Text>}
                      description={
                        <Space size={12} style={{ fontSize: 12 }}>
                          <span>参赛 {g.competition_count ?? g.count ?? 0}</span>
                          <span>获奖 {g.award_count ?? 0}</span>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
