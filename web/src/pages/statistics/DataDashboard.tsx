import { useEffect, useState } from 'react'
import { Card, Col, Row, Statistic, Tabs } from 'antd'
import { dataDashboardApi } from '@/api/stats'
import Chart from '@/components/Chart'
import { PageHeader } from '@/components/common'

export default function DataDashboard() {
  const [overview, setOverview] = useState<any>({})
  const [byCategory, setByCategory] = useState<any[]>([])
  const [byCollege, setByCollege] = useState<any[]>([])
  const [trend, setTrend] = useState<any[]>([])
  const [userGrowth, setUserGrowth] = useState<any[]>([])
  const [hot, setHot] = useState<any[]>([])
  const [awards, setAwards] = useState<any[]>([])

  useEffect(() => {
    const pick = (p: Promise<any>, set: (v: any) => void) =>
      p.then((d) => set(Array.isArray(d) ? d : [])).catch(() => set([]))

    dataDashboardApi.overview().then((d) => setOverview(d ?? {})).catch(() => {})
    pick(dataDashboardApi.competitionsByCategory(), setByCategory)
    pick(dataDashboardApi.participantsByCollege(), setByCollege)
    pick(dataDashboardApi.registrationTrend(), setTrend)
    pick(dataDashboardApi.userGrowth(), setUserGrowth)
    pick(dataDashboardApi.hotCompetitions(), setHot)
    pick(dataDashboardApi.awardDistribution(), setAwards)
  }, [])

  const bar = (data: any[], nameKey = 'name', valueKey = 'count') => ({
    grid: { left: 8, right: 16, top: 24, bottom: 8, containLabel: true },
    xAxis: { type: 'category' as const, data: data.map((d) => d[nameKey]), axisLabel: { interval: 0, rotate: 30, fontSize: 11 } },
    yAxis: { type: 'value' as const },
    tooltip: { trigger: 'axis' as const },
    series: [{ type: 'bar' as const, data: data.map((d) => d[valueKey]), itemStyle: { color: '#1890ff' } }],
  })

  const pie = (data: any[], nameKey = 'name', valueKey = 'count') => ({
    tooltip: { trigger: 'item' as const },
    legend: { bottom: 0, type: 'scroll' as const },
    series: [{ type: 'pie' as const, radius: ['40%', '65%'], data: data.map((d) => ({ name: d[nameKey], value: d[valueKey] })) }],
  })

  const line = (data: any[], xKey = 'month', yKey = 'count') => ({
    grid: { left: 8, right: 16, top: 24, bottom: 8, containLabel: true },
    xAxis: { type: 'category' as const, data: data.map((d) => d[xKey]) },
    yAxis: { type: 'value' as const },
    tooltip: { trigger: 'axis' as const },
    series: [{ type: 'line' as const, smooth: true, data: data.map((d) => d[yKey]), areaStyle: {} }],
  })

  return (
    <div>
      <PageHeader title="数据看板" description="平台运营数据一览" />

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        {[
          { title: '竞赛总数', value: overview?.competition_count ?? 0 },
          { title: '用户总数', value: overview?.user_count ?? 0 },
          { title: '队伍总数', value: overview?.team_count ?? 0 },
          { title: '资料总数', value: overview?.resource_count ?? 0 },
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
            key: 'category',
            label: '竞赛类别分布',
            children: <Card><Chart option={pie(byCategory)} height={340} empty={byCategory.length === 0} /></Card>,
          },
          {
            key: 'college',
            label: '学院参与情况',
            children: <Card><Chart option={bar(byCollege)} height={360} empty={byCollege.length === 0} /></Card>,
          },
          {
            key: 'trend',
            label: '报名趋势',
            children: <Card><Chart option={line(trend)} height={340} empty={trend.length === 0} /></Card>,
          },
          {
            key: 'users',
            label: '用户增长',
            children: <Card><Chart option={line(userGrowth)} height={340} empty={userGrowth.length === 0} /></Card>,
          },
          {
            key: 'hot',
            label: '热门竞赛',
            children: <Card><Chart option={bar(hot)} height={420} empty={hot.length === 0} /></Card>,
          },
          {
            key: 'awards',
            label: '获奖分布',
            children: <Card><Chart option={pie(awards)} height={340} empty={awards.length === 0} /></Card>,
          },
        ]}
      />
    </div>
  )
}
