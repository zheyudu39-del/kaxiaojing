import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button, Calendar, Card, Empty, List, Select, Space, Tag, Typography } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { competitionApi } from '@/api/competitions'
import { Loading, PageHeader } from '@/components/common'
import type { Competition } from '@/types'

const { Text } = Typography

export default function CalendarPage() {
  const [list, setList] = useState<Competition[]>([])
  const [month, setMonth] = useState<Dayjs>(dayjs())
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Competition[]>([])

  useEffect(() => {
    setLoading(true)
    competitionApi
      .list({ pageSize: 300 })
      .then((r) => setList(r?.competitions ?? []))
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }, [])

  // 按「报名开始月」归集到当月
  const byMonth = (m: number) => list.filter((c) => c.reg_start_month === m)

  const currentMonth = month.month() + 1
  const monthList = byMonth(currentMonth)

  if (loading) return <Loading />

  const cellRender = (date: Dayjs) => {
    const m = date.month() + 1
    const items = byMonth(m).slice(0, 2)
    if (items.length === 0) return null
    return (
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {items.map((c) => (
          <li key={c.id} style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <Badge status="processing" text={c.name} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div>
      <PageHeader
        title="竞赛日历"
        description="按月份查看竞赛报名时间"
        extra={
          <Select
            style={{ width: 160 }}
            value={currentMonth}
            onChange={(m) => {
              setMonth(dayjs().month(m - 1))
              setSelected(byMonth(m))
            }}
            options={Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1} 月`, value: i + 1 }))}
          />
        }
      />

      <Card style={{ marginBottom: 16 }}>
        <Calendar
          value={month}
          onSelect={(d) => {
            setMonth(d)
            setSelected(byMonth(d.month() + 1))
          }}
          onPanelChange={(d) => setMonth(d)}
          cellRender={cellRender}
        />
      </Card>

      <Card title={`${currentMonth} 月开放报名的竞赛（${monthList.length}）`}>
        {monthList.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="该月暂无竞赛开放报名" />
        ) : (
          <List
            dataSource={selected.length > 0 ? selected : monthList}
            renderItem={(c) => (
              <List.Item
                actions={[
                  <Link key="d" to={`/competitions/${c.id}`}>
                    <Button type="link" size="small">
                      查看详情
                    </Button>
                  </Link>,
                ]}
              >
                <List.Item.Meta
                  title={<Link to={`/competitions/${c.id}`}>{c.name}</Link>}
                  description={
                    <Space size={8}>
                      {c.category && <Tag color="blue">{c.category}</Tag>}
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        报名 {c.reg_start_month} 月 - {c.reg_end_month ?? '?'} 月
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  )
}
