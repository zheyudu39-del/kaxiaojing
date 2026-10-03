import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Empty, Input, Spin, Tree, Typography } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { collegeApi } from '@/api/competitions'
import type { College, Major } from '@/types'

const { Text } = Typography

/**
 * 桌面端左侧栏：学院/专业树，点击可直接筛竞赛。
 * （原 AI 助手面板已随模块精简移除，学院树占满整个侧栏高度。）
 */
export default function AppSider() {
  const navigate = useNavigate()
  const [colleges, setColleges] = useState<College[]>([])
  const [majorsMap, setMajorsMap] = useState<Record<number, Major[]>>({})
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    collegeApi
      .list()
      .then((list) => setColleges(Array.isArray(list) ? list : []))
      .catch(() => setColleges([]))
      .finally(() => setLoading(false))
  }, [])

  const loadMajors = async (collegeId: number) => {
    if (majorsMap[collegeId]) return
    try {
      const list = await collegeApi.majors(collegeId)
      setMajorsMap((m) => ({ ...m, [collegeId]: Array.isArray(list) ? list : [] }))
    } catch {
      setMajorsMap((m) => ({ ...m, [collegeId]: [] }))
    }
  }

  const filtered = keyword
    ? colleges.filter((c) => c.name.includes(keyword))
    : colleges

  const treeData = filtered.map((c) => ({
    key: `c-${c.id}`,
    title: c.name,
    isLeaf: false,
    children: (majorsMap[c.id] || []).map((m) => ({
      key: `m-${m.id}`,
      title: m.name,
      isLeaf: true,
    })),
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      <div style={{ padding: 12, borderBottom: '1px solid #f0f0f0' }}>
        <Text strong>学院专业</Text>
        <Input
          size="small"
          allowClear
          prefix={<SearchOutlined />}
          placeholder="搜索学院"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ marginTop: 8 }}
        />
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '8px 4px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Spin />
          </div>
        ) : treeData.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无学院数据" />
        ) : (
          <Tree
            treeData={treeData}
            defaultExpandAll={false}
            onExpand={(keys, info) => {
              if (info.expanded && info.node.key.toString().startsWith('c-')) {
                loadMajors(Number(info.node.key.toString().slice(2)))
              }
            }}
            onSelect={(_keys, info) => {
              const k = info.node.key.toString()
              if (k.startsWith('c-')) navigate(`/competitions?collegeId=${k.slice(2)}`)
              else if (k.startsWith('m-')) navigate(`/competitions?majorId=${k.slice(2)}`)
            }}
            style={{ fontSize: 13 }}
          />
        )}
      </div>
    </div>
  )
}
