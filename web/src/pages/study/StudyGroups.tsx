import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Col, Empty, Form, Input, Modal, Row, Select, Space, Tag, Typography, App } from 'antd'
import { PlusOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons'
import { studyGroupApi } from '@/api/learning'
import { Loading, PageHeader } from '@/components/common'
import { useAuthStore } from '@/stores/auth'
import type { StudyGroup } from '@/types'

const { Text } = Typography
const CATEGORIES = ['数学建模', '程序设计', '创新创业', '学科竞赛', '英语', '考研', '其他']

export default function StudyGroups() {
  const { message } = App.useApp()
  const token = useAuthStore((s) => s.token)

  const [groups, setGroups] = useState<StudyGroup[]>([])
  const [category, setCategory] = useState<string | undefined>()
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await studyGroupApi.list({ category, keyword: keyword || undefined })
      setGroups(res?.groups ?? [])
    } catch {
      setGroups([])
    } finally {
      setLoading(false)
    }
  }, [category, keyword])

  useEffect(() => {
    load()
  }, [load])

  const create = async (values: any) => {
    setSubmitting(true)
    try {
      await studyGroupApi.create(values)
      message.success('小组创建成功')
      setOpen(false)
      form.resetFields()
      load()
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="学习小组"
        description="和志同道合的人一起学"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => (token ? setOpen(true) : message.warning('请先登录'))}
          >
            创建小组
          </Button>
        }
      />

      <div className="toolbar-row" style={{ marginBottom: 16 }}>
        <Select
          allowClear
          placeholder="选择方向"
          style={{ width: 160 }}
          value={category}
          onChange={setCategory}
          options={CATEGORIES.map((c) => ({ label: c, value: c }))}
        />
        <Input.Search allowClear placeholder="搜索小组" style={{ width: 260 }} onSearch={setKeyword} />
      </div>

      {loading ? (
        <Loading />
      ) : groups.length === 0 ? (
        <Card>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="还没有学习小组" />
        </Card>
      ) : (
        <Row gutter={[12, 12]}>
          {groups.map((g: any) => (
            <Col key={g.id} xs={24} sm={12} lg={8}>
              <Link to={`/study-groups/${g.id}`}>
                <Card size="small" hoverable>
                  <Space>
                    <TeamOutlined />
                    <span className="text-ellipsis" style={{ fontSize: 15, fontWeight: 500, maxWidth: 180 }}>
                      {g.name}
                    </span>
                    {g.category && <Tag color="blue">{g.category}</Tag>}
                  </Space>
                  <div className="clamp-2" style={{ fontSize: 12, color: '#8c8c8c', margin: '8px 0', minHeight: 36 }}>
                    {g.description || '暂无简介'}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <UserOutlined /> {g.member_count ?? 0} 位成员
                  </Text>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title="创建学习小组"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={create}>
          <Form.Item name="name" label="小组名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="如：2026 数学建模国赛冲刺组" maxLength={40} />
          </Form.Item>
          <Form.Item name="category" label="方向" rules={[{ required: true, message: '请选择方向' }]}>
            <Select options={CATEGORIES.map((c) => ({ label: c, value: c }))} />
          </Form.Item>
          <Form.Item name="description" label="小组简介">
            <Input.TextArea rows={3} maxLength={300} showCount placeholder="学习目标、计划、招募要求" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
