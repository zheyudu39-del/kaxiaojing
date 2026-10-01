import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Button, Card, Col, Empty, Form, Input, InputNumber, List, Modal, Row, Select, Space, Tag,
  Typography, App,
} from 'antd'
import { PlusOutlined, ReloadOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons'
import { recruitmentApi } from '@/api/learning'
import { competitionApi } from '@/api/competitions'
import { Loading, PageHeader } from '@/components/common'
import { useAuthStore } from '@/stores/auth'
import type { Recruitment as RecruitmentType, Competition } from '@/types'

const { Text, Paragraph } = Typography

export default function Recruitment() {
  const { message } = App.useApp()
  const token = useAuthStore((s) => s.token)
  const me = useAuthStore((s) => s.user)

  const [list, setList] = useState<RecruitmentType[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [competitionId, setCompetitionId] = useState<number | undefined>()
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [applyTarget, setApplyTarget] = useState<RecruitmentType | null>(null)
  const [form] = Form.useForm()
  const [applyForm] = Form.useForm()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res: any = await recruitmentApi.list({ page, pageSize: 10, competition_id: competitionId })
      // 后端返回的键名是 posts
      setList(res?.posts ?? res?.recruitments ?? [])
      setTotal(res?.total ?? 0)
    } catch {
      setList([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, competitionId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    competitionApi.list({ pageSize: 200 }).then((r) => setCompetitions(r?.competitions ?? [])).catch(() => {})
  }, [])

  const create = async (values: any) => {
    setSubmitting(true)
    try {
      await recruitmentApi.create({
        title: values.title,
        description: values.description,
        competition_id: values.competition_id ? Number(values.competition_id) : undefined,
        skills_needed: values.skills_needed,
        members_needed: values.members_needed,
      } as any)
      message.success('招募已发布')
      setOpen(false)
      form.resetFields()
      load()
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false)
    }
  }

  const apply = async (values: { message?: string }) => {
    if (!applyTarget) return
    setSubmitting(true)
    try {
      await recruitmentApi.apply(applyTarget.id, { message: values.message })
      message.success('申请已提交，请等待发布者回复')
      setApplyTarget(null)
      applyForm.resetFields()
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false)
    }
  }

  const close = async (r: RecruitmentType) => {
    try {
      await recruitmentApi.close(r.id)
      message.success('已关闭招募')
      load()
    } catch {
      /* ignore */
    }
  }

  const parseSkills = (s?: string): string[] => {
    if (!s) return []
    if (Array.isArray(s)) return s as any
    try {
      const arr = JSON.parse(s)
      return Array.isArray(arr) ? arr : String(s).split(/[,，]/).filter(Boolean)
    } catch {
      return String(s).split(/[,，]/).filter(Boolean)
    }
  }

  return (
    <div>
      <PageHeader
        title="招募广场"
        description={`共 ${total} 条招募`}
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
              发布招募
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
          onChange={(v) => {
            setCompetitionId(v)
            setPage(1)
          }}
          options={competitions.map((c) => ({ label: c.name, value: c.id }))}
        />
      </div>

      {loading ? (
        <Loading />
      ) : list.length === 0 ? (
        <Card>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无招募信息">
            <Button type="primary" onClick={() => (token ? setOpen(true) : message.warning('请先登录'))}>
              发布第一条招募
            </Button>
          </Empty>
        </Card>
      ) : (
        <>
          <Row gutter={[12, 12]}>
            {list.map((r: any) => {
              const skills = parseSkills(r.skills ?? r.skills_needed)
              const isMine = me && r.user_id === me.id
              return (
                <Col key={r.id} xs={24} md={12}>
                  <Card
                    size="small"
                    title={<span className="text-ellipsis">{r.title}</span>}
                    extra={
                      r.status === 'closed' ? (
                        <Tag>已关闭</Tag>
                      ) : isMine ? (
                        <Button size="small" type="link" onClick={() => close(r)}>
                          关闭
                        </Button>
                      ) : (
                        <Tag color="green">招募中</Tag>
                      )
                    }
                  >
                    {r.competition_name && (
                      <div style={{ fontSize: 12, marginBottom: 6 }}>
                        <Link to={`/competitions/${r.competition_id}`}>{r.competition_name}</Link>
                      </div>
                    )}

                    <Paragraph className="clamp-3" style={{ fontSize: 13, color: '#595959', minHeight: 60 }}>
                      {r.description || '暂无描述'}
                    </Paragraph>

                    {skills.length > 0 && (
                      <Space wrap size={4} style={{ marginBottom: 8 }}>
                        {skills.slice(0, 6).map((s: string) => (
                          <Tag key={s} color="geekblue" style={{ margin: 0 }}>
                            {s}
                          </Tag>
                        ))}
                      </Space>
                    )}

                    <div
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        paddingTop: 8, borderTop: '1px solid #f0f0f0', fontSize: 12, color: '#8c8c8c',
                      }}
                    >
                      <Space size={10}>
                        <span>
                          <UserOutlined /> {r.username || `用户 #${r.user_id}`}
                        </span>
                        {r.members_needed && (
                          <span>
                            <TeamOutlined /> 缺 {r.members_needed} 人
                          </span>
                        )}
                      </Space>
                      {!isMine && r.status !== 'closed' && (
                        <Button
                          size="small"
                          type="primary"
                          onClick={() => (token ? setApplyTarget(r) : message.warning('请先登录'))}
                        >
                          申请加入
                        </Button>
                      )}
                    </div>
                  </Card>
                </Col>
              )
            })}
          </Row>

          {total > 10 && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
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
        </>
      )}

      <Modal
        title="发布招募"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={create}>
          <Form.Item name="title" label="招募标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="如：数学建模国赛找队友，缺一名编程手" maxLength={60} />
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
          <Form.Item name="skills_needed" label="需要的技能">
            <Input placeholder="用逗号分隔，如：Python,论文写作" />
          </Form.Item>
          <Form.Item name="members_needed" label="还缺几人" initialValue={1}>
            <InputNumber min={1} max={20} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="详细说明">
            <Input.TextArea rows={4} maxLength={500} showCount placeholder="介绍项目方向、分工、时间安排等" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`申请加入「${applyTarget?.title ?? ''}」`}
        open={!!applyTarget}
        onCancel={() => setApplyTarget(null)}
        onOk={() => applyForm.submit()}
        confirmLoading={submitting}
        destroyOnHidden
      >
        <Form form={applyForm} layout="vertical" onFinish={apply}>
          <Form.Item name="message" label="申请留言">
            <Input.TextArea
              rows={4}
              maxLength={300}
              showCount
              placeholder="介绍一下你的技能和相关经历，让对方更快了解你"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
