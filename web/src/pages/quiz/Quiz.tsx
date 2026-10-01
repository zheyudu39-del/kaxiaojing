import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Col, Empty, List, Row, Select, Space, Tag, Typography, App } from 'antd'
import { BookOutlined, ReloadOutlined, TrophyOutlined } from '@ant-design/icons'
import { quizApi } from '@/api/learning'
import { competitionApi } from '@/api/competitions'
import { Loading, PageHeader } from '@/components/common'
import { useAuthStore } from '@/stores/auth'
import type { Competition } from '@/types'

const { Text, Paragraph } = Typography

export default function Quiz() {
  const { message } = App.useApp()
  const token = useAuthStore((s) => s.token)

  const [quizzes, setQuizzes] = useState<any[]>([])
  const [attempts, setAttempts] = useState<any[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [competitionId, setCompetitionId] = useState<number | undefined>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    competitionApi.list({ pageSize: 200 }).then((r) => setCompetitions(r?.competitions ?? [])).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.allSettled([
      quizApi.list(competitionId ? { competition_id: competitionId } : undefined),
      token ? quizApi.myAttempts() : Promise.resolve([]),
    ])
      .then(([q, a]) => {
        if (q.status === 'fulfilled') setQuizzes(q.value)
        if (a.status === 'fulfilled') setAttempts(a.value)
      })
      .finally(() => setLoading(false))
  }, [competitionId, token])

  return (
    <div>
      <PageHeader
        title="知识测验"
        description="刷题巩固竞赛知识"
        extra={
          <Space size={8}>
            <Button icon={<ReloadOutlined />} onClick={() => setCompetitionId((v) => v)}>
              刷新
            </Button>
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="按竞赛筛选"
              style={{ minWidth: 240 }}
              value={competitionId}
              onChange={setCompetitionId}
              options={competitions.map((c) => ({ label: c.name, value: c.id }))}
            />
          </Space>
        }
      />

      {token && attempts.length > 0 && (
        <Card title="我的答题记录" size="small" style={{ marginBottom: 16 }}>
          <List
            size="small"
            dataSource={attempts.slice(0, 5)}
            renderItem={(a: any) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Space size={6}>
                      <Text style={{ fontSize: 13 }}>{a.quiz_title || `测验 #${a.quiz_id}`}</Text>
                      <Tag color={(a.score ?? 0) >= (a.pass_score ?? 60) ? 'green' : 'orange'}>
                        {a.score ?? 0} / {a.total_points ?? '-'}
                      </Tag>
                    </Space>
                  }
                  description={<Text type="secondary" style={{ fontSize: 12 }}>{a.created_at}</Text>}
                />
                <Link to={`/quiz/${a.quiz_id}`}>
                  <Button size="small">重新挑战</Button>
                </Link>
              </List.Item>
            )}
          />
        </Card>
      )}

      {loading ? (
        <Loading />
      ) : quizzes.length === 0 ? (
        <Card>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无测验" />
        </Card>
      ) : (
        <Row gutter={[12, 12]}>
          {quizzes.map((q: any) => (
            <Col key={q.id} xs={24} sm={12} lg={8}>
              <Card size="small">
                <Space>
                  <BookOutlined />
                  <span className="text-ellipsis" style={{ fontSize: 15, fontWeight: 500, maxWidth: 200 }}>
                    {q.title}
                  </span>
                </Space>
                <Paragraph className="clamp-2" style={{ fontSize: 12, color: '#8c8c8c', margin: '8px 0', minHeight: 36 }}>
                  {q.description || '暂无说明'}
                </Paragraph>
                <Space size={10} style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 10 }}>
                  {q.question_count != null && <span>{q.question_count} 题</span>}
                  {q.pass_score != null && <span>及格 {q.pass_score} 分</span>}
                  {q.time_limit ? <span>限时 {Math.round(q.time_limit / 60)} 分钟</span> : null}
                </Space>
                <Link to={`/quiz/${q.id}`}>
                  <Button
                    block
                    type="primary"
                    icon={<TrophyOutlined />}
                    onClick={() => (token ? undefined : message.warning('请先登录后作答'))}
                  >
                    开始答题
                  </Button>
                </Link>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}
