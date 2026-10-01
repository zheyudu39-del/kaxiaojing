import { Card, Empty, Typography } from 'antd'
import { ToolOutlined } from '@ant-design/icons'
import { PageHeader } from './common'

const { Text, Paragraph } = Typography

/**
 * 页面占位组件。
 * 用于尚未完成实现的页面 —— 保证路由可访问、工程可编译。
 * 每个占位页会列出它将要调用的后端接口，便于后续按契约实现。
 */
export default function PagePlaceholder({
  title,
  description,
  endpoints = [],
}: {
  title: string
  description?: string
  endpoints?: string[]
}) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <Card>
        <Empty
          image={<ToolOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />}
          description={
            <div>
              <Paragraph style={{ marginBottom: 8 }}>
                <Text strong>此页面尚未实现</Text>
              </Paragraph>
              {endpoints.length > 0 && (
                <>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    计划接入的后端接口：
                  </Text>
                  <ul style={{ textAlign: 'left', display: 'inline-block', marginTop: 8 }}>
                    {endpoints.map((e) => (
                      <li key={e}>
                        <Text code style={{ fontSize: 12 }}>
                          {e}
                        </Text>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          }
        />
      </Card>
    </div>
  )
}
