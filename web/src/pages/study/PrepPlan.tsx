import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Checkbox, Col, Empty, Form, Input, List, Modal, Row, Select, Space, Statistic, Tag, Typography, App } from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { prepTodoApi } from '@/api/learning'
import { competitionApi } from '@/api/competitions'
import { Loading, PageHeader } from '@/components/common'
import type { Competition } from '@/types'

const { Text } = Typography

const PRIORITY: Record<number, { label: string; color: string }> = {
  0: { label: '普通', color: 'default' },
  1: { label: '重要', color: 'blue' },
  2: { label: '紧急', color: 'red' },
}

export default function PrepPlan() {
  const { message, modal } = App.useApp()

  const [todos, setTodos] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [filter, setFilter] = useState<'all' | 'open' | 'done'>('all')
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params =
        filter === 'open' ? { completed: false } : filter === 'done' ? { completed: true } : undefined
      const [t, s] = await Promise.allSettled([prepTodoApi.list(params), prepTodoApi.stats()])
      if (t.status === 'fulfilled') setTodos(t.value)
      if (s.status === 'fulfilled') setStats(s.value ?? {})
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    competitionApi.list({ pageSize: 200 }).then((r) => setCompetitions(r?.competitions ?? [])).catch(() => {})
  }, [])

  const create = async (values: any) => {
    setSubmitting(true)
    try {
      await prepTodoApi.create({
        ...values,
        competition_id: values.competition_id ? Number(values.competition_id) : undefined,
        priority: Number(values.priority ?? 0),
      } as any)
      message.success('待办已添加')
      setOpen(false)
      form.resetFields()
      load()
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false)
    }
  }

  const toggle = async (t: any) => {
    // 乐观更新
    setTodos((list) => list.map((x) => (x.id === t.id ? { ...x, is_completed: x.is_completed ? 0 : 1 } : x)))
    try {
      await prepTodoApi.toggle(t.id)
      prepTodoApi.stats().then((s) => setStats(s ?? {})).catch(() => {})
    } catch {
      load()
    }
  }

  const remove = (t: any) => {
    modal.confirm({
      title: `删除「${t.title}」？`,
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        try {
          await prepTodoApi.remove(t.id)
          message.success('已删除')
          load()
        } catch {
          /* ignore */
        }
      },
    })
  }

  return (
    <div>
      <PageHeader
        title="备赛计划"
        description="把大目标拆成一件件小事"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
            添加待办
          </Button>
        }
      />

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        {[
          { title: '全部', value: stats?.total ?? todos.length },
          { title: '已完成', value: stats?.completed ?? 0 },
          { title: '待完成', value: (stats?.total ?? 0) - (stats?.completed ?? 0) },
          { title: '已逾期', value: stats?.overdue ?? 0 },
        ].map((s) => (
          <Col key={s.title} xs={12} md={6}>
            <Card size="small">
              <Statistic title={s.title} value={s.value} />
            </Card>
          </Col>
        ))}
      </Row>

      <div className="toolbar-row" style={{ marginBottom: 16 }}>
        <Select
          value={filter}
          style={{ width: 140 }}
          onChange={setFilter}
          options={[
            { label: '全部', value: 'all' },
            { label: '待完成', value: 'open' },
            { label: '已完成', value: 'done' },
          ]}
        />
      </div>

      <Card>
        {loading ? (
          <Loading />
        ) : todos.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无待办事项" />
        ) : (
          <List
            dataSource={todos}
            renderItem={(t: any) => (
              <List.Item
                actions={[
                  <Button key="d" type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => remove(t)} />,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Checkbox checked={!!t.is_completed} onChange={() => toggle(t)} style={{ marginTop: 4 }} />
                  }
                  title={
                    <Space size={6}>
                      <Text delete={!!t.is_completed} style={{ fontSize: 14 }}>
                        {t.title}
                      </Text>
                      <Tag color={PRIORITY[t.priority]?.color} style={{ margin: 0 }}>
                        {PRIORITY[t.priority]?.label ?? '普通'}
                      </Tag>
                    </Space>
                  }
                  description={
                    <Space size={10} style={{ fontSize: 12, color: '#8c8c8c' }}>
                      {t.due_date && <span>截止 {t.due_date}</span>}
                      {t.description && <span className="text-ellipsis" style={{ maxWidth: 260 }}>{t.description}</span>}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      <Modal
        title="添加待办"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={create}>
          <Form.Item name="title" label="待办内容" rules={[{ required: true, message: '请输入内容' }]}>
            <Input placeholder="如：完成 3 套模拟题" maxLength={60} />
          </Form.Item>
          <Form.Item name="competition_id" label="关联竞赛">
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="选择竞赛"
              options={competitions.map((c) => ({ label: c.name, value: c.id }))}
            />
          </Form.Item>
          <Form.Item name="priority" label="优先级" initialValue={0}>
            <Select
              options={[
                { label: '普通', value: 0 },
                { label: '重要', value: 1 },
                { label: '紧急', value: 2 },
              ]}
            />
          </Form.Item>
          <Form.Item name="due_date" label="截止日期">
            <Input placeholder="2026-06-01" />
          </Form.Item>
          <Form.Item name="description" label="备注">
            <Input.TextArea rows={2} maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
