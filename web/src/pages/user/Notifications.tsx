import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Card, Empty, List, Pagination, Space, Tag, Typography, App } from 'antd'
import { CheckOutlined, DeleteOutlined } from '@ant-design/icons'
import { notificationApi } from '@/api/me'
import { Loading, PageHeader } from '@/components/common'
import type { Notification } from '@/types'

const { Text } = Typography

const TYPE_META: Record<string, { label: string; color: string }> = {
  system: { label: '系统', color: 'blue' },
  comment: { label: '评论', color: 'green' },
  like: { label: '点赞', color: 'red' },
  follow: { label: '关注', color: 'purple' },
  team: { label: '队伍', color: 'orange' },
  review: { label: '审核', color: 'gold' },
  mentor: { label: '导师', color: 'cyan' },
}

export default function Notifications() {
  const { message, modal } = App.useApp()
  const navigate = useNavigate()

  const [list, setList] = useState<Notification[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [onlyUnread, setOnlyUnread] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await notificationApi.list({ page, pageSize: 20, unread_only: onlyUnread || undefined })
      setList(res?.notifications ?? [])
      setTotal(res?.total ?? 0)
    } catch {
      setList([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, onlyUnread])

  useEffect(() => {
    load()
  }, [load])

  const markRead = async (n: Notification) => {
    if (!n.is_read) {
      try {
        await notificationApi.markRead(n.id)
        setList((l) => l.map((x) => (x.id === n.id ? { ...x, is_read: 1 } : x)))
      } catch {
        /* ignore */
      }
    }
    // 通知关联到具体资源时跳转
    if (n.related_id) {
      const route: Record<string, string> = {
        post: `/forum/${n.related_id}`,
        competition: `/competitions/${n.related_id}`,
        team: `/teams/${n.related_id}`,
        question: `/qa/${n.related_id}`,
      }
      const to = route[n.type] || (n.type === 'comment' ? `/forum/${n.related_id}` : '')
      if (to) navigate(to)
    }
  }

  const markAllRead = async () => {
    try {
      await notificationApi.markAllRead()
      message.success('已全部标记为已读')
      load()
    } catch {
      /* ignore */
    }
  }

  const removeOne = async (id: number) => {
    try {
      await notificationApi.remove(id)
      load()
    } catch {
      /* ignore */
    }
  }

  const clearRead = () => {
    modal.confirm({
      title: '清除已读通知？',
      content: '已读通知将被永久删除，未读通知会保留。',
      okText: '清除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        try {
          await notificationApi.removeRead()
          message.success('已清除')
          load()
        } catch {
          /* ignore */
        }
      },
    })
  }

  const clearAll = () => {
    modal.confirm({
      title: '清空全部通知？',
      content: '所有通知将被永久删除，此操作不可恢复。',
      okText: '清空',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        try {
          await notificationApi.removeAll()
          message.success('已清空')
          setPage(1)
          load()
        } catch {
          /* ignore */
        }
      },
    })
  }

  const unreadCount = list.filter((n) => !n.is_read).length

  return (
    <div>
      <PageHeader
        title="通知中心"
        description={total > 0 ? `共 ${total} 条${unreadCount ? `，本页 ${unreadCount} 条未读` : ''}` : undefined}
        extra={
          <Space size={8}>
            <Button onClick={() => setOnlyUnread((v) => !v)} type={onlyUnread ? 'primary' : 'default'}>
              {onlyUnread ? '只看未读' : '全部通知'}
            </Button>
            <Button icon={<CheckOutlined />} onClick={markAllRead}>
              全部已读
            </Button>
            <Button icon={<DeleteOutlined />} onClick={clearRead}>
              清除已读
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={clearAll}>
              清空
            </Button>
          </Space>
        }
      />

      <Card>
        {loading ? (
          <Loading />
        ) : list.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={onlyUnread ? '没有未读通知' : '暂无通知'} />
        ) : (
          <>
            <List
              itemLayout="horizontal"
              dataSource={list}
              renderItem={(n) => {
                const meta = TYPE_META[n.type] || { label: n.type, color: 'default' }
                return (
                  <List.Item
                    actions={[
                      !n.is_read && (
                        <Button type="link" size="small" onClick={() => markRead(n)}>
                          标为已读
                        </Button>
                      ),
                      <Button type="link" size="small" danger onClick={() => removeOne(n.id)}>
                        删除
                      </Button>,
                    ].filter(Boolean)}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge dot={!n.is_read}>
                          <Tag color={meta.color} style={{ margin: 0 }}>
                            {meta.label}
                          </Tag>
                        </Badge>
                      }
                      title={
                        <a onClick={() => markRead(n)} style={{ fontWeight: n.is_read ? 400 : 500 }}>
                          {n.title}
                        </a>
                      }
                      description={
                        <>
                          {n.content && <div style={{ fontSize: 13 }}>{n.content}</div>}
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {n.created_at}
                          </Text>
                        </>
                      }
                    />
                  </List.Item>
                )
              }}
            />
            {total > 20 && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Pagination
                  current={page}
                  pageSize={20}
                  total={total}
                  showSizeChanger={false}
                  onChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}
