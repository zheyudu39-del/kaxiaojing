import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Avatar, Button, Card, Col, Empty, Input, List, Row, Space, Tag, Typography, App } from 'antd'
import { ArrowLeftOutlined, SendOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons'
import { studyGroupApi } from '@/api/learning'
import { Loading } from '@/components/common'
import { useAuthStore } from '@/stores/auth'

const { Title, Text } = Typography

export default function StudyGroupDetail() {
  const { id = '' } = useParams()
  const { message } = App.useApp()
  const navigate = useNavigate()
  const me = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)

  const [group, setGroup] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const bodyRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const g = await studyGroupApi.detail(id)
      setGroup(g)
      const [ms, msg] = await Promise.allSettled([studyGroupApi.members(id), studyGroupApi.messages(id)])
      if (ms.status === 'fulfilled') setMembers(ms.value)
      if (msg.status === 'fulfilled') setMessages(msg.value)
    } catch {
      setGroup(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [messages])

  const join = async () => {
    if (!token) return message.warning('请先登录')
    try {
      const res: any = await studyGroupApi.join(id)
      message.success(res?.message || '已加入小组')
      load()
    } catch {
      /* ignore */
    }
  }

  const leave = async () => {
    try {
      const res: any = await studyGroupApi.leave(id)
      message.success(res?.message || '已退出小组')
      load()
    } catch {
      /* ignore */
    }
  }

  const send = async () => {
    const text = input.trim()
    if (!text) return
    try {
      await studyGroupApi.send(id, text)
      setInput('')
      const msgs = await studyGroupApi.messages(id)
      setMessages(msgs)
    } catch {
      /* ignore */
    }
  }

  if (loading) return <Loading />
  if (!group) {
    return (
      <Card>
        <Empty description="小组不存在">
          <Link to="/study-groups">
            <Button type="primary">返回学习小组</Button>
          </Link>
        </Empty>
      </Card>
    )
  }

  const isMember = !!group.is_member

  return (
    <div>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ paddingLeft: 0 }}>
        返回
      </Button>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card>
            <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  <TeamOutlined /> {group.name}
                </Title>
                <Space size={8} style={{ marginTop: 8 }}>
                  {group.category && <Tag color="blue">{group.category}</Tag>}
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {members.length} 位成员
                  </Text>
                </Space>
              </div>
              {token &&
                (isMember ? (
                  <Button danger onClick={leave}>
                    退出小组
                  </Button>
                ) : (
                  <Button type="primary" onClick={join}>
                    加入小组
                  </Button>
                ))}
            </Space>
            <div style={{ marginTop: 12, color: '#595959', whiteSpace: 'pre-wrap' }}>
              {group.description || '暂无简介'}
            </div>
          </Card>

          <Card title="小组讨论" style={{ marginTop: 16 }} styles={{ body: { padding: 0 } }}>
            <div style={{ height: 420, display: 'flex', flexDirection: 'column' }}>
              <div ref={bodyRef} style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                {messages.length === 0 ? (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="还没有讨论" />
                ) : (
                  messages.map((m: any) => {
                    const mine = m.user_id === me?.id
                    return (
                      <div
                        key={m.id}
                        style={{
                          display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start',
                          gap: 8, marginBottom: 12,
                        }}
                      >
                        {!mine && <Avatar size={30} icon={<UserOutlined />} />}
                        <div style={{ maxWidth: '72%' }}>
                          {!mine && (
                            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 2 }}>
                              {m.username || `用户 #${m.user_id}`}
                            </div>
                          )}
                          <div
                            style={{
                              padding: '8px 12px', borderRadius: 8,
                              background: mine ? '#1890ff' : '#f5f5f5',
                              color: mine ? '#fff' : 'inherit',
                              wordBreak: 'break-word', whiteSpace: 'pre-wrap',
                            }}
                          >
                            {m.content}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              <div style={{ padding: 12, borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8 }}>
                <Input
                  placeholder={isMember ? '说点什么…' : '加入小组后可参与讨论'}
                  disabled={!isMember}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onPressEnter={send}
                />
                <Button type="primary" icon={<SendOutlined />} disabled={!isMember || !input.trim()} onClick={send}>
                  发送
                </Button>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title={`成员 (${members.length})`} size="small">
            <List
              size="small"
              dataSource={members}
              locale={{ emptyText: '暂无成员' }}
              renderItem={(m: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar size={28} icon={<UserOutlined />} />}
                    title={<Link to={`/users/${m.user_id}`}>{m.username || `用户 #${m.user_id}`}</Link>}
                    description={m.role === 'admin' ? <Tag color="gold">管理员</Tag> : null}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
