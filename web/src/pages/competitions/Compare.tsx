import { useEffect, useState } from 'react'
import { Button, Card, Empty, Select, Space, Table, Tag } from 'antd'
import { competitionApi } from '@/api/competitions'
import { PageHeader } from '@/components/common'
import { useIsMobile } from '@/hooks/useMediaQuery'
import type { Competition } from '@/types'

export default function Compare() {
  const isMobile = useIsMobile()
  const [options, setOptions] = useState<Competition[]>([])
  const [ids, setIds] = useState<number[]>([])
  const [data, setData] = useState<Competition[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    competitionApi
      .list({ pageSize: 200 })
      .then((r) => setOptions(r?.competitions ?? []))
      .catch(() => {})
  }, [])

  const run = async () => {
    if (ids.length < 2) return
    setLoading(true)
    try {
      const res = await competitionApi.compare(ids)
      setData(Array.isArray(res) ? res : [])
    } finally {
      setLoading(false)
    }
  }

  const rows: { label: string; key: keyof Competition }[] = [
    { label: '类别', key: 'category' },
    { label: '形式', key: 'format' },
    { label: '报名费', key: 'fee' },
    { label: '报名开始月', key: 'reg_start_month' },
    { label: '报名结束月', key: 'reg_end_month' },
    { label: '面向对象', key: 'target_audience' },
    { label: '官网', key: 'official_website' },
  ]

  return (
    <div>
      <PageHeader
        title="竞赛对比"
        description="最多选择 4 项竞赛并排对比关键信息"
        extra={
          /* 移动端（≤991px）改为纵向铺满：固定 minWidth:320 会让「开始对比」被挤出屏幕 */
          <Space direction={isMobile ? 'vertical' : 'horizontal'} style={{ width: isMobile ? '100%' : undefined }}>
            <Select
              mode="multiple"
              allowClear
              style={isMobile ? { width: '100%' } : { minWidth: 320 }}
              placeholder="选择要对比的竞赛"
              maxCount={4}
              value={ids}
              onChange={setIds}
              optionFilterProp="label"
              showSearch
              options={options.map((c) => ({ label: c.name, value: c.id }))}
            />
            <Button
              type="primary"
              disabled={ids.length < 2}
              loading={loading}
              onClick={run}
              block={isMobile}
            >
              开始对比
            </Button>
          </Space>
        }
      />

      {data.length === 0 ? (
        <Card>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="请选择至少 2 项竞赛后点击「开始对比」" />
        </Card>
      ) : (
        <Card>
          <Table
            rowKey="label"
            pagination={false}
            size="small"
            /* 移动端多列对比必然超宽，交给表格自身横向滚动，避免撑破页面 */
            scroll={{ x: 'max-content' }}
            columns={[
              { title: '对比项', dataIndex: 'label', width: 140, fixed: isMobile ? undefined : ('left' as const) },
              ...data.map((c) => ({
                title: c.name,
                dataIndex: String(c.id),
                render: (_: any, row: any) => {
                  const v = row[String(c.id)]
                  return row.key === 'official_website' && v ? (
                    <a href={v} target="_blank" rel="noreferrer">
                      <Tag color="blue">访问官网</Tag>
                    </a>
                  ) : (
                    (v ?? '-')
                  )
                },
              })),
            ]}
            dataSource={rows.map((r) => {
              const row: any = { label: r.label, key: r.key }
              data.forEach((c) => {
                row[String(c.id)] = r.key === 'format' ? (c.format === 'team' ? '团队赛' : '个人赛') : c[r.key]
              })
              return row
            })}
          />
        </Card>
      )}
    </div>
  )
}
