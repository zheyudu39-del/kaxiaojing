import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Col, Empty, Row, Space, Tag, Typography, App } from 'antd'
import { DeleteOutlined, TagOutlined } from '@ant-design/icons'
import { favoriteApi } from '@/api/me'
import { CompetitionCard, Loading, PageHeader } from '@/components/common'
import type { Competition } from '@/types'

const { Text } = Typography

export default function Favorites() {
  const { message } = App.useApp()
  const [list, setList] = useState<Competition[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [activeTag, setActiveTag] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      if (activeTag) {
        setList(await favoriteApi.byTag(activeTag))
      } else {
        const res: any = await favoriteApi.list({ pageSize: 100 })
        setList(res?.favorites ?? [])
      }
      setTags(await favoriteApi.tags().catch(() => []))
    } catch {
      setList([])
    } finally {
      setLoading(false)
    }
  }, [activeTag])

  useEffect(() => {
    load()
  }, [load])

  const remove = async (id: number) => {
    try {
      await favoriteApi.remove(id)
      setList((l) => l.filter((c) => c.id !== id))
      message.success('已取消收藏')
    } catch {
      /* ignore */
    }
  }

  return (
    <div>
      <PageHeader
        title="我的收藏"
        description={`共收藏 ${list.length} 个竞赛`}
        extra={
          tags.length > 0 ? (
            <Space wrap size={6}>
              <Tag
                color={!activeTag ? 'blue' : undefined}
                style={{ cursor: 'pointer', margin: 0 }}
                onClick={() => setActiveTag(undefined)}
              >
                全部
              </Tag>
              {tags.map((t) => (
                <Tag
                  key={t}
                  color={activeTag === t ? 'blue' : undefined}
                  style={{ cursor: 'pointer', margin: 0 }}
                  onClick={() => setActiveTag(t)}
                >
                  <TagOutlined /> {t}
                </Tag>
              ))}
            </Space>
          ) : undefined
        }
      />

      {loading ? (
        <Loading />
      ) : list.length === 0 ? (
        <Card>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={activeTag ? `标签「${activeTag}」下暂无收藏` : '还没有收藏任何竞赛'} />
        </Card>
      ) : (
        <Row gutter={[12, 12]}>
          {list.map((c) => (
            <Col key={c.id} xs={24} sm={12} md={8} lg={6}>
              <div style={{ position: 'relative' }}>
                <CompetitionCard item={c} />
                <Button
                  size="small"
                  danger
                  type="text"
                  icon={<DeleteOutlined />}
                  style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(255,255,255,.9)' }}
                  onClick={(e) => {
                    e.preventDefault()
                    remove(c.id)
                  }}
                />
              </div>
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}
