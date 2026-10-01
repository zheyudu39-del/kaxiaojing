import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar, Button, Card, Col, Empty, Row, Select, Space, Tag, Typography } from 'antd'
import { ReloadOutlined, UserOutlined } from '@ant-design/icons'
import { studyBuddyApi } from '@/api/learning'
import { competitionApi } from '@/api/competitions'
import { Loading, PageHeader } from '@/components/common'
import type { Competition } from '@/types'

const { Text } = Typography

export default function StudyBuddy() {
  const [buddies, setBuddies] = useState<any[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [competitionId, setCompetitionId] = useState<number | undefined>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    competitionApi.list({ pageSize: 200 }).then((r) => setCompetitions(r?.competitions ?? [])).catch(() => {})
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setBuddies(await studyBuddyApi.match(competitionId ? { competition_id: competitionId } : undefined))
    } catch {
      setBuddies([])
    } finally {
      setLoading(false)
    }
  }, [competitionId])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div>
      <PageHeader
        title="找学伴"
        description="找到目标一致的人，一起备考"
        extra={
          <Space size={8}>
            <Button icon={<ReloadOutlined />} onClick={load}>
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

      {loading ? (
        <Loading />
      ) : buddies.length === 0 ? (
        <Card>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂时没有匹配到学伴" />
        </Card>
      ) : (
        <Row gutter={[12, 12]}>
          {buddies.map((b, i) => (
            <Col key={b.user_id ?? i} xs={24} sm={12} lg={8}>
              <Card size="small">
                <Space align="start" style={{ width: '100%' }}>
                  <Avatar size={44} src={b.avatar_url || undefined} icon={<UserOutlined />} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link to={`/users/${b.user_id}`} style={{ fontSize: 15, fontWeight: 500 }}>
                      {b.username || `用户 #${b.user_id}`}
                    </Link>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                      {[b.college, b.major].filter(Boolean).join(' · ') || '未填写院系'}
                    </div>
                    {b.competition_name && (
                      <Tag color="blue" style={{ marginTop: 6 }}>
                        {b.competition_name}
                      </Tag>
                    )}
                    {b.common_competitions && (
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                        共同关注 {b.common_competitions} 个竞赛
                      </div>
                    )}
                  </div>
                </Space>
                <div style={{ marginTop: 12 }}>
                  <Link to="/messages">
                    <Button block size="small" type="primary">
                      发私信聊聊
                    </Button>
                  </Link>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}
