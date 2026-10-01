import { useEffect, useState } from 'react'
import { Button, Card, Col, Empty, Form, Input, List, Row, Select, Tag, Typography, App } from 'antd'
import { SendOutlined } from '@ant-design/icons'
import { feedbackApi } from '@/api/stats'
import { Loading, PageHeader } from '@/components/common'

const { Text, Paragraph } = Typography

const TYPES = [
  { label: '功能建议', value: 'suggestion' },
  { label: '问题反馈', value: 'bug' },
  { label: '投诉', value: 'complaint' },
  { label: '其他', value: 'other' },
]

const STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: '待处理', color: 'orange' },
  processing: { label: '处理中', color: 'blue' },
  resolved: { label: '已解决', color: 'green' },
  closed: { label: '已关闭', color: 'default' },
}

export default function Feedback() {
  const { message } = App.useApp()
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  const load = async () => {
    setLoading(true)
    try {
      const res: any = await feedbackApi.my()
      setList(Array.isArray(res) ? res : (res?.feedback ?? []))
    } catch {
      setList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const submit = async (values: any) => {
    setSubmitting(true)
    try {
      await feedbackApi.submit(values)
      message.success('反馈已提交，感谢你的建议')
      form.resetFields()
      load()
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: 960 }}>
      <PageHeader title="意见反馈" description="遇到问题或有建议？告诉我们" />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="提交反馈">
            <Form form={form} layout="vertical" onFinish={submit}>
              <Form.Item name="type" label="反馈类型" initialValue="suggestion">
                <Select options={TYPES} />
              </Form.Item>
              <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
                <Input placeholder="一句话概括" maxLength={60} />
              </Form.Item>
              <Form.Item name="content" label="详细描述" rules={[{ required: true, message: '请输入描述' }]}>
                <Input.TextArea rows={6} maxLength={1000} showCount placeholder="请尽量描述清楚问题出现的场景与步骤" />
              </Form.Item>
              <Form.Item name="contact" label="联系方式（选填）">
                <Input placeholder="邮箱或 QQ，便于我们回复你" />
              </Form.Item>
              <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={submitting} block>
                提交
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title={`我的反馈 (${list.length})`}>
            {loading ? (
              <Loading />
            ) : list.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="还没有提交过反馈" />
            ) : (
              <List
                dataSource={list}
                renderItem={(f: any) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <span style={{ fontSize: 14 }}>
                          {f.title}
                          <Tag color={STATUS[f.status]?.color} style={{ marginLeft: 8 }}>
                            {STATUS[f.status]?.label ?? f.status}
                          </Tag>
                        </span>
                      }
                      description={
                        <>
                          <Paragraph className="clamp-2" style={{ marginBottom: 4, fontSize: 13, color: '#8c8c8c' }}>
                            {f.content}
                          </Paragraph>
                          {f.admin_reply && (
                            <div style={{ background: '#f6ffed', padding: '6px 10px', borderRadius: 6, fontSize: 13 }}>
                              <Text strong>官方回复：</Text>
                              {f.admin_reply}
                            </div>
                          )}
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {f.created_at}
                          </Text>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
