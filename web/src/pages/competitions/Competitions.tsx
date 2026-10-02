import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, Col, Empty, Input, Pagination, Row, Select, Space, Button } from 'antd'
import { ExportOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { collegeApi, competitionApi, majorApi } from '@/api/competitions'
import { CompetitionCard, Loading, PageHeader } from '@/components/common'
import type { Competition, College, Major } from '@/types'

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1} 月`, value: i + 1 }))

export default function Competitions() {
  const [params, setParams] = useSearchParams()
  const [list, setList] = useState<Competition[]>([])
  const [total, setTotal] = useState(0)
  const [categories, setCategories] = useState<string[]>([])
  const [colleges, setColleges] = useState<College[]>([])
  const [majors, setMajors] = useState<Major[]>([])
  const [loading, setLoading] = useState(true)

  const page = Number(params.get('page') || 1)
  const pageSize = Number(params.get('pageSize') || 20)
  const category = params.get('category') || undefined
  const month = params.get('month') ? Number(params.get('month')) : undefined
  const keyword = params.get('keyword') || ''
  const collegeId = params.get('collegeId') ? Number(params.get('collegeId')) : undefined
  /** 按专业筛选时走 /majors/:id/competitions，结果与该专业推荐清单一致 */
  const [majorId, setMajorId] = useState<number | undefined>(() =>
    params.get('majorId') ? Number(params.get('majorId')) : undefined,
  )

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
      if (majorId) {
        // 专业维度：直接取该专业的推荐竞赛（与侧边栏专业节点一致）
        const res = await majorApi.competitions(majorId)
        setList(res ?? [])
        setTotal(res?.length ?? 0)
      } else {
        const res = await competitionApi.list({ page, pageSize, category, month, keyword: keyword || undefined, collegeId })
        setList(res?.competitions ?? [])
        setTotal(res?.total ?? 0)
      }
    } catch {
      setList([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, category, month, keyword, collegeId, majorId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    competitionApi.categories().then((c) => setCategories(Array.isArray(c) ? c : [])).catch(() => {})
    collegeApi.list().then((c) => setColleges(Array.isArray(c) ? c : [])).catch(() => {})
  }, [])

  // 只选了学院（没选专业）时，也要把该学院的专业列表填进下拉，供进一步收窄
  useEffect(() => {
    if (majorId) return // 专业维度由下面的专属 effect 负责
    if (!collegeId) {
      setMajors([])
      return
    }
    let cancelled = false
    collegeApi
      .majors(collegeId)
      .then((ms) => {
        if (!cancelled) setMajors(Array.isArray(ms) ? ms : [])
      })
      .catch(() => {
        if (!cancelled) setMajors([])
      })
    return () => {
      cancelled = true
    }
  }, [collegeId, majorId])

  // URL 里带 majorId 时（例如从侧边栏点专业进来）：
  // 反查该专业所属学院，把「学院 + 专业」两个下拉的值都补齐，避免下拉框只显示数字 id
  useEffect(() => {
    const id = params.get('majorId') ? Number(params.get('majorId')) : undefined
    if (!id) {
      setMajorId(undefined)
      return
    }
    setMajorId(id)
    let cancelled = false
    ;(async () => {
      try {
        const all = await collegeApi.list()
        for (const c of all) {
          const ms = await collegeApi.majors(c.id)
          if (cancelled) return
          if (ms.some((m) => m.id === id)) {
            setMajors(ms)
            // 学院也落到 URL，保证两个下拉都能显示中文名（replace 避免污染历史）
            if (String(c.id) !== params.get('collegeId')) {
              const p = new URLSearchParams(params)
              p.set('collegeId', String(c.id))
              setParams(p, { replace: true })
            }
            return
          }
        }
      } catch {
        /* 反查失败不阻断筛选 */
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.get('majorId')])

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
          onChange={(v) => {
            // 切换学院时清空专业，避免出现「学院 A + 专业 B」的错配
            setMajorId(undefined)
            patch({ collegeId: v, majorId: undefined })
          }}
          options={colleges.map((c) => ({ label: c.name, value: c.id }))}
        />
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="选择专业（推荐竞赛）"
          style={{ width: 200 }}
          value={majorId}
          disabled={!collegeId && majors.length === 0}
          onChange={(v) => {
            setMajorId(v)
            patch({ majorId: v })
          }}
          options={majors.map((m) => ({ label: m.name, value: m.id }))}
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
