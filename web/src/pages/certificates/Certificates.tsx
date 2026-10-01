import { useCallback, useEffect, useState } from 'react'
import {
  Button, Card, Col, Empty, Input, List, Row, Select, Space, Tag, Typography, App,
} from 'antd'
import { CheckCircleOutlined, PlusOutlined, ReloadOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { certificateApi, certPlanApi } from '@/api/learning'
import { Loading, PageHeader } from '@/components/common'
import { useAuthStore } from '@/stores/auth'
import type { Certificate, CertPlan } from '@/types'

const { Text, Paragraph } = Typography

export default function Certificates() {
  const { message } = App.useApp()
  const token = useAuthStore((s) => s.token)

  const [list, setList] = useState<Certificate[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [plans, setPlans] = useState<CertPlan[]>([])
  const [category, setCategory] = useState<string | undefined>()
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res: any = await certificateApi.list({ category, keyword: keyword || undefined })
      setList(res?.certificates ?? [])
    } catch {
      setList([])
    } finally {
      setLoading(false)
    }
  }, [category, keyword])

  const loadPlans = () => {
    if (!token) return
    certPlanApi.my().then(setPlans).catch(() => setPlans([]))
  }

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    certificateApi.categories().then(setCategories).catch(() => {})
    loadPlans()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const plannedIds = new Set(plans.map((p) => p.certificate_id))

  const addPlan = async (cert: Certificate) => {
    if (!token) return message.warning('请先登录')
    setAdding(cert.id)
    try {
      await certPlanApi.create({ certificate_id: cert.id })
      message.success(`已把「${cert.name}」加入考取计划`)
      loadPlans()
    } catch {
      /* ignore */
    } finally {
      setAdding(null)
    }
  }

  const checkin = async (certificateId: number) => {
    try {
      await certPlanApi.checkin(certificateId, {})
      message.success('打卡成功')
      loadPlans()
    } catch {
      /* ignore */
    }
  }

  const removePlan = async (certificateId: number) => {
    try {
      await certPlanApi.remove(certificateId)
      message.success('已移出计划')
      loadPlans()
    } catch {
      /* ignore */
    }
  }

  return (
    <div>
      <PageHeader
        title="证书考取"
        description="浏览证书、制定考取计划、每日打卡"
        extra={
          <Button icon={<ReloadOutlined />} onClick={load}>
            刷新
          </Button>
        }
      />

      {token && plans.length > 0 && (
        <Card title={`我的考取计划 (${plans.length})`} size="small" style={{ marginBottom: 16 }}>
          <List
            size="small"
            dataSource={plans}
            renderItem={(p: any) => (
              <List.Item
                actions={[
                  <Button key="c" size="small" type="primary" onClick={() => checkin(p.certificate_id)}>
                    打卡
                  </Button>,
                  <Button key="r" size="small" danger type="text" onClick={() => removePlan(p.certificate_id)}>
                    移除
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space size={6}>
                      <SafetyCertificateOutlined />
                      {p.certificate_name || `证书 #${p.certificate_id}`}
                      <Tag color="blue">已打卡 {p.checkin_count ?? 0} 次</Tag>
                    </Space>
                  }
                  description={`目标日期：${p.target_date || '未设置'} · 状态：${p.status || '进行中'}`}
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      <div className="toolbar-row" style={{ marginBottom: 16 }}>
        <Select
          allowClear
          placeholder="选择类别"
          style={{ width: 160 }}
          value={category}
          onChange={setCategory}
          options={categories.map((c) => ({ label: c, value: c }))}
        />
        <Input.Search
          allowClear
          placeholder="搜索证书名称"
          style={{ width: 260 }}
          onSearch={setKeyword}
        />
      </div>

      {loading ? (
        <Loading />
      ) : list.length === 0 ? (
        <Card>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无证书信息" />
        </Card>
      ) : (
        <Row gutter={[12, 12]}>
          {list.map((c: any) => {
            const planned = plannedIds.has(c.id)
            return (
              <Col key={c.id} xs={24} sm={12} lg={8}>
                <Card size="small" title={<span className="text-ellipsis">{c.name}</span>}>
                  {c.category && (
                    <Tag color="blue" style={{ marginBottom: 8 }}>
                      {c.category}
                    </Tag>
                  )}
                  <Paragraph className="clamp-3" style={{ fontSize: 13, color: '#8c8c8c', minHeight: 60 }}>
                    {c.description || '暂无介绍'}
                  </Paragraph>
                  <div
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      paddingTop: 8, borderTop: '1px solid #f0f0f0', fontSize: 12, color: '#8c8c8c',
                    }}
                  >
                    <span>报名费：{c.exam_fee || '以官网为准'}</span>
                    {planned ? (
                      <Tag icon={<CheckCircleOutlined />} color="green">
                        已加入计划
                      </Tag>
                    ) : (
                      <Button
                        size="small"
                        type="primary"
                        icon={<PlusOutlined />}
                        loading={adding === c.id}
                        onClick={() => addPlan(c)}
                      >
                        加入计划
                      </Button>
                    )}
                  </div>
                  {c.official_website && (
                    <a href={c.official_website} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>
                      访问官网 →
                    </a>
                  )}
                </Card>
              </Col>
            )
          })}
        </Row>
      )}
    </div>
  )
}
