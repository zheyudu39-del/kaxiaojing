import { useEffect, useRef, useState } from 'react'
import { Avatar, Button, Card, Empty, Input, Space, Spin, Typography, App } from 'antd'
import { SendOutlined, UserOutlined } from '@ant-design/icons'
import { io, type Socket } from 'socket.io-client'
import { lobbyApi } from '@/api/community'
import { PageHeader } from '@/components/common'
import { useAuthStore } from '@/stores/auth'
import { getToken } from '@/utils/request'

const { Text } = Typography

export default function Lobby() {
  const { message: antdMsg } = App.useApp()
  const me = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)

  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [online, setOnline] = useState(0)
  const socketRef = useRef<Socket | null>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    })
  }

  useEffect(() => {
    setLoading(true)
    lobbyApi
      .messages({ limit: 50 })
      .then((res: any) => {
        setMessages(Array.isArray(res) ? res : (res?.messages ?? []))
        scrollToBottom()
      })
      .catch(() => setMessages([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const t = getToken()
    if (!t) return

    const socket = io('/', { auth: { token: t }, transports: ['websocket', 'polling'] })
    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('join-lobby')
    })
    socket.on('disconnect', () => setConnected(false))

    socket.on('new-lobby-message', (msg: any) => {
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
      scrollToBottom()
    })

    socket.on('connection-status', (data: any) => {
      if (typeof data?.count === 'number') setOnline(data.count)
      else if (typeof data === 'number') setOnline(data)
    })

    return () => {
      socket.emit('leave-lobby')
      socket.disconnect()
      socketRef.current = null
    }
  }, [token])

  const send = () => {
    const text = input.trim()
    if (!text) return
    if (!token) return antdMsg.warning('请先登录')
    if (!socketRef.current?.connected) return antdMsg.warning('连接已断开，请稍后再试')
    socketRef.current.emit('send-lobby-message', { content: text })
    setInput('')
  }

  return (
    <div>
      <PageHeader
        title="交流大厅"
        description={
          <Space size={10}>
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
            {online > 0 && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {online} 人在线
              </Text>
            )}
          </Space>
        }
      />

      <Card styles={{ body: { padding: 0 } }}>
        <div className="chat-page" style={{ height: 'calc(100vh - 240px)' }}>
          <div className="chat-page__body" ref={bodyRef} style={{ padding: '16px 16px 0' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 32 }}>
                <Spin />
              </div>
            ) : messages.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="大厅还很安静，来打个招呼吧" />
            ) : (
              messages.map((m: any) => {
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
                          padding: '8px 12px', borderRadius: 8,
                          background: mine ? '#1890ff' : '#f5f5f5',
                          color: mine ? '#fff' : 'inherit',
                          wordBreak: 'break-word', whiteSpace: 'pre-wrap', fontSize: 14,
                        }}
                      >
                        {m.content}
                      </div>
                      <div
                        style={{ fontSize: 11, color: '#bfbfbf', marginTop: 2, textAlign: mine ? 'right' : 'left' }}
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
              placeholder={token ? '说点什么…（回车发送，Shift+回车换行）' : '登录后即可参与交流'}
              disabled={!token}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
            />
            <Button type="primary" icon={<SendOutlined />} onClick={send} disabled={!token || !input.trim()}>
              发送
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
