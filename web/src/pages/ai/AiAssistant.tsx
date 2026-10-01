import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Avatar, Button, Card, Input, Space, Spin, Typography, App } from 'antd'
import { ClearOutlined, RobotOutlined, SendOutlined, UserOutlined } from '@ant-design/icons'
import { aiApi } from '@/api/stats'
import { PageHeader } from '@/components/common'

const { Text } = Typography

interface Msg {
  role: 'user' | 'assistant'
  content: string
}

const QUICK = [
  '推荐适合我的竞赛',
  '现在有哪些竞赛在报名？',
  '数学建模怎么备赛？',
  '零基础如何入门竞赛？',
  '组队时应该注意什么？',
]

export default function AiAssistant() {
  const { message } = App.useApp()
  const [params] = useSearchParams()

  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    })
  }

  const ask = async (text: string) => {
    const q = text.trim()
    if (!q || sending) return
    const next: Msg[] = [...messages, { role: 'user', content: q }]
    setMessages(next)
    setInput('')
    setSending(true)
    scrollToBottom()
    try {
      const res: any = await aiApi.chat({
        message: q,
        history: messages.map((m) => ({ role: m.role, content: m.content })),
      })
      setMessages([...next, { role: 'assistant', content: res?.reply || '（没有返回内容）' }])
    } catch {
      setMessages([...next, { role: 'assistant', content: '抱歉，AI 助手暂时无法响应，请稍后再试。' }])
    } finally {
      setSending(false)
      scrollToBottom()
    }
  }

  // 支持从侧边栏带 ?q= 直接提问
  useEffect(() => {
    const q = params.get('q')
    if (q) ask(q)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <PageHeader
        title="AI 助手"
        description="竞赛咨询、备赛建议、组队问题都可以问"
        extra={
          messages.length > 0 ? (
            <Button icon={<ClearOutlined />} onClick={() => setMessages([])}>
              清空对话
            </Button>
          ) : undefined
        }
      />

      <Card styles={{ body: { padding: 0 } }}>
        <div style={{ height: 'calc(100vh - 260px)', display: 'flex', flexDirection: 'column' }}>
          <div ref={bodyRef} style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                <RobotOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                <div style={{ marginTop: 12, fontSize: 16, fontWeight: 500 }}>你好，我是喀小竞 AI 助手</div>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  关于竞赛选择、备赛规划、组队协作，都可以问我
                </Text>
                <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                  {QUICK.map((q) => (
                    <Button key={q} size="small" onClick={() => ask(q)}>
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => {
                const mine = m.role === 'user'
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start',
                      gap: 8, marginBottom: 14,
                    }}
                  >
                    {!mine && <Avatar icon={<RobotOutlined />} style={{ background: '#1890ff', flexShrink: 0 }} />}
                    <div
                      style={{
                        maxWidth: '76%', padding: '10px 14px', borderRadius: 10,
                        background: mine ? '#1890ff' : '#f5f5f5',
                        color: mine ? '#fff' : 'inherit',
                        whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.7, fontSize: 14,
                      }}
                    >
                      {m.content}
                    </div>
                    {mine && <Avatar icon={<UserOutlined />} style={{ flexShrink: 0 }} />}
                  </div>
                )
              })
            )}
            {sending && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Avatar icon={<RobotOutlined />} style={{ background: '#1890ff' }} />
                <Spin size="small" />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  正在思考…
                </Text>
              </div>
            )}
          </div>

          <div style={{ padding: 12, borderTop: '1px solid #f0f0f0' }}>
            <Space.Compact style={{ width: '100%' }}>
              <Input.TextArea
                autoSize={{ minRows: 1, maxRows: 4 }}
                placeholder="输入你的问题，回车发送"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault()
                    ask(input)
                  }
                }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={sending}
                onClick={() => ask(input)}
                disabled={!input.trim()}
                style={{ height: 'auto' }}
              >
                发送
              </Button>
            </Space.Compact>
          </div>
        </div>
      </Card>
    </div>
  )
}
