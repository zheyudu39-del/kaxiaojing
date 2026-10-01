import { useCallback, useEffect, useState } from 'react'
import {
  Button, Card, Col, Empty, Form, Input, InputNumber, List, Modal, Progress, Row, Statistic,
  Typography, App,
} from 'antd'
import { CheckOutlined, PlusOutlined } from '@ant-design/icons'
import { studyCheckinApi } from '@/api/learning'
import { Loading, PageHeader } from '@/components/common'
import type { StudyPlan } from '@/types'

const { Text } = Typography

export default function StudyCheckin() {
  const { message } = App.useApp()

  const [plans, setPlans] = useState<StudyPlan[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [checkinTarget, setCheckinTarget] = useState<StudyPlan | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()
  const [checkinForm] = Form.useForm()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [p, s] = await Promise.allSettled([studyCheckinApi.plans(), studyCheckinApi.stats()])
      if (p.status === 'fulfilled') setPlans(p.value)
      if (s.status === 'fulfilled') setStats(s.value ?? {})
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const create = async (values: any) => {
    setSubmitting(true)
    try {
      await studyCheckinApi.createPlan(values)
      message.success('学习计划已创建')
      setOpen(false)
      form.resetFields()
      load()
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false)
    }
  }

  const doCheckin = async (values: any) => {
    if (!checkinTarget) return
    setSubmitting(true)
    try {
      await studyCheckinApi.checkin(checkinTarget.id, values)
      message.success('打卡成功，坚持就是胜利')
      setCheckinTarget(null)
      checkinForm.resetFields()
      load()
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div>
      <PageHeader
        title="学习打卡"
        description="制定计划，每天进步一点"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
            新建学习计划
          </Button>
        }
      />

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        {[
          { title: '进行中计划', value: stats?.active_plans ?? plans.filter((p) => p.status === 'active').length },
          { title: '累计打卡', value: stats?.total_checkins ?? 0 },
          { title: '连续天数', value: stats?.streak ?? 0 },
          { title: '本月打卡', value: stats?.month_checkins ?? 0 },
        ].map((s) => (
          <Col key={s.title} xs={12} md={6}>
            <Card size="small">
              <Statistic title={s.title} value={s.value} />
            </Card>
          </Col>
        ))}
      </Row>

      {plans.length === 0 ? (
        <Card>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="还没有学习计划">
            <Button type="primary" onClick={() => setOpen(true)}>
              创建第一个计划
            </Button>
          </Empty>
        </Card>
      ) : (
        <Row gutter={[12, 12]}>
          {plans.map((p: any) => (
            <Col key={p.id} xs={24} md={12}>
              <Card
                size="small"
                title={<span className="text-ellipsis">{p.title}</span>}
                extra={<Text type="secondary" style={{ fontSize: 12 }}>{p.status === 'active' ? '进行中' : p.status}</Text>}
              >
                <div className="clamp-2" style={{ fontSize: 12, color: '#8c8c8c', minHeight: 36 }}>
                  {p.description || p.daily_goal || '暂无描述'}
                </div>
                <div style={{ fontSize: 12, color: '#8c8c8c', margin: '8px 0' }}>
                  {p.start_date} ~ {p.end_date}
                </div>
                <Progress
                  percent={Math.min(100, Math.round(((p.checkin_count ?? 0) / 30) * 100))}
                  size="small"
                  format={() => `已打卡 ${p.checkin_count ?? 0} 次`}
                />
                <div style={{ marginTop: 10, textAlign: 'right' }}>
                  <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => setCheckinTarget(p)}>
                    今日打卡
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title="新建学习计划"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={create}>
          <Form.Item name="title" label="计划名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="如：30 天攻克数学建模" maxLength={50} />
          </Form.Item>
          <Form.Item name="daily_goal" label="每日目标">
            <Input placeholder="如：每天刷 2 道算法题" maxLength={80} />
          </Form.Item>
          <Form.Item name="start_date" label="开始日期" rules={[{ required: true, message: '请填写开始日期' }]}>
            <Input placeholder="2026-06-01" />
          </Form.Item>
          <Form.Item name="end_date" label="结束日期" rules={[{ required: true, message: '请填写结束日期' }]}>
            <Input placeholder="2026-06-30" />
          </Form.Item>
          <Form.Item name="description" label="计划说明">
            <Input.TextArea rows={3} maxLength={300} showCount />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`打卡：${checkinTarget?.title ?? ''}`}
        open={!!checkinTarget}
        onCancel={() => setCheckinTarget(null)}
        onOk={() => checkinForm.submit()}
        confirmLoading={submitting}
        destroyOnHidden
      >
        <Form form={checkinForm} layout="vertical" onFinish={doCheckin}>
          <Form.Item name="content" label="今日收获">
            <Input.TextArea rows={3} maxLength={200} showCount placeholder="今天学了什么" />
          </Form.Item>
          <Form.Item name="duration" label="学习时长（分钟）" initialValue={60}>
            <InputNumber min={1} max={1440} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
