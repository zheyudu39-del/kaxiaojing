import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Collapse, Empty, Input, Spin, Tree, Typography } from 'antd'
import { RobotOutlined, SearchOutlined } from '@ant-design/icons'
import { collegeApi } from '@/api/competitions'
import type { College, Major } from '@/types'

const { Text } = Typography

/**
 * 桌面端左侧栏。
 * 修复旧版问题：AI 助手面板固定占 345px，把学院树挤到只剩 230px。
 * 这里改为可折叠的 Collapse，默认收起，学院树占满可用高度。
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

      <Collapse
        ghost
        size="small"
        style={{ borderTop: '1px solid #f0f0f0' }}
        items={[
          {
            key: 'ai',
            label: (
              <span style={{ fontSize: 13 }}>
                <RobotOutlined /> 喀小竞 AI 助手
              </span>
            ),
            children: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['推荐适合我的竞赛', '现在有哪些竞赛在报名？', '数学建模怎么备赛？', '零基础如何入门竞赛？'].map(
                  (q) => (
                    <a
                      key={q}
                      onClick={() => navigate(`/ai-assistant?q=${encodeURIComponent(q)}`)}
                      style={{ fontSize: 12 }}
                    >
                      {q}
                    </a>
                  ),
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}
