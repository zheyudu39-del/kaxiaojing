import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Card, Empty, Space, Tag, Typography, Spin } from 'antd'
import type { Competition } from '@/types'

const { Title, Text } = Typography

/**
 * 页面标题栏。
 * 用 .toolbar-row 保证右侧按钮与标题垂直居中对齐、高度一致
 * （修复旧版「上传资料 44px vs 导出资源列表 32px」的问题）。
 */
export function PageHeader({
  title,
  extra,
  description,
}: {
  title: ReactNode
  extra?: ReactNode
  description?: ReactNode
}) {
  return (
    <div className="toolbar-row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
      <div style={{ minWidth: 0 }}>
        <Title level={4} style={{ margin: 0 }}>
          {title}
        </Title>
        {description && (
          <Text type="secondary" style={{ fontSize: 13 }}>
            {description}
          </Text>
        )}
      </div>
      {extra && <Space size={8}>{extra}</Space>}
    </div>
  )
}

export function Loading({ tip }: { tip?: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 0' }}>
      <Spin size="large" />
      {tip && <div style={{ marginTop: 12, color: '#8c8c8c' }}>{tip}</div>}
    </div>
  )
}

export function EmptyState({ description = '暂无数据' }: { description?: string }) {
  return (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={description} style={{ padding: '32px 0' }} />
  )
}

/** 竞赛卡片 —— 列表页/首页共用，标题与标签同行且不换行错位 */
export function CompetitionCard({ item }: { item: Competition }) {
  const monthRange =
    item.reg_start_month && item.reg_end_month
      ? `${item.reg_start_month}月 - ${item.reg_end_month}月`
      : '待公布'

  return (
    <Link to={`/competitions/${item.id}`} style={{ display: 'block', height: '100%' }}>
      <Card size="small" hoverable style={{ height: '100%' }} styles={{ body: { padding: 14 } }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <div
            className="clamp-2"
            style={{ flex: 1, fontSize: 14, fontWeight: 500, lineHeight: '20px', minHeight: 40 }}
          >
            {item.name}
          </div>
          {item.category && (
            <Tag color="blue" style={{ margin: 0, flexShrink: 0 }}>
              {item.category}
            </Tag>
          )}
        </div>

        {item.description && (
          <div className="clamp-2" style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c', lineHeight: '18px' }}>
            {item.description}
          </div>
        )}

        <div
          style={{
            marginTop: 12,
            paddingTop: 10,
            borderTop: '1px solid #f0f0f0',
            fontSize: 12,
            color: '#595959',
          }}
        >
          报名时间：{monthRange}
        </div>
      </Card>
    </Link>
  )
}
