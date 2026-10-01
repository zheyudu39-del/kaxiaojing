import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Col, Empty, Form, Input, List, Modal, Row, Statistic, Typography, App } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined, PushpinFilled, SearchOutlined } from '@ant-design/icons'
import { notebookApi } from '@/api/learning'
import { Loading, PageHeader } from '@/components/common'

const { Text, Paragraph } = Typography

export default function Notebook() {
  const { message, modal } = App.useApp()

  const [notes, setNotes] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [keyword, setKeyword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  const load = useCallback(async (kw?: string) => {
    setLoading(true)
    try {
      const list = kw ? await notebookApi.search(kw) : await notebookApi.list()
      setNotes(list)
      const s = await notebookApi.stats().catch(() => ({}))
      setStats(s ?? {})
    } catch {
      setNotes([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    setOpen(true)
  }

  const openEdit = (n: any) => {
    setEditing(n)
    form.setFieldsValue({ title: n.title, content: n.content, tags: n.tags })
    setOpen(true)
  }

  const submit = async (values: any) => {
    setSubmitting(true)
    try {
      if (editing) {
        await notebookApi.update(editing.id, values)
        message.success('笔记已更新')
      } else {
        await notebookApi.create(values)
        message.success('笔记已保存')
      }
      setOpen(false)
      form.resetFields()
      load(keyword || undefined)
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false)
    }
  }

  const pin = async (n: any) => {
    try {
      await notebookApi.pin(n.id)
      message.success(n.is_pinned ? '已取消置顶' : '已置顶')
      load(keyword || undefined)
    } catch {
      /* ignore */
    }
  }

  const remove = (n: any) => {
    modal.confirm({
      title: `删除笔记「${n.title}」？`,
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        try {
          await notebookApi.remove(n.id)
          message.success('已删除')
          load(keyword || undefined)
        } catch {
          /* ignore */
        }
      },
    })
  }

  return (
    <div>
      <PageHeader
        title="学习笔记"
        description="记录灵感与知识点，随时检索"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建笔记
          </Button>
        }
      />

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        {[
          { title: '笔记总数', value: stats?.total ?? notes.length },
          { title: '本周新增', value: stats?.week_new ?? 0 },
          { title: '置顶', value: notes.filter((n) => n.is_pinned).length },
        ].map((s) => (
          <Col key={s.title} xs={8} md={8}>
            <Card size="small">
              <Statistic title={s.title} value={s.value} />
            </Card>
          </Col>
        ))}
      </Row>

      <div className="toolbar-row" style={{ marginBottom: 16 }}>
        <Input.Search
          allowClear
          prefix={<SearchOutlined />}
          placeholder="搜索笔记标题或内容"
          style={{ width: 320 }}
          onSearch={(v) => {
            setKeyword(v)
            load(v || undefined)
          }}
        />
      </div>

      {loading ? (
        <Loading />
      ) : notes.length === 0 ? (
        <Card>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={keyword ? '没有匹配的笔记' : '还没有笔记'}>
            {!keyword && (
              <Button type="primary" onClick={openCreate}>
                写第一篇笔记
              </Button>
            )}
          </Empty>
        </Card>
      ) : (
        <Row gutter={[12, 12]}>
          {notes.map((n: any) => (
            <Col key={n.id} xs={24} sm={12} lg={8}>
              <Card
                size="small"
                title={
                  <span className="text-ellipsis">
                    {n.is_pinned ? <PushpinFilled style={{ color: '#faad14', marginRight: 6 }} /> : null}
                    {n.title}
                  </span>
                }
                extra={
                  <span onClick={(e) => e.stopPropagation()}>
                    <Button type="text" size="small" icon={<PushpinFilled />} onClick={() => pin(n)} />
                    <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(n)} />
                    <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => remove(n)} />
                  </span>
                }
              >
                <Paragraph className="clamp-3" style={{ fontSize: 13, color: '#595959', minHeight: 60 }}>
                  {n.content}
                </Paragraph>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {n.updated_at || n.created_at}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={editing ? '编辑笔记' : '新建笔记'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="笔记标题" maxLength={80} />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true, message: '请输入内容' }]}>
            <Input.TextArea rows={10} maxLength={5000} showCount placeholder="支持多行文本" />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Input placeholder="用逗号分隔" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
