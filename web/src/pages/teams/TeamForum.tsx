import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Avatar, Button, Card, Empty, Input, Space, Spin, Typography, App } from 'antd'
import { SendOutlined, UserOutlined } from '@ant-design/icons'
import { io, type Socket } from 'socket.io-client'
import { teamApi } from '@/api/teams'
import { PageHeader } from '@/components/common'
import { useAuthStore } from '@/stores/auth'
import { getToken } from '@/utils/request'
import type { ChatMessage } from '@/types'

const { Text } = Typography

export default function TeamForum() {
  const { id = '' } = useParams()
  const { message: antdMsg } = App.useApp()
  const me = useAuthStore((s) => s.user)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    })
  }

  // 加载历史消息
  useEffect(() => {
    setLoading(true)
    teamApi
      .messages(id, { limit: 50 })
      .then((res: any) => {
        const list = Array.isArray(res) ? res : (res?.messages ?? [])
        setMessages(list)
        scrollToBottom()
      })
      .catch(() => setMessages([]))
      .finally(() => setLoading(false))
  }, [id])

  // Socket.IO 实时消息
  useEffect(() => {
    const token = getToken()
    if (!token) return

    const socket = io('/', {
      auth: { token },
      transports: ['websocket', 'polling'],
    })
    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('join-team-chat', { teamId: Number(id) })
    })
    socket.on('disconnect', () => setConnected(false))

    socket.on('new-message', (msg: ChatMessage) => {
      // 只处理本队伍的消息
      if (msg?.team_id && String(msg.team_id) !== String(id)) return
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
      scrollToBottom()
    })

    socket.on('member-removed', () => {
      antdMsg.warning('你已被移出该队伍')
    })
    socket.on('team-dissolved', () => {
      antdMsg.warning('该队伍已解散')
    })

    return () => {
      socket.emit('leave-team-chat', { teamId: Number(id) })
      socket.disconnect()
      socketRef.current = null
    }
  }, [id, antdMsg])

  const send = () => {
    const text = input.trim()
    if (!text) return
    if (!socketRef.current?.connected) {
      antdMsg.warning('连接已断开，正在重连，请稍后再试')
      return
    }
    socketRef.current.emit('send-message', { teamId: Number(id), content: text })
    setInput('')
  }

  return (
    <div className="fill-viewport">
      <PageHeader
        title="队伍讨论"
        description={
          <Space size={6}>
            <span
              style={{
                display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                background: connected ? '#52c41a' : '#d9d9d9',
              }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {connected ? '已连接' : '连接中…'}
            </Text>
          </Space>
        }
      />

      <Card
        style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        styles={{ body: { padding: 0, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' } }}
      >
        <div className="chat-page chat-page--flex">
          <div className="chat-page__body" ref={bodyRef} style={{ padding: '16px 16px 0' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 32 }}>
                <Spin />
              </div>
            ) : messages.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="还没有消息，说点什么吧" />
            ) : (
              messages.map((m) => {
                const mine = m.user_id === me?.id
                return (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      justifyContent: mine ? 'flex-end' : 'flex-start',
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    {!mine && <Avatar size={32} src={m.avatar_url || undefined} icon={<UserOutlined />} />}
                    <div style={{ maxWidth: '70%' }}>
                      {!mine && (
                        <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 2 }}>
                          {m.username || `用户 #${m.user_id}`}
                        </div>
                      )}
                      <div
                        style={{
                          padding: '8px 12px',
                          borderRadius: 8,
                          background: mine ? '#1890ff' : '#f5f5f5',
                          color: mine ? '#fff' : 'inherit',
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-wrap',
                          fontSize: 14,
                        }}
                      >
                        {m.content}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: '#bfbfbf',
                          marginTop: 2,
                          textAlign: mine ? 'right' : 'left',
                        }}
                      >
                        {m.created_at}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div style={{ padding: 12, borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8 }}>
            <Input.TextArea
              autoSize={{ minRows: 1, maxRows: 4 }}
              placeholder="输入消息，回车发送"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
            />
            <Button type="primary" icon={<SendOutlined />} onClick={send} disabled={!input.trim()}>
              发送
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
