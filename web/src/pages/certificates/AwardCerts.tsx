import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Col, Empty, Row, Space, Statistic, Table, Tag, Typography, App } from 'antd'
import { DownloadOutlined, PlusOutlined, ReloadOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { awardCertApi } from '@/api/learning'
import { Loading, PageHeader } from '@/components/common'

const { Text } = Typography

export default function AwardCerts() {
  const { message } = App.useApp()

  const [certs, setCerts] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [c, s] = await Promise.allSettled([awardCertApi.list(), awardCertApi.stats()])
      if (c.status === 'fulfilled') setCerts(Array.isArray(c.value) ? c.value : ((c.value as any)?.certs ?? []))
      if (s.status === 'fulfilled') setStats(s.value ?? {})
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const autoGenerate = async () => {
    setGenerating(true)
    try {
      const res: any = await awardCertApi.autoGenerate()
      const n = res?.generated_count ?? res?.certificates?.length ?? 0
      message.success(n > 0 ? `已生成 ${n} 张证书` : '暂无可生成的证书（需先有已通过的获奖记录）')
      load()
    } catch {
      /* ignore */
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="获奖证书"
        description="根据已通过的获奖记录生成证书"
        extra={
          <Space size={8}>
            <Button icon={<ReloadOutlined />} onClick={load}>
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />} loading={generating} onClick={autoGenerate}>
              自动生成证书
            </Button>
          </Space>
        }
      />

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        {[
          { title: '证书总数', value: stats?.total ?? certs.length },
          { title: '今年获得', value: stats?.this_year ?? 0 },
          { title: '国家级', value: stats?.national_count ?? 0 },
          { title: '省级', value: stats?.provincial_count ?? 0 },
        ].map((s) => (
          <Col key={s.title} xs={12} md={6}>
            <Card size="small">
              <Statistic title={s.title} value={s.value} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card>
        {loading ? (
          <Loading />
        ) : certs.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="还没有证书">
            <Button type="primary" loading={generating} onClick={autoGenerate}>
              自动生成证书
            </Button>
          </Empty>
        ) : (
          <Table
            rowKey="id"
            size="small"
            dataSource={certs}
            pagination={{ pageSize: 20 }}
            columns={[
              {
                title: '证书名称',
                dataIndex: 'title',
                render: (t: string, r: any) => (
                  <Space>
                    <SafetyCertificateOutlined style={{ color: '#faad14' }} />
                    {t || r.cert_name || `证书 #${r.id}`}
                  </Space>
                ),
              },
              { title: '竞赛', dataIndex: 'competition_name', ellipsis: true, render: (v: string) => v || '-' },
              {
                title: '奖项',
                dataIndex: 'award_level',
                width: 140,
                render: (v: string) => (v ? <Tag color="gold">{v}</Tag> : '-'),
              },
              { title: '证书编号', dataIndex: 'cert_number', width: 200, render: (v: string) => (v ? <Text code>{v}</Text> : '-') },
              { title: '颁发日期', dataIndex: 'issue_date', width: 120, render: (v: string) => v || '-' },
              {
                title: '操作',
                width: 100,
                render: (_: any, r: any) => (
                  <a href={awardCertApi.renderUrl(r.id)} target="_blank" rel="noreferrer">
                    <Button type="link" size="small" icon={<DownloadOutlined />}>
                      查看
                    </Button>
                  </a>
                ),
              },
            ]}
            scroll={{ x: 900 }}
          />
        )}
      </Card>
    </div>
  )
}
