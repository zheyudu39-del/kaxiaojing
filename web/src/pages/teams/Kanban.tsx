import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Avatar, Button, Card, Col, Empty, Form, Input, Modal, Row, Select, Space, Tag, Tooltip,
  Typography, App,
} from 'antd'
import { DeleteOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons'
import { kanbanApi, teamApi } from '@/api/teams'
import { Loading, PageHeader } from '@/components/common'
import type { TeamTask, TeamMember } from '@/types'

const { Text } = Typography

const COLUMNS = [
  { key: 'todo', title: '待办', color: '#d9d9d9' },
  { key: 'in_progress', title: '进行中', color: '#1890ff' },
  { key: 'done', title: '已完成', color: '#52c41a' },
] as const

const PRIORITY: Record<string, { label: string; color: string }> = {
  low: { label: '低', color: 'default' },
  medium: { label: '中', color: 'blue' },
  high: { label: '高', color: 'red' },
}

export default function Kanban() {
  const { id = '' } = useParams()
  const { message, modal } = App.useApp()

  const [tasks, setTasks] = useState<TeamTask[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<TeamTask | null>(null)
  const [form] = Form.useForm()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [t, m] = await Promise.allSettled([kanbanApi.board(id), teamApi.members(id)])
      if (t.status === 'fulfilled') {
        const list = Array.isArray(t.value) ? t.value : ((t.value as any)?.tasks ?? [])
        setTasks(list)
      }
      if (m.status === 'fulfilled') setMembers(m.value)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    setOpen(true)
  }

  const openEdit = (task: TeamTask) => {
    setEditing(task)
    form.setFieldsValue({
      title: task.title,
      description: task.description ?? '',
      assignee_id: task.assignee_id ?? undefined,
      priority: task.priority ?? 'medium',
      due_date: task.due_date ?? '',
    })
    setOpen(true)
  }

  const submit = async (values: any) => {
    try {
      if (editing) {
        await kanbanApi.updateTask(editing.id, values)
        message.success('任务已更新')
      } else {
        await kanbanApi.createTask(id, values)
        message.success('任务已创建')
      }
      setOpen(false)
      form.resetFields()
      load()
    } catch {
      /* ignore */
    }
  }

  const move = async (task: TeamTask, status: string) => {
    // 乐观更新，失败再回滚
    const prev = tasks
    setTasks((ts) => ts.map((t) => (t.id === task.id ? { ...t, status } : t)))
    try {
      await kanbanApi.updateStatus(task.id, status)
    } catch {
      setTasks(prev)
    }
  }

  const remove = (task: TeamTask) => {
    modal.confirm({
      title: `删除任务「${task.title}」？`,
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        try {
          await kanbanApi.removeTask(task.id)
          message.success('已删除')
          load()
        } catch {
          /* ignore */
        }
      },
    })
  }

  const memberName = (userId?: number | null) =>
    members.find((m) => m.user_id === userId)?.username || (userId ? `用户 #${userId}` : '未分配')

  if (loading) return <Loading />

  return (
    <div>
      <PageHeader
        title="任务看板"
        description="分配任务、跟踪进度"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建任务
          </Button>
        }
      />

      <Row gutter={[12, 12]}>
        {COLUMNS.map((col) => {
          const list = tasks.filter((t) => (t.status || 'todo') === col.key)
          return (
            <Col key={col.key} xs={24} md={8}>
              <Card
                size="small"
                title={
                  <Space>
                    <span
                      style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: col.color }}
                    />
                    {col.title}
                    <Tag>{list.length}</Tag>
                  </Space>
                }
                styles={{ body: { minHeight: 200, background: '#fafafa', padding: 8 } }}
              >
                {list.length === 0 ? (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无任务" style={{ margin: '24px 0' }} />
                ) : (
                  list.map((t) => (
                    <Card
                      key={t.id}
                      size="small"
                      style={{ marginBottom: 8, cursor: 'pointer' }}
                      onClick={() => openEdit(t)}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                        <div className="clamp-2" style={{ flex: 1, fontSize: 14 }}>
                          {t.title}
                        </div>
                        <Tag color={PRIORITY[t.priority]?.color} style={{ margin: 0, flexShrink: 0 }}>
                          {PRIORITY[t.priority]?.label ?? t.priority}
                        </Tag>
                      </div>

                      {t.description && (
                        <div className="clamp-2" style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                          {t.description}
                        </div>
                      )}

                      <div
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          marginTop: 8, fontSize: 12, color: '#8c8c8c',
                        }}
                      >
                        <Space size={4}>
                          <Avatar size={18} icon={<UserOutlined />} />
                          {memberName(t.assignee_id)}
                        </Space>
                        {t.due_date && <span>{t.due_date}</span>}
                      </div>

                      <div style={{ marginTop: 8, display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                        {COLUMNS.filter((c) => c.key !== (t.status || 'todo')).map((c) => (
                          <Button key={c.key} size="small" onClick={() => move(t, c.key)}>
                            → {c.title}
                          </Button>
                        ))}
                        <Tooltip title="删除">
                          <Button size="small" danger type="text" icon={<DeleteOutlined />} onClick={() => remove(t)} />
                        </Tooltip>
                      </div>
                    </Card>
                  ))
                )}
              </Card>
            </Col>
          )
        })}
      </Row>

      <Modal
        title={editing ? '编辑任务' : '新建任务'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item name="title" label="任务标题" rules={[{ required: true, message: '请输入任务标题' }]}>
            <Input placeholder="要做什么" maxLength={60} />
          </Form.Item>
          <Form.Item name="description" label="任务描述">
            <Input.TextArea rows={3} maxLength={300} showCount />
          </Form.Item>
          <Form.Item name="assignee_id" label="负责人">
            <Select
              allowClear
              placeholder="选择负责人"
              options={members.map((m) => ({ label: m.username || `用户 #${m.user_id}`, value: m.user_id }))}
            />
          </Form.Item>
          <Form.Item name="priority" label="优先级" initialValue="medium">
            <Select
              options={[
                { label: '低', value: 'low' },
                { label: '中', value: 'medium' },
                { label: '高', value: 'high' },
              ]}
            />
          </Form.Item>
          <Form.Item name="due_date" label="截止日期">
            <Input placeholder="如 2026-06-01" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
