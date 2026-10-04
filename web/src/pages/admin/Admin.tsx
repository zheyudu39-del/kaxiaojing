import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Avatar, Button, Card, Col, Descriptions, Empty, List, Modal, Row, Select, Space, Statistic, Table,
  Tabs, Tag, Typography, App,
} from 'antd'
import { CheckOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons'
import { adminApi } from '@/api/stats'
import { Loading, PageHeader } from '@/components/common'

const { Text, Paragraph } = Typography

const REVIEW_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: '待审核', color: 'orange' },
  approved: { label: '已通过', color: 'green' },
  rejected: { label: '已拒绝', color: 'red' },
}

export default function Admin() {
  const { message, modal } = App.useApp()

  const [stats, setStats] = useState<any>({})
  const [users, setUsers] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewType, setReviewType] = useState('award')
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState<any>(null)

  const loadStats = () => adminApi.dashboardStats().then((d) => setStats(d ?? {})).catch(() => {})
  const loadUsers = () =>
    adminApi
      .users({ pageSize: 50 })
      .then((r: any) => setUsers(r?.users ?? []))
      .catch(() => setUsers([]))
  const loadReviews = useCallback(
    (type = reviewType) =>
      adminApi
        .reviews({ type, status: 'pending', pageSize: 50 })
        .then((r: any) => setReviews(r?.items ?? []))
        .catch(() => setReviews([])),
    [reviewType],
  )

  useEffect(() => {
    Promise.allSettled([loadStats(), loadUsers(), loadReviews()]).finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const approve = async (type: string, id: number) => {
    try {
      await adminApi.approve(type, id)
      message.success('已通过')
      loadReviews(type)
    } catch {
      /* ignore */
    }
  }

  const reject = (type: string, id: number) => {
    modal.confirm({
      title: '拒绝该内容？',
      content: '拒绝后内容将不会公开展示。',
      okText: '拒绝',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        try {
          await adminApi.reject(type, id)
          message.success('已拒绝')
          loadReviews(type)
        } catch {
          /* ignore */
        }
      },
    })
  }

  const changeRole = async (userId: number, role: string) => {
    try {
      await adminApi.updateUserRole(userId, role)
      message.success('角色已更新')
      loadUsers()
    } catch {
      /* ignore */
    }
  }

  if (loading) return <Loading />

  return (
    <div>
      <PageHeader title="管理后台" description="用户管理、内容审核、平台统计" />

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        {[
          { title: '用户总数', value: stats?.user_count ?? 0 },
          { title: '竞赛总数', value: stats?.competition_count ?? 0 },
          { title: '待审核', value: stats?.pending_reviews ?? reviews.length },
          { title: '今日新增', value: stats?.today_new_users ?? 0 },
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
            key: 'reviews',
            label: `内容审核 (${reviews.length})`,
            children: (
              <Card
                extra={
                  <Select
                    size="small"
                    value={reviewType}
                    style={{ width: 140 }}
                    onChange={(v) => {
                      setReviewType(v)
                      loadReviews(v)
                    }}
                    options={[
                      { label: '获奖认证', value: 'award' },
                      { label: '证书认证', value: 'certificate' },
                      { label: '头像审核', value: 'avatar' },
                      { label: '教师认证', value: 'teacher_cert' },
                    ]}
                  />
                }
              >
                {reviews.length === 0 ? (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="没有待审核内容" />
                ) : (
                  <Table
                    rowKey="id"
                    size="small"
                    pagination={false}
                    dataSource={reviews}
                    columns={[
                      {
                        title: '标题/内容',
                        dataIndex: 'title',
                        ellipsis: true,
                        render: (t: string, r: any) => (
                          <a onClick={() => setDetail(r)}>{t || r.content?.slice(0, 40) || `#${r.content_id}`}</a>
                        ),
                      },
                      {
                        title: '提交人',
                        dataIndex: 'submitter_name',
                        width: 110,
                        render: (v: string, r: any) => v || `#${r.submitter_id}`,
                      },
                      { title: '提交时间', dataIndex: 'created_at', width: 170 },
                      {
                        title: '操作',
                        width: 140,
                        render: (_: any, r: any) => (
                          <Space size={4}>
                            <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => approve(reviewType, r.content_id)}>
                              通过
                            </Button>
                            <Button size="small" danger icon={<CloseOutlined />} onClick={() => reject(reviewType, r.content_id)}>
                              拒绝
                            </Button>
                          </Space>
                        ),
                      },
                    ]}
                  />
                )}
              </Card>
            ),
          },
          {
            key: 'users',
            label: `用户管理 (${users.length})`,
            children: (
              <Card>
                <Table
                  rowKey="id"
                  size="small"
                  pagination={{ pageSize: 20 }}
                  dataSource={users}
                  columns={[
                    {
                      title: '用户',
                      dataIndex: 'username',
                      render: (v: string, r: any) => (
                        <Space>
                          <Avatar size="small" src={r.avatar_url || undefined} icon={<UserOutlined />} />
                          <Link to={`/users/${r.id}`}>{v}</Link>
                        </Space>
                      ),
                    },
                    { title: '邮箱', dataIndex: 'email', ellipsis: true },
                    { title: '学院', dataIndex: 'college', width: 160, render: (v: string) => v || '-' },
                    { title: '注册时间', dataIndex: 'created_at', width: 170 },
                    {
                      title: '角色',
                      dataIndex: 'role',
                      width: 140,
                      render: (role: string, r: any) => (
                        <Select
                          size="small"
                          value={role}
                          style={{ width: 110 }}
                          onChange={(v) => changeRole(r.id, v)}
                          options={[
                            { label: '普通用户', value: 'user' },
                            { label: '管理员', value: 'admin' },
                          ]}
                        />
                      ),
                    },
                  ]}
                />
              </Card>
            ),
          },
        ]}
      />

      <Modal
        title="内容详情"
        open={!!detail}
        onCancel={() => setDetail(null)}
        footer={
          detail && (
            <Space>
              <Button danger onClick={() => { reject(reviewType, detail.content_id); setDetail(null) }}>
                拒绝
              </Button>
              <Button type="primary" onClick={() => { approve(reviewType, detail.content_id); setDetail(null) }}>
                通过
              </Button>
            </Space>
          )
        }
        width={640}
      >
        {detail && (
          <Descriptions column={1} size="small">
            <Descriptions.Item label="标题">{detail.title || '-'}</Descriptions.Item>
            <Descriptions.Item label="提交人">{detail.submitter_name || `#${detail.submitter_id}`}</Descriptions.Item>
            <Descriptions.Item label="时间">{detail.created_at}</Descriptions.Item>
            <Descriptions.Item label="内容">
              <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                {detail.content || detail.description || '-'}
              </Paragraph>
            </Descriptions.Item>
            {detail.review_status && (
              <Descriptions.Item label="状态">
                <Tag color={REVIEW_STATUS[detail.review_status]?.color}>
                  {REVIEW_STATUS[detail.review_status]?.label}
                </Tag>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}
