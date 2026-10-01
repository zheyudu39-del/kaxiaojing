import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Avatar, Button, Card, Col, Descriptions, Empty, List, Row, Space, Tag, Typography, App } from 'antd'
import { TrophyOutlined, UserOutlined, UserAddOutlined, UserDeleteOutlined } from '@ant-design/icons'
import { profileApi, timelineApi } from '@/api/me'
import { followApi } from '@/api/community'
import { Loading } from '@/components/common'
import { useAuthStore } from '@/stores/auth'

const { Title, Text } = Typography

export default function UserProfile() {
  const { id = '' } = useParams()
  const { message } = App.useApp()
  const me = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)

  const [user, setUser] = useState<any>(null)
  const [timeline, setTimeline] = useState<any[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [following, setFollowing] = useState(false)
  const [counts, setCounts] = useState({ followers: 0, following: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.allSettled([
      profileApi.byUser(id),
      timelineApi.byUser(id),
      followApi.counts(Number(id)),
    ])
      .then(([u, t, c]) => {
        if (u.status === 'fulfilled') {
          setUser(u.value)
          const s = (u.value as any)?.skills
          setSkills(Array.isArray(s) ? s : typeof s === 'string' ? (() => { try { return JSON.parse(s) } catch { return [] } })() : [])
        }
        if (t.status === 'fulfilled') setTimeline(t.value)
        if (c.status === 'fulfilled') setCounts(c.value ?? { followers: 0, following: 0 })
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!token || !id) return
    followApi.check(Number(id)).then((r) => setFollowing(!!r?.following)).catch(() => {})
  }, [id, token])

  const toggleFollow = async () => {
    if (!token) return message.warning('请先登录')
    try {
      if (following) await followApi.unfollow(Number(id))
      else await followApi.follow(Number(id))
      setFollowing(!following)
      setCounts((c) => ({ ...c, followers: Math.max(0, c.followers + (following ? -1 : 1)) }))
    } catch {
      /* ignore */
    }
  }

  if (loading) return <Loading />
  if (!user) {
    return (
      <Card>
        <Empty description="用户不存在" />
      </Card>
    )
  }

  const isSelf = me && me.id === Number(id)

  return (
    <div style={{ maxWidth: 960 }}>
      <Card>
        <Row gutter={16} align="middle">
          <Col>
            <Avatar size={88} src={user.avatar_url || undefined} icon={<UserOutlined />} />
          </Col>
          <Col flex="auto">
            <Title level={4} style={{ margin: 0 }}>
              {user.username}
              {user.role === 'admin' && <Tag color="gold" style={{ marginLeft: 8 }}>管理员</Tag>}
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {[user.college, user.major].filter(Boolean).join(' · ') || '未填写院系'}
            </Text>
            <div style={{ marginTop: 8 }}>
              <Space size={16}>
                <Text style={{ fontSize: 13 }}>
                  <Text strong>{counts.followers}</Text> 粉丝
                </Text>
                <Text style={{ fontSize: 13 }}>
                  <Text strong>{counts.following}</Text> 关注
                </Text>
              </Space>
            </div>
          </Col>
          <Col>
            {isSelf ? (
              <Link to="/profile">
                <Button>编辑资料</Button>
              </Link>
            ) : (
              <Space>
                <Button
                  type={following ? 'default' : 'primary'}
                  icon={following ? <UserDeleteOutlined /> : <UserAddOutlined />}
                  onClick={toggleFollow}
                >
                  {following ? '已关注' : '关注'}
                </Button>
                <Link to="/messages">
                  <Button>发私信</Button>
                </Link>
              </Space>
            )}
          </Col>
        </Row>

        {user.bio && (
          <div style={{ marginTop: 16, color: '#595959', whiteSpace: 'pre-wrap' }}>{user.bio}</div>
        )}

        {skills.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <Space wrap size={6}>
              {skills.map((s) => (
                <Tag key={s} color="geekblue">
                  {s}
                </Tag>
              ))}
            </Space>
          </div>
        )}
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            size="small"
            title={
              <span>
                <TrophyOutlined /> 获奖经历
              </span>
            }
          >
            {!user.awards?.length ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无获奖记录" />
            ) : (
              <List
                size="small"
                dataSource={user.awards}
                renderItem={(a: any) => (
                  <List.Item>
                    <List.Item.Meta
                      title={a.competition_name || a.name}
                      description={
                        <Space size={8}>
                          <Tag color="gold">{a.award_level}</Tag>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {a.award_date}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card size="small" title="近期动态">
            {timeline.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无动态" />
            ) : (
              <List
                size="small"
                dataSource={timeline.slice(0, 10)}
                renderItem={(t: any) => (
                  <List.Item>
                    <List.Item.Meta
                      title={t.content || t.title || t.activity_type}
                      description={<Text type="secondary" style={{ fontSize: 12 }}>{t.created_at}</Text>}
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
