import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Avatar, Button, Card, Col, Form, Input, List, Modal, Row, Select, Space, Tag, Typography, App,
} from 'antd'
import { CommentOutlined, EyeOutlined, LikeOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons'
import { postApi } from '@/api/community'
import { Loading, PageHeader } from '@/components/common'
import { useAuthStore } from '@/stores/auth'
import type { Post } from '@/types'

const { Text, Paragraph } = Typography

const CATEGORIES = ['经验分享', '备赛攻略', '避坑指南', '资料推荐', '组队交流', '其他']

export default function Forum() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)

  const [posts, setPosts] = useState<Post[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState<string | undefined>()
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await postApi.list({ page, pageSize: 10, category, keyword: keyword || undefined })
      setPosts(res?.posts ?? [])
      setTotal(res?.total ?? 0)
    } catch {
      setPosts([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, category, keyword])

  useEffect(() => {
    load()
  }, [load])

  const create = async (values: any) => {
    setSubmitting(true)
    try {
      const res: any = await postApi.create(values)
      message.success('发布成功，等待管理员审核')
      setOpen(false)
      form.resetFields()
      if (res?.id) navigate(`/forum/${res.id}`)
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
        title="经验分享"
        description="学长学姐的备赛经验与避坑指南"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => (token ? setOpen(true) : message.warning('请先登录'))}
          >
            发布经验帖
          </Button>
        }
      />

      <div className="toolbar-row" style={{ marginBottom: 16 }}>
        <Select
          allowClear
          placeholder="选择分类"
          style={{ width: 160 }}
          value={category}
          onChange={(v) => {
            setCategory(v)
            setPage(1)
          }}
          options={CATEGORIES.map((c) => ({ label: c, value: c }))}
        />
        <Input.Search
          allowClear
          placeholder="搜索帖子标题或内容"
          style={{ width: 280 }}
          onSearch={(v) => {
            setKeyword(v)
            setPage(1)
          }}
        />
      </div>

      {loading ? (
        <Loading />
      ) : (
        <Card styles={{ body: { padding: '0 16px' } }}>
          <List
            dataSource={posts}
            locale={{ emptyText: '暂无帖子' }}
            renderItem={(p: any) => (
              <List.Item
                actions={[
                  <Space key="like" size={4}>
                    <LikeOutlined />
                    {p.like_count ?? 0}
                  </Space>,
                  <Space key="comment" size={4}>
                    <CommentOutlined />
                    {p.comment_count ?? 0}
                  </Space>,
                  <Space key="view" size={4}>
                    <EyeOutlined />
                    {p.view_count ?? 0}
                  </Space>,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar src={p.author_avatar || undefined} icon={<UserOutlined />} />}
                  title={
                    <Space size={8}>
                      <Link to={`/forum/${p.id}`} style={{ fontSize: 15, fontWeight: 500 }}>
                        {p.title}
                      </Link>
                      {p.category && <Tag color="blue">{p.category}</Tag>}
                    </Space>
                  }
                  description={
                    <>
                      <Paragraph
                        className="clamp-2"
                        style={{ marginBottom: 6, color: '#8c8c8c', fontSize: 13 }}
                      >
                        {p.content}
                      </Paragraph>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {p.author_username || p.username || `用户 #${p.author_id}`} · {p.created_at}
                      </Text>
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

      <Modal
        title="发布经验帖"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        width={640}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={create}>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="一句话概括你的经验" maxLength={80} showCount />
          </Form.Item>
          <Form.Item name="category" label="分类" initialValue="经验分享">
            <Select options={CATEGORIES.map((c) => ({ label: c, value: c }))} />
          </Form.Item>
          <Form.Item name="content" label="正文" rules={[{ required: true, message: '请输入正文' }]}>
            <Input.TextArea rows={10} placeholder="详细描述你的经验、踩过的坑、建议..." maxLength={5000} showCount />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Input placeholder="用逗号分隔，如：数学建模,备赛" />
          </Form.Item>
          <Text type="secondary" style={{ fontSize: 12 }}>
            发布后需管理员审核通过才会公开展示。
          </Text>
        </Form>
      </Modal>
    </div>
  )
}
