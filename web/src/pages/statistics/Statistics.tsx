import { useEffect, useState } from 'react'
import { Card, Col, Row, Statistic, Tabs } from 'antd'
import { statisticsApi } from '@/api/stats'
import Chart from '@/components/Chart'
import { PageHeader } from '@/components/common'

export default function Statistics() {
  const [overview, setOverview] = useState<any>({})
  const [college, setCollege] = useState<any[]>([])
  const [category, setCategory] = useState<any[]>([])
  const [trend, setTrend] = useState<any[]>([])
  const [popularity, setPopularity] = useState<any[]>([])

  useEffect(() => {
    statisticsApi.overview().then(setOverview).catch(() => {})
    statisticsApi.collegeParticipation().then((d) => setCollege(Array.isArray(d) ? d : [])).catch(() => {})
    statisticsApi.participantsByCategory().then((d) => setCategory(Array.isArray(d) ? d : [])).catch(() => {})
    statisticsApi.registrationTrend().then((d) => setTrend(Array.isArray(d) ? d : [])).catch(() => {})
    statisticsApi.competitionPopularity({ limit: 15 }).then((d) => setPopularity(Array.isArray(d) ? d : [])).catch(() => {})
  }, [])

  // 后端各接口的字段名不统一（category/name/college/label），这里自动识别
  const nameOf = (d: any) => d.category ?? d.name ?? d.college ?? d.label ?? d.month ?? d.date ?? '-'
  const valueOf = (d: any) => d.count ?? d.value ?? d.total ?? d.number ?? 0

  const bar = (data: any[]) => ({
    grid: { left: 8, right: 16, top: 24, bottom: 8, containLabel: true },
    xAxis: { type: 'category' as const, data: data.map(nameOf), axisLabel: { interval: 0, rotate: 30, fontSize: 11 } },
    yAxis: { type: 'value' as const },
    tooltip: { trigger: 'axis' as const },
    series: [{ type: 'bar' as const, data: data.map(valueOf), itemStyle: { color: '#1890ff' } }],
  })

  const pie = (data: any[]) => ({
    tooltip: { trigger: 'item' as const },
    legend: { bottom: 0, type: 'scroll' as const },
    series: [{ type: 'pie' as const, radius: ['40%', '65%'], data: data.map((d) => ({ name: nameOf(d), value: valueOf(d) })) }],
  })

  const line = (data: any[]) => ({
    grid: { left: 8, right: 16, top: 24, bottom: 8, containLabel: true },
    xAxis: { type: 'category' as const, data: data.map(nameOf) },
    yAxis: { type: 'value' as const },
    tooltip: { trigger: 'axis' as const },
    series: [{ type: 'line' as const, smooth: true, data: data.map(valueOf), areaStyle: {} }],
  })

  return (
    <div>
      <PageHeader title="数据统计" description="平台竞赛与参与情况总览" />

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        {[
          { title: '竞赛总数', value: overview?.competition_count ?? 0 },
          { title: '注册用户', value: overview?.user_count ?? 0 },
          { title: '队伍总数', value: overview?.team_count ?? 0 },
          { title: '获奖记录', value: overview?.award_count ?? 0 },
        ].map((s) => (
          <Col key={s.title} xs={12} md={6}>
            <Card size="small">
              <Statistic title={s.title} value={s.value} />
            </Card>
          </Col>
        ))}
      </Row>

      <Tabs
        items={[
          {
            key: 'college',
            label: '学院参赛统计',
            children: (
              <Card>
                <Chart option={bar(college)} height={340} empty={college.length === 0} />
              </Card>
            ),
          },
          {
            key: 'category',
            label: '各类别参赛人数',
            children: (
              <Card>
                <Chart option={pie(category)} height={340} empty={category.length === 0} />
              </Card>
            ),
          },
          {
            key: 'trend',
            label: '报名趋势',
            children: (
              <Card>
                <Chart option={line(trend)} height={340} empty={trend.length === 0} />
              </Card>
            ),
          },
          {
            key: 'hot',
            label: '竞赛热度 TOP15',
            children: (
              <Card>
                <Chart option={bar(popularity)} height={420} empty={popularity.length === 0} />
              </Card>
            ),
          },
        ]}
      />
    </div>
  )
}
