import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar, Button, Card, Col, Empty, Row, Select, Space, Tag, Typography } from 'antd'
import { TeamOutlined, UserOutlined } from '@ant-design/icons'
import { teamMatchApi } from '@/api/teams'
import { competitionApi } from '@/api/competitions'
import { Loading, PageHeader } from '@/components/common'
import type { Competition } from '@/types'

const { Text } = Typography

export default function TeamMatch() {
  const [matches, setMatches] = useState<any[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [competitionId, setCompetitionId] = useState<number | undefined>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    competitionApi
      .list({ pageSize: 200 })
      .then((r) => setCompetitions(r?.competitions ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    teamMatchApi
      .match(competitionId ? { competition_id: competitionId } : undefined)
      .then((res: any) => setMatches(Array.isArray(res) ? res : (res?.matches ?? [])))
      .catch(() => setMatches([]))
      .finally(() => setLoading(false))
  }, [competitionId])

  return (
    <div>
      <PageHeader
        title="组队匹配"
        description="根据竞赛方向与技能，为你推荐可能合适的队友"
        extra={
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="按竞赛筛选"
            style={{ minWidth: 260 }}
            value={competitionId}
            onChange={setCompetitionId}
            options={competitions.map((c) => ({ label: c.name, value: c.id }))}
          />
        }
      />

      {loading ? (
        <Loading />
      ) : matches.length === 0 ? (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂时没有匹配到合适的队友，先去完善你的技能标签吧"
          >
            <Link to="/profile">
              <Button type="primary">完善个人资料</Button>
            </Link>
          </Empty>
        </Card>
      ) : (
        <Row gutter={[12, 12]}>
          {matches.map((m, idx) => {
            const skills: string[] = Array.isArray(m.skills)
              ? m.skills
              : typeof m.skills === 'string'
                ? (() => {
                    try {
                      return JSON.parse(m.skills)
                    } catch {
                      return []
                    }
                  })()
                : []

            return (
              <Col key={m.user_id ?? idx} xs={24} sm={12} lg={8}>
                <Card size="small" styles={{ body: { padding: 16 } }}>
                  <Space align="start" style={{ width: '100%' }}>
                    <Avatar size={48} src={m.avatar_url || undefined} icon={<UserOutlined />} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Link to={`/users/${m.user_id}`} style={{ fontSize: 15, fontWeight: 500 }}>
                          {m.username || `用户 #${m.user_id}`}
                        </Link>
                        {typeof m.match_score === 'number' && (
                          <Tag color="blue">匹配度 {Math.round(m.match_score)}</Tag>
                        )}
                      </div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {[m.college, m.major].filter(Boolean).join(' · ') || '未填写院系'}
                      </Text>

                      {skills.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          <Space wrap size={4}>
                            {skills.slice(0, 6).map((s: string) => (
                              <Tag key={s} color="geekblue" style={{ margin: 0 }}>
                                {s}
                              </Tag>
                            ))}
                          </Space>
                        </div>
                      )}

                      {m.competition_name && (
                        <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
                          <TeamOutlined /> {m.competition_name}
                        </div>
                      )}
                    </div>
                  </Space>

                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <Link to={`/users/${m.user_id}`} style={{ flex: 1 }}>
                      <Button block size="small">
                        查看主页
                      </Button>
                    </Link>
                    <Link to="/messages" style={{ flex: 1 }}>
                      <Button block size="small" type="primary">
                        发私信
                      </Button>
                    </Link>
                  </div>
                </Card>
              </Col>
            )
          })}
        </Row>
      )}
    </div>
  )
}
