import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Avatar, Button, Card, Col, Empty, Form, Input, List, Modal, Row, Select, Space, Tag, Typography, App,
} from 'antd'
import { CheckCircleFilled, EyeOutlined, MessageOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons'
import { qaApi } from '@/api/community'
import { Loading, PageHeader } from '@/components/common'
import { useAuthStore } from '@/stores/auth'
import type { QAQuestion } from '@/types'

const { Text, Paragraph } = Typography

export default function Qa() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)

  const [questions, setQuestions] = useState<QAQuestion[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [tag, setTag] = useState<string | undefined>()
  const [sort, setSort] = useState('latest')
  const [tags, setTags] = useState<{ tag: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await qaApi.questions({ page, pageSize: 10, tag, sort })
      setQuestions(res?.questions ?? [])
      setTotal(res?.total ?? 0)
    } catch {
      setQuestions([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, tag, sort])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    qaApi.popularTags().then(setTags).catch(() => {})
  }, [])

  const create = async (values: any) => {
    setSubmitting(true)
    try {
      const res: any = await qaApi.createQuestion(values)
      message.success('问题已发布')
      setOpen(false)
      form.resetFields()
      if (res?.question_id) navigate(`/qa/${res.question_id}`)
      else load()
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="问答广场"
        description={`共 ${total} 个问题`}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => (token ? setOpen(true) : message.warning('请先登录'))}
          >
            我要提问
          </Button>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={17}>
          <div className="toolbar-row" style={{ marginBottom: 12 }}>
            <Select
              value={sort}
              style={{ width: 140 }}
              onChange={setSort}
              options={[
                { label: '最新', value: 'latest' },
                { label: '最多回答', value: 'answers' },
                { label: '最多浏览', value: 'views' },
              ]}
            />
            {tag && (
              <Tag closable color="blue" onClose={() => setTag(undefined)}>
                {tag}
              </Tag>
            )}
          </div>

          {loading ? (
            <Loading />
          ) : questions.length === 0 ? (
            <Card>
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="还没有问题，来问第一个吧" />
            </Card>
          ) : (
            <Card styles={{ body: { padding: '0 16px' } }}>
              <List
                dataSource={questions}
                renderItem={(q: any) => (
                  <List.Item
                    actions={[
                      <Space key="a" size={4}>
                        <MessageOutlined />
                        {q.answer_count ?? 0}
                      </Space>,
                      <Space key="v" size={4}>
                        <EyeOutlined />
                        {q.view_count ?? 0}
                      </Space>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar src={q.avatar_url || undefined} icon={<UserOutlined />} />}
                      title={
                        <Space size={6}>
                          {q.is_solved ? <CheckCircleFilled style={{ color: '#52c41a' }} /> : null}
                          <Link to={`/qa/${q.id}`} style={{ fontSize: 15, fontWeight: 500 }}>
                            {q.title}
                          </Link>
                        </Space>
                      }
                      description={
                        <>
                          <Paragraph className="clamp-2" style={{ marginBottom: 6, color: '#8c8c8c', fontSize: 13 }}>
                            {q.content}
                          </Paragraph>
                          <Space size={6} wrap>
                            {String(q.tags || '')
                              .replace(/[[\]"]/g, '')
                              .split(',')
                              .filter(Boolean)
                              .slice(0, 4)
                              .map((t: string) => (
                                <Tag key={t} style={{ margin: 0, fontSize: 11 }}>
                                  {t.trim()}
                                </Tag>
                              ))}
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {q.username || `用户 #${q.user_id}`} · {q.created_at}
                            </Text>
                          </Space>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
              {total > 10 && (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    上一页
                  </Button>
                  <Text style={{ margin: '0 12px' }}>
                    {page} / {Math.ceil(total / 10)}
                  </Text>
                  <Button disabled={page >= Math.ceil(total / 10)} onClick={() => setPage((p) => p + 1)}>
                    下一页
                  </Button>
                </div>
              )}
            </Card>
          )}
        </Col>

        <Col xs={24} lg={7}>
          <Card title="热门标签" size="small">
            {tags.length === 0 ? (
              <Text type="secondary" style={{ fontSize: 12 }}>
                暂无标签
              </Text>
            ) : (
              <Space wrap size={6}>
                {tags.map((t) => (
                  <Tag
                    key={t.tag}
                    color={tag === t.tag ? 'blue' : undefined}
                    style={{ cursor: 'pointer', margin: 0 }}
                    onClick={() => {
                      setTag(t.tag)
                      setPage(1)
                    }}
                  >
                    {t.tag} ({t.count})
                  </Tag>
                ))}
              </Space>
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title="我要提问"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={create}>
          <Form.Item name="title" label="问题标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="用一句话描述你的问题" maxLength={80} showCount />
          </Form.Item>
          <Form.Item name="content" label="问题详情" rules={[{ required: true, message: '请输入详情' }]}>
            <Input.TextArea rows={6} maxLength={2000} showCount placeholder="补充背景、你尝试过什么、卡在哪一步" />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Input placeholder="用逗号分隔，如：数学建模,算法" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
