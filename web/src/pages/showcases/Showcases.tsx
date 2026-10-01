import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Avatar, Button, Card, Col, Empty, Form, Input, InputNumber, Modal, Row, Select, Space, Tag,
  Typography, App,
} from 'antd'
import { LikeFilled, LikeOutlined, PlusOutlined, ReloadOutlined, UserOutlined } from '@ant-design/icons'
import { showcaseApi } from '@/api/community'
import { competitionApi } from '@/api/competitions'
import { Loading, PageHeader } from '@/components/common'
import { useAuthStore } from '@/stores/auth'
import type { Showcase, Competition } from '@/types'

const { Text, Paragraph } = Typography

const AWARD_LEVELS = ['国家级一等奖', '国家级二等奖', '国家级三等奖', '省级一等奖', '省级二等奖', '省级三等奖', '校级一等奖', '校级二等奖', '校级三等奖', '优秀奖']

export default function Showcases() {
  const { message } = App.useApp()
  const token = useAuthStore((s) => s.token)

  const [list, setList] = useState<Showcase[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [competitionId, setCompetitionId] = useState<number | undefined>()
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [liked, setLiked] = useState<Record<number, boolean>>({})
  const [form] = Form.useForm()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res: any = await showcaseApi.list({ pageSize: 24, competition_id: competitionId })
      setList(res?.showcases ?? [])
    } catch {
      setList([])
    } finally {
      setLoading(false)
    }
  }, [competitionId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    competitionApi.list({ pageSize: 200 }).then((r) => setCompetitions(r?.competitions ?? [])).catch(() => {})
  }, [])

  const toggleLike = async (s: Showcase) => {
    if (!token) return message.warning('请先登录')
    const isLiked = liked[s.id]
    try {
      if (isLiked) await showcaseApi.unlike(s.id)
      else await showcaseApi.like(s.id)
      setLiked((m) => ({ ...m, [s.id]: !isLiked }))
      setList((l) =>
        l.map((x) => (x.id === s.id ? { ...x, like_count: Math.max(0, (x.like_count ?? 0) + (isLiked ? -1 : 1)) } : x)),
      )
    } catch {
      /* ignore */
    }
  }

  const create = async (values: any) => {
    setSubmitting(true)
    try {
      await showcaseApi.create({
        ...values,
        competition_id: Number(values.competition_id),
      } as any)
      message.success('作品已提交，等待管理员审核')
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
        title="作品展示"
        description="看看大家的获奖作品与项目"
        extra={
          <Space size={8}>
            <Button icon={<ReloadOutlined />} onClick={load}>
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => (token ? setOpen(true) : message.warning('请先登录'))}
            >
              展示我的作品
            </Button>
          </Space>
        }
      />

      <div className="toolbar-row" style={{ marginBottom: 16 }}>
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="按竞赛筛选"
          style={{ width: 280 }}
          value={competitionId}
          onChange={setCompetitionId}
          options={competitions.map((c) => ({ label: c.name, value: c.id }))}
        />
      </div>

      {loading ? (
        <Loading />
      ) : list.length === 0 ? (
        <Card>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="还没有作品展示" />
        </Card>
      ) : (
        <Row gutter={[12, 12]}>
          {list.map((s: any) => (
            <Col key={s.id} xs={24} sm={12} lg={8}>
              <Card
                size="small"
                cover={
                  s.image_urls ? (
                    <img
                      alt={s.title}
                      src={String(s.image_urls).split(',')[0]}
                      style={{ height: 160, objectFit: 'cover' }}
                    />
                  ) : undefined
                }
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <div className="clamp-2" style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>
                    {s.title}
                  </div>
                  <Tag color="gold" style={{ margin: 0, flexShrink: 0 }}>
                    {s.award_level}
                  </Tag>
                </div>

                <Paragraph className="clamp-2" style={{ fontSize: 12, color: '#8c8c8c', margin: '6px 0', minHeight: 36 }}>
                  {s.description || '暂无描述'}
                </Paragraph>

                <Space size={6} style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>
                  <span>{s.award_year} 年</span>
                  {s.competition_name && (
                    <Link to={`/competitions/${s.competition_id}`}>{s.competition_name}</Link>
                  )}
                </Space>

                <div
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    paddingTop: 8, borderTop: '1px solid #f0f0f0',
                  }}
                >
                  <Space size={4}>
                    <Avatar size={20} icon={<UserOutlined />} />
                    <Text style={{ fontSize: 12 }}>{s.username || `用户 #${s.user_id}`}</Text>
                  </Space>
                  <Button
                    type="text"
                    size="small"
                    icon={liked[s.id] ? <LikeFilled style={{ color: '#eb2f96' }} /> : <LikeOutlined />}
                    onClick={() => toggleLike(s)}
                  >
                    {s.like_count ?? 0}
                  </Button>
                </div>

                {s.project_url && (
                  <a href={s.project_url} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>
                    查看项目 →
                  </a>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title="展示我的作品"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        width={640}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={create}>
          <Form.Item name="title" label="作品标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="作品名称" maxLength={80} />
          </Form.Item>
          <Form.Item name="competition_id" label="所属竞赛" rules={[{ required: true, message: '请选择竞赛' }]}>
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="选择竞赛"
              options={competitions.map((c) => ({ label: c.name, value: c.id }))}
            />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="award_level" label="获奖等级" rules={[{ required: true, message: '请选择' }]}>
                <Select options={AWARD_LEVELS.map((l) => ({ label: l, value: l }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="award_year" label="获奖年份" rules={[{ required: true, message: '请输入年份' }]}>
                <InputNumber min={2000} max={2100} style={{ width: '100%' }} placeholder="2026" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="作品简介">
            <Input.TextArea rows={4} maxLength={500} showCount placeholder="介绍作品亮点、技术方案等" />
          </Form.Item>
          <Form.Item name="team_members" label="团队成员">
            <Input placeholder="用逗号分隔成员姓名" />
          </Form.Item>
          <Form.Item name="project_url" label="项目链接">
            <Input placeholder="https://..." />
          </Form.Item>
          <Text type="secondary" style={{ fontSize: 12 }}>
            提交后需管理员审核通过才会公开展示。
          </Text>
        </Form>
      </Modal>
    </div>
  )
}
