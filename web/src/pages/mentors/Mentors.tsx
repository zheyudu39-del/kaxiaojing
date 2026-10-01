import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Avatar, Button, Card, Col, Empty, Form, Input, List, Modal, Rate, Row, Select, Space, Tag,
  Typography, App,
} from 'antd'
import { PlusOutlined, ReloadOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons'
import { mentorApi } from '@/api/community'
import { competitionApi } from '@/api/competitions'
import { Loading, PageHeader } from '@/components/common'
import { useAuthStore } from '@/stores/auth'
import type { Mentor, Competition } from '@/types'

const { Text, Paragraph } = Typography

export default function Mentors() {
  const { message } = App.useApp()
  const token = useAuthStore((s) => s.token)

  const [list, setList] = useState<Mentor[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [competitionId, setCompetitionId] = useState<number | undefined>()
  const [loading, setLoading] = useState(true)
  const [applyOpen, setApplyOpen] = useState(false)
  const [requestTarget, setRequestTarget] = useState<Mentor | null>(null)
  const [detail, setDetail] = useState<{ mentor: Mentor; reviews: any[] } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [applyForm] = Form.useForm()
  const [reqForm] = Form.useForm()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res: any = await mentorApi.list({ pageSize: 24, competition_id: competitionId })
      setList(res?.mentors ?? [])
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

  const openDetail = async (m: Mentor) => {
    try {
      const res = await mentorApi.detail(m.id)
      setDetail(res)
    } catch {
      setDetail({ mentor: m, reviews: [] })
    }
  }

  const applyMentor = async (values: any) => {
    setSubmitting(true)
    try {
      await mentorApi.apply(values)
      message.success('导师申请已提交，等待审核')
      setApplyOpen(false)
      applyForm.resetFields()
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false)
    }
  }

  const requestMentor = async (values: any) => {
    if (!requestTarget) return
    setSubmitting(true)
    try {
      await mentorApi.requestMentor(requestTarget.id, values)
      message.success('指导申请已提交')
      setRequestTarget(null)
      reqForm.resetFields()
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false)
    }
  }

  const parseSkills = (s?: string): string[] => {
    if (!s) return []
    try {
      const a = JSON.parse(s)
      return Array.isArray(a) ? a : []
    } catch {
      return String(s).split(/[,，]/).filter(Boolean)
    }
  }

  return (
    <div>
      <PageHeader
        title="导师指导"
        description="找一位有经验的学长学姐带你备赛"
        extra={
          <Space size={8}>
            <Button icon={<ReloadOutlined />} onClick={load}>
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => (token ? setApplyOpen(true) : message.warning('请先登录'))}
            >
              申请成为导师
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
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无导师信息" />
        </Card>
      ) : (
        <Row gutter={[12, 12]}>
          {list.map((m: any) => {
            const skills = parseSkills(m.skills)
            return (
              <Col key={m.id} xs={24} sm={12} lg={8}>
                <Card size="small" hoverable onClick={() => openDetail(m)}>
                  <Space align="start" style={{ width: '100%' }}>
                    <Avatar size={48} src={m.avatar_url || undefined} icon={<UserOutlined />} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Text strong>{m.username || `用户 #${m.user_id}`}</Text>
                        {m.is_active === 1 ? <Tag color="green">可指导</Tag> : <Tag>暂满</Tag>}
                      </div>
                      {typeof m.rating === 'number' && m.rating > 0 && (
                        <Rate disabled value={m.rating} style={{ fontSize: 12 }} allowHalf />
                      )}
                      <Paragraph className="clamp-2" style={{ fontSize: 12, color: '#8c8c8c', margin: '6px 0' }}>
                        {m.introduction}
                      </Paragraph>
                      {skills.length > 0 && (
                        <Space wrap size={4}>
                          {skills.slice(0, 4).map((s: string) => (
                            <Tag key={s} color="geekblue" style={{ margin: 0, fontSize: 11 }}>
                              {s}
                            </Tag>
                          ))}
                        </Space>
                      )}
                    </div>
                  </Space>

                  <div
                    style={{
                      marginTop: 10, paddingTop: 8, borderTop: '1px solid #f0f0f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      fontSize: 12, color: '#8c8c8c',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>
                      <TeamOutlined /> 学员 {m.mentee_count ?? 0} / {m.max_mentees ?? 5}
                    </span>
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => (token ? setRequestTarget(m) : message.warning('请先登录'))}
                    >
                      申请指导
                    </Button>
                  </div>
                </Card>
              </Col>
            )
          })}
        </Row>
      )}

      <Modal
        title={detail?.mentor?.username ? `${detail.mentor.username} 的导师主页` : '导师主页'}
        open={!!detail}
        onCancel={() => setDetail(null)}
        footer={null}
        width={640}
      >
        {detail && (
          <>
            <Space align="start" style={{ marginBottom: 16 }}>
              <Avatar size={56} icon={<UserOutlined />} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>{detail.mentor.username}</div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  可指导时间：{detail.mentor.available_time || '面议'}
                </Text>
              </div>
            </Space>

            <Text strong>导师简介</Text>
            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{detail.mentor.introduction || '-'}</Paragraph>

            <Text strong>主要成绩</Text>
            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{detail.mentor.achievements || '-'}</Paragraph>

            <Text strong>学员评价（{detail.reviews?.length ?? 0}）</Text>
            {!detail.reviews?.length ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无评价" />
            ) : (
              <List
                size="small"
                dataSource={detail.reviews}
                renderItem={(r: any) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text style={{ fontSize: 13 }}>{r.username || '匿名'}</Text>
                          <Rate disabled value={r.rating} style={{ fontSize: 12 }} />
                        </Space>
                      }
                      description={r.content || '（未填写评价）'}
                    />
                  </List.Item>
                )}
              />
            )}
          </>
        )}
      </Modal>

      <Modal
        title="申请成为导师"
        open={applyOpen}
        onCancel={() => setApplyOpen(false)}
        onOk={() => applyForm.submit()}
        confirmLoading={submitting}
        destroyOnHidden
      >
        <Form form={applyForm} layout="vertical" onFinish={applyMentor}>
          <Form.Item name="introduction" label="个人简介" rules={[{ required: true, message: '请输入简介' }]}>
            <Input.TextArea rows={3} maxLength={500} showCount placeholder="你的竞赛经历、擅长方向" />
          </Form.Item>
          <Form.Item name="achievements" label="主要成绩" rules={[{ required: true, message: '请输入成绩' }]}>
            <Input.TextArea rows={3} maxLength={500} showCount placeholder="获奖情况、项目经验" />
          </Form.Item>
          <Form.Item name="skills" label="擅长技能">
            <Input placeholder="用逗号分隔，如：数学建模,Python" />
          </Form.Item>
          <Text type="secondary" style={{ fontSize: 12 }}>
            提交后需管理员审核。
          </Text>
        </Form>
      </Modal>

      <Modal
        title={`申请「${requestTarget?.username ?? ''}」指导`}
        open={!!requestTarget}
        onCancel={() => setRequestTarget(null)}
        onOk={() => reqForm.submit()}
        confirmLoading={submitting}
        destroyOnHidden
      >
        <Form form={reqForm} layout="vertical" onFinish={requestMentor}>
          <Form.Item name="message" label="申请说明">
            <Input.TextArea rows={4} maxLength={300} showCount placeholder="说明你的目标竞赛和希望获得的帮助" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
