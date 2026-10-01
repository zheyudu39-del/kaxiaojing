import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Avatar, Button, Card, Divider, Empty, Input, List, Space, Tag, Typography, App } from 'antd'
import {
  ArrowLeftOutlined, CheckCircleFilled, CheckOutlined, DownOutlined, EyeOutlined, UpOutlined, UserOutlined,
} from '@ant-design/icons'
import { qaApi } from '@/api/community'
import { Loading } from '@/components/common'
import { useAuthStore } from '@/stores/auth'

const { Title, Text, Paragraph } = Typography

export default function QaDetail() {
  const { id = '' } = useParams()
  const { message, modal } = App.useApp()
  const navigate = useNavigate()
  const me = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)

  const [question, setQuestion] = useState<any>(null)
  const [answers, setAnswers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const q: any = await qaApi.question(id)
      setQuestion(q)
      const a = await qaApi.answers(id).catch(() => [])
      setAnswers(Array.isArray(a) ? a : [])
    } catch {
      setQuestion(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const submitAnswer = async () => {
    if (!token) return message.warning('请先登录')
    const text = content.trim()
    if (!text) return
    try {
      await qaApi.createAnswer(id, text)
      message.success('回答已发布')
      setContent('')
      load()
    } catch {
      /* ignore */
    }
  }

  const vote = async (targetType: 'question' | 'answer', targetId: number, voteType: 1 | -1) => {
    if (!token) return message.warning('请先登录')
    try {
      await qaApi.vote({ target_type: targetType, target_id: targetId, vote_type: voteType })
      if (targetType === 'question') {
        setQuestion((q: any) => ({ ...q, vote_count: (q?.vote_count ?? 0) + voteType }))
      } else {
        setAnswers((as) => as.map((a) => (a.id === targetId ? { ...a, vote_count: (a.vote_count ?? 0) + voteType } : a)))
      }
    } catch {
      /* ignore */
    }
  }

  const accept = (answerId: number) => {
    modal.confirm({
      title: '采纳这个回答？',
      content: '采纳后问题会标记为已解决，该回答会置顶显示。',
      okText: '采纳',
      cancelText: '取消',
      onOk: async () => {
        try {
          await qaApi.accept(Number(id), answerId)
          message.success('已采纳')
          load()
        } catch {
          /* ignore */
        }
      },
    })
  }

  if (loading) return <Loading />
  if (!question) {
    return (
      <Card>
        <Empty description="问题不存在或已删除">
          <Link to="/qa">
            <Button type="primary">返回问答广场</Button>
          </Link>
        </Empty>
      </Card>
    )
  }

  const isOwner = me && question.user_id === me.id
  // 已采纳的回答排在最前
  const sorted = [...answers].sort((a, b) => (b.is_accepted ?? 0) - (a.is_accepted ?? 0))

  return (
    <div style={{ maxWidth: 900 }}>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ paddingLeft: 0 }}>
        返回
      </Button>

      <Card>
        <Title level={4} style={{ marginTop: 0 }}>
          {question.is_solved ? <CheckCircleFilled style={{ color: '#52c41a', marginRight: 8 }} /> : null}
          {question.title}
        </Title>

        <Space size={12} wrap style={{ marginBottom: 12 }}>
          <Space size={6}>
            <Avatar size="small" src={question.avatar_url || undefined} icon={<UserOutlined />} />
            <Text style={{ fontSize: 13 }}>{question.username || `用户 #${question.user_id}`}</Text>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {question.created_at}
          </Text>
          <Space size={4}>
            <EyeOutlined />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {question.view_count ?? 0}
            </Text>
          </Space>
          {question.is_solved ? <Tag color="green">已解决</Tag> : <Tag>待解决</Tag>}
        </Space>

        <Paragraph style={{ whiteSpace: 'pre-wrap', fontSize: 15, lineHeight: 1.9 }}>
          {question.content}
        </Paragraph>

        {question.tags && (
          <Space wrap size={4} style={{ marginBottom: 12 }}>
            {String(question.tags)
              .replace(/[[\]"]/g, '')
              .split(',')
              .filter(Boolean)
              .map((t: string) => (
                <Tag key={t} color="geekblue">
                  {t.trim()}
                </Tag>
              ))}
          </Space>
        )}

        <Divider style={{ margin: '12px 0' }} />

        <Space size={8}>
          <Button icon={<UpOutlined />} onClick={() => vote('question', question.id, 1)}>
            赞同 {question.vote_count ?? 0}
          </Button>
          <Button icon={<DownOutlined />} onClick={() => vote('question', question.id, -1)} />
        </Space>
      </Card>

      <Card title={`${answers.length} 个回答`} style={{ marginTop: 16 }}>
        {token ? (
          <div style={{ marginBottom: 16 }}>
            <Input.TextArea
              rows={4}
              placeholder="写下你的回答…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2000}
              showCount
            />
            <div style={{ marginTop: 8, textAlign: 'right' }}>
              <Button type="primary" onClick={submitAnswer} disabled={!content.trim()}>
                发布回答
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">
              <Link to="/login">登录</Link> 后即可回答
            </Text>
          </div>
        )}

        {sorted.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="还没有回答，来抢首答" />
        ) : (
          <List
            dataSource={sorted}
            renderItem={(a: any) => (
              <List.Item
                style={a.is_accepted ? { background: '#f6ffed', borderRadius: 8, padding: 12 } : undefined}
                actions={[
                  <Button key="u" type="text" size="small" icon={<UpOutlined />} onClick={() => vote('answer', a.id, 1)}>
                    {a.vote_count ?? 0}
                  </Button>,
                  <Button key="d" type="text" size="small" icon={<DownOutlined />} onClick={() => vote('answer', a.id, -1)} />,
                  isOwner && !a.is_accepted ? (
                    <Button key="a" type="link" size="small" icon={<CheckOutlined />} onClick={() => accept(a.id)}>
                      采纳
                    </Button>
                  ) : null,
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={<Avatar src={a.avatar_url || undefined} icon={<UserOutlined />} />}
                  title={
                    <Space size={6}>
                      <Text strong style={{ fontSize: 13 }}>
                        {a.username || `用户 #${a.user_id}`}
                      </Text>
                      {a.is_accepted ? <Tag color="green">已采纳</Tag> : null}
                    </Space>
                  }
                  description={
                    <>
                      <div style={{ whiteSpace: 'pre-wrap', color: 'inherit', marginBottom: 4 }}>{a.content}</div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {a.created_at}
                      </Text>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  )
}
