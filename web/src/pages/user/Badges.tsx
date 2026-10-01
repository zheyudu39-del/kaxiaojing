import { useEffect, useState } from 'react'
import { Button, Card, Col, Empty, Progress, Row, Space, Tag, Tooltip, Typography, App } from 'antd'
import { LockOutlined, ReloadOutlined, StarFilled } from '@ant-design/icons'
import { badgeApi } from '@/api/learning'
import { Loading, PageHeader } from '@/components/common'

const { Text } = Typography

export default function Badges() {
  const { message } = App.useApp()
  const [earned, setEarned] = useState<any[]>([])
  const [locked, setLocked] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res: any = await badgeApi.myAll()
      setEarned(res?.earned ?? [])
      setLocked(res?.locked ?? [])
    } catch {
      setEarned([])
      setLocked([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const check = async () => {
    try {
      const res: any = await badgeApi.check()
      const newOnes = Array.isArray(res) ? res : (res?.new_badges ?? [])
      if (newOnes.length > 0) {
        message.success(`恭喜解锁 ${newOnes.length} 枚新徽章！`)
        load()
      } else {
        message.info('暂时没有新徽章，继续加油')
      }
    } catch {
      /* ignore */
    }
  }

  if (loading) return <Loading />

  const total = earned.length + locked.length
  const percent = total ? Math.round((earned.length / total) * 100) : 0

  return (
    <div>
      <PageHeader
        title="成就徽章"
        description={`已解锁 ${earned.length} / ${total} 枚`}
        extra={
          <Space size={8}>
            <Button icon={<ReloadOutlined />} onClick={load}>
              刷新
            </Button>
            <Button type="primary" onClick={check}>
              检查新徽章
            </Button>
          </Space>
        }
      />

      <Card size="small" style={{ marginBottom: 16 }}>
        <Progress percent={percent} status="active" />
      </Card>

      <Card title={`已解锁 (${earned.length})`} size="small" style={{ marginBottom: 16 }}>
        {earned.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="还没有解锁任何徽章" />
        ) : (
          <Row gutter={[12, 12]}>
            {earned.map((b: any) => (
              <Col key={b.id} xs={12} sm={8} md={6} lg={4}>
                <Tooltip title={b.condition}>
                  <div
                    style={{
                      textAlign: 'center', padding: 12, borderRadius: 8,
                      background: 'linear-gradient(135deg,#fff7e6 0%,#fffbe6 100%)',
                      border: '1px solid #ffe58f',
                    }}
                  >
                    <div style={{ fontSize: 32 }}>{b.icon || <StarFilled style={{ color: '#faad14' }} />}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, marginTop: 6 }}>{b.name}</div>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {b.description}
                    </Text>
                  </div>
                </Tooltip>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      <Card title={`未解锁 (${locked.length})`} size="small">
        {locked.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="全部徽章已解锁，太强了" />
        ) : (
          <Row gutter={[12, 12]}>
            {locked.map((b: any) => (
              <Col key={b.id} xs={12} sm={8} md={6} lg={4}>
                <Tooltip title={b.condition}>
                  <div
                    style={{
                      textAlign: 'center', padding: 12, borderRadius: 8,
                      background: '#fafafa', border: '1px dashed #d9d9d9', opacity: 0.7,
                    }}
                  >
                    <div style={{ fontSize: 32, color: '#bfbfbf' }}>
                      <LockOutlined />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, marginTop: 6, color: '#8c8c8c' }}>{b.name}</div>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {b.description}
                    </Text>
                  </div>
                </Tooltip>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {locked.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <Tag color="blue">提示</Tag>
            鼠标悬停徽章可查看解锁条件
          </Text>
        </div>
      )}
    </div>
  )
}
