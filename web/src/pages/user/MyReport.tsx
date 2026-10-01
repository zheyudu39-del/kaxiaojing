import { useEffect, useState } from 'react'
import { Card, Col, Empty, List, Row, Space, Statistic, Tabs, Tag, Typography } from 'antd'
import { RiseOutlined } from '@ant-design/icons'
import { reportApi } from '@/api/me'
import { Loading, PageHeader } from '@/components/common'

const { Text, Paragraph } = Typography

export default function MyReport() {
  const [weekly, setWeekly] = useState<any>(null)
  const [monthly, setMonthly] = useState<any>(null)
  const [growth, setGrowth] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([reportApi.weekly(), reportApi.monthly(), reportApi.growth()])
      .then(([w, m, g]) => {
        if (w.status === 'fulfilled') setWeekly(w.value)
        if (m.status === 'fulfilled') setMonthly(m.value)
        if (g.status === 'fulfilled') setGrowth(g.value)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  const renderReport = (r: any, emptyTip: string) => {
    if (!r) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyTip} />
    return (
      <>
        <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
          {Object.entries(r)
            .filter(([, v]) => typeof v === 'number')
            .slice(0, 8)
            .map(([k, v]) => (
              <Col key={k} xs={12} md={6}>
                <Card size="small">
                  <Statistic title={LABELS[k] || k} value={v as number} />
                </Card>
              </Col>
            ))}
        </Row>

        {r.summary && <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{r.summary}</Paragraph>}

        {Array.isArray(r.highlights) && r.highlights.length > 0 && (
          <List
            size="small"
            header={<Text strong>本周期亮点</Text>}
            dataSource={r.highlights}
            renderItem={(h: any) => (
              <List.Item>
                <RiseOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                {typeof h === 'string' ? h : h.text || h.title}
              </List.Item>
            )}
          />
        )}
      </>
    )
  }

  return (
    <div style={{ maxWidth: 960 }}>
      <PageHeader title="我的报告" description="自动汇总你的参赛与学习情况" />

      <Tabs
        items={[
          { key: 'weekly', label: '本周报告', children: <Card>{renderReport(weekly, '本周暂无数据')}</Card> },
          { key: 'monthly', label: '本月报告', children: <Card>{renderReport(monthly, '本月暂无数据')}</Card> },
          {
            key: 'growth',
            label: '成长报告',
            children: (
              <Card>
                {!growth ? (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无成长报告" />
                ) : (
                  <>
                    <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                      {Object.entries(growth)
                        .filter(([, v]) => typeof v === 'number')
                        .slice(0, 8)
                        .map(([k, v]) => (
                          <Col key={k} xs={12} md={6}>
                            <Card size="small">
                              <Statistic title={LABELS[k] || k} value={v as number} />
                            </Card>
                          </Col>
                        ))}
                    </Row>
                    {growth.summary && (
                      <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{growth.summary}</Paragraph>
                    )}
                    {Array.isArray(growth.suggestions) && growth.suggestions.length > 0 && (
                      <List
                        size="small"
                        header={<Text strong>建议</Text>}
                        dataSource={growth.suggestions}
                        renderItem={(s: any) => (
                          <List.Item>
                            <Tag color="blue">建议</Tag>
                            {typeof s === 'string' ? s : s.text || s.title}
                          </List.Item>
                        )}
                      />
                    )}
                  </>
                )}
              </Card>
            ),
          },
        ]}
      />
    </div>
  )
}

const LABELS: Record<string, string> = {
  competition_count: '参赛次数',
  award_count: '获奖次数',
  team_count: '队伍数',
  post_count: '发帖数',
  resource_count: '上传资料',
  checkin_count: '打卡次数',
  study_hours: '学习时长',
  activity_count: '动态数',
  follower_gain: '新增粉丝',
  score: '综合得分',
}
