import { useCallback, useEffect, useRef, useState } from 'react'
import { Avatar, Button, Card, Col, Empty, Input, List, Row, Space, Typography, App } from 'antd'
import { SendOutlined, UserOutlined } from '@ant-design/icons'
import { io, type Socket } from 'socket.io-client'
import { messageApi } from '@/api/community'
import { Loading, PageHeader } from '@/components/common'
import { useAuthStore } from '@/stores/auth'
import { getToken } from '@/utils/request'
import type { Conversation } from '@/types'

const { Text } = Typography

export default function Messages() {
  const { message: antdMsg } = App.useApp()
  const me = useAuthStore((s) => s.user)

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [active, setActive] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const bodyRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    })
  }

  const loadConversations = useCallback(async () => {
    try {
      const res: any = await messageApi.conversations()
      setConversations(Array.isArray(res) ? res : (res?.conversations ?? []))
    } catch {
      setConversations([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // Socket.IO：接收私信
  useEffect(() => {
    const t = getToken()
    if (!t) return
    const socket = io('/', { auth: { token: t }, transports: ['websocket', 'polling'] })
    socketRef.current = socket

    socket.on('new-private-message', (msg: any) => {
      if (active && (msg.sender_id === active.user_id || msg.receiver_id === active.user_id)) {
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
        scrollToBottom()
      }
      loadConversations()
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [active, loadConversations])

  const openConversation = async (c: Conversation) => {
    setActive(c)
    try {
      const res: any = await messageApi.history(c.user_id)
      const list = Array.isArray(res) ? res : (res?.messages ?? [])
      setMessages(list)
      scrollToBottom()
    } catch {
      setMessages([])
    }
  }

  const send = async () => {
    const text = input.trim()
    if (!text || !active) return
    try {
      await messageApi.send(active.user_id, text)
      setInput('')
      const res: any = await messageApi.history(active.user_id)
      setMessages(Array.isArray(res) ? res : (res?.messages ?? []))
      scrollToBottom()
    } catch {
      antdMsg.error('发送失败')
    }
  }

  return (
    <div>
      <PageHeader title="私信" description="和同学一对一交流" />

      <Card styles={{ body: { padding: 0 } }}>
        <Row style={{ minHeight: 520 }}>
          <Col xs={24} md={8} style={{ borderRight: '1px solid #f0f0f0' }}>
            {loading ? (
              <Loading />
            ) : conversations.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="还没有会话" style={{ padding: 40 }} />
            ) : (
              <List
                dataSource={conversations}
                renderItem={(c: any) => (
                  <List.Item
                    onClick={() => openConversation(c)}
                    style={{
                      cursor: 'pointer',
                      padding: '10px 16px',
                      background: active?.user_id === c.user_id ? '#e6f4ff' : undefined,
                    }}
                  >
                    <List.Item.Meta
                      avatar={<Avatar src={c.avatar_url || undefined} icon={<UserOutlined />} />}
                      title={
                        <Space size={6}>
                          <Text style={{ fontSize: 14 }}>{c.username || `用户 #${c.user_id}`}</Text>
                          {c.unread_count > 0 && <Text type="danger" style={{ fontSize: 12 }}>{c.unread_count}</Text>}
                        </Space>
                      }
                      description={
                        <Text type="secondary" style={{ fontSize: 12 }} className="text-ellipsis">
                          {c.last_message}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Col>

          <Col xs={24} md={16} style={{ display: 'flex', flexDirection: 'column' }}>
            {!active ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="选择左侧会话开始聊天" style={{ margin: 'auto' }} />
            ) : (
              <>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid #f0f0f0', fontWeight: 500 }}>
                  {active.username}
                </div>
                <div ref={bodyRef} style={{ flex: 1, overflowY: 'auto', padding: 16, maxHeight: 420 }}>
                  {messages.length === 0 ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="还没有消息" />
                  ) : (
                    messages.map((m: any) => {
                      const mine = m.sender_id === me?.id
                      return (
                        <div
                          key={m.id}
                          style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: 10 }}
                        >
                          <div
                            style={{
                              maxWidth: '70%', padding: '8px 12px', borderRadius: 8,
                              background: mine ? '#1890ff' : '#f5f5f5',
                              color: mine ? '#fff' : 'inherit',
                              wordBreak: 'break-word', whiteSpace: 'pre-wrap', fontSize: 14,
                            }}
                          >
                            {m.content}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
                <div style={{ padding: 12, borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8 }}>
                  <Input
                    placeholder="输入消息，回车发送"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onPressEnter={send}
                  />
                  <Button type="primary" icon={<SendOutlined />} onClick={send} disabled={!input.trim()}>
                    发送
                  </Button>
                </div>
              </>
            )}
          </Col>
        </Row>
      </Card>
    </div>
  )
}
