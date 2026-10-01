import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, Col, Empty, Input, Pagination, Row, Select, Space, Button } from 'antd'
import { ExportOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { collegeApi, competitionApi } from '@/api/competitions'
import { CompetitionCard, Loading, PageHeader } from '@/components/common'
import type { Competition, College } from '@/types'

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1} 月`, value: i + 1 }))

export default function Competitions() {
  const [params, setParams] = useSearchParams()
  const [list, setList] = useState<Competition[]>([])
  const [total, setTotal] = useState(0)
  const [categories, setCategories] = useState<string[]>([])
  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(true)

  const page = Number(params.get('page') || 1)
  const pageSize = Number(params.get('pageSize') || 20)
  const category = params.get('category') || undefined
  const month = params.get('month') ? Number(params.get('month')) : undefined
  const keyword = params.get('keyword') || ''
  const collegeId = params.get('collegeId') ? Number(params.get('collegeId')) : undefined

  const patch = (next: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams(params)
    Object.entries(next).forEach(([k, v]) => {
      if (v === undefined || v === '' || v === null) p.delete(k)
      else p.set(k, String(v))
    })
    if (!('page' in next)) p.set('page', '1')
    setParams(p)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await competitionApi.list({ page, pageSize, category, month, keyword: keyword || undefined, collegeId })
      setList(res?.competitions ?? [])
      setTotal(res?.total ?? 0)
    } catch {
      setList([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, category, month, keyword, collegeId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    competitionApi.categories().then((c) => setCategories(Array.isArray(c) ? c : [])).catch(() => {})
    collegeApi.list().then((c) => setColleges(Array.isArray(c) ? c : [])).catch(() => {})
  }, [])

  return (
    <div>
      <PageHeader
        title="竞赛列表"
        description={`共 ${total} 项竞赛`}
        extra={
          <Space size={8}>
            <Button icon={<ReloadOutlined />} onClick={load}>
              刷新
            </Button>
            <Button icon={<ExportOutlined />} href="/api/export/competitions" target="_blank">
              导出列表
            </Button>
          </Space>
        }
      />

      {/* 工具栏：全部控件统一高度（.toolbar-row 已修正旧版 44px/32px 不齐） */}
      <div className="toolbar-row" style={{ marginBottom: 16 }}>
        <Select
          allowClear
          placeholder="选择类别"
          style={{ width: 160 }}
          value={category}
          onChange={(v) => patch({ category: v })}
          options={categories.map((c) => ({ label: c, value: c }))}
        />
        <Select
          allowClear
          placeholder="选择月份"
          style={{ width: 140 }}
          value={month}
          onChange={(v) => patch({ month: v })}
          options={MONTHS}
        />
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="选择学院"
          style={{ width: 180 }}
          value={collegeId}
          onChange={(v) => patch({ collegeId: v })}
          options={colleges.map((c) => ({ label: c.name, value: c.id }))}
        />
        <Input.Search
          allowClear
          placeholder="搜索竞赛名称"
          defaultValue={keyword}
          style={{ width: 260 }}
          enterButton={<SearchOutlined />}
          onSearch={(v) => patch({ keyword: v })}
        />
      </div>

      {loading ? (
        <Loading />
      ) : list.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="没有符合条件的竞赛" />
      ) : (
        <>
          <Row gutter={[12, 12]}>
            {list.map((c) => (
              <Col key={c.id} xs={24} sm={12} md={8} lg={6}>
                <CompetitionCard item={c} />
              </Col>
            ))}
          </Row>
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              showSizeChanger
              showTotal={(t) => `共 ${t} 条`}
              onChange={(p, ps) => patch({ page: p, pageSize: ps })}
            />
          </div>
        </>
      )}
    </div>
  )
}
