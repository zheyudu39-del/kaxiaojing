import { useEffect, useState } from 'react'
import { Button, Card, Empty, Select, Space, Table, Tag } from 'antd'
import { competitionApi } from '@/api/competitions'
import { PageHeader } from '@/components/common'
import type { Competition } from '@/types'

export default function Compare() {
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
          <Space>
            <Select
              mode="multiple"
              allowClear
              style={{ minWidth: 320 }}
              placeholder="选择要对比的竞赛"
              maxCount={4}
              value={ids}
              onChange={setIds}
              optionFilterProp="label"
              showSearch
              options={options.map((c) => ({ label: c.name, value: c.id }))}
            />
            <Button type="primary" disabled={ids.length < 2} loading={loading} onClick={run}>
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
            columns={[
              { title: '对比项', dataIndex: 'label', width: 140 },
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
