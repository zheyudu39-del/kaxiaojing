import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Avatar, Button, Card, Col, Descriptions, Empty, List, Modal, Row, Space, Table, Tag, Tooltip,
  Typography, App,
} from 'antd'
import {
  CrownOutlined, CopyOutlined, DeleteOutlined, FormOutlined, LogoutOutlined, PlusOutlined,
  ProjectOutlined, TeamOutlined, UserOutlined, UsergroupAddOutlined,
} from '@ant-design/icons'
import { teamApi } from '@/api/teams'
import { Loading, PageHeader } from '@/components/common'
import { useAuthStore } from '@/stores/auth'
import type { Team, TeamMember, JoinRequest } from '@/types'

const { Text, Paragraph } = Typography

export default function TeamDetail() {
  const { id = '' } = useParams()
  const { message, modal } = App.useApp()
  const navigate = useNavigate()
  const me = useAuthStore((s) => s.user)

  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [requests, setRequests] = useState<JoinRequest[]>([])
  const [invites, setInvites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteOpen, setInviteOpen] = useState(false)

  const isLeader = !!team && !!me && team.leader_id === me.id
  const isMember = members.some((m) => m.user_id === me?.id)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const t = await teamApi.detail(id)
      setTeam(t)
      const [ms, rs] = await Promise.allSettled([teamApi.members(id), teamApi.joinRequests(id)])
      if (ms.status === 'fulfilled') setMembers(ms.value)
      if (rs.status === 'fulfilled') setRequests(rs.value)
      // 邀请码仅队长可见
      if (t && me && t.leader_id === me.id) {
        teamApi.invites(id).then(setInvites).catch(() => setInvites([]))
      }
    } catch {
      setTeam(null)
    } finally {
      setLoading(false)
    }
  }, [id, me])

  useEffect(() => {
    load()
  }, [load])

  const apply = async () => {
    try {
      await teamApi.apply(id)
      message.success('申请已提交，等待队长审批')
      load()
    } catch {
      /* ignore */
    }
  }

  const review = async (requestId: number, action: 'approve' | 'reject') => {
    try {
      const res: any = await teamApi.reviewRequest(id, requestId, action)
      message.success(res?.message || '操作成功')
      load()
    } catch {
      /* ignore */
    }
  }

  const removeMember = (userId: number, username: string) => {
    modal.confirm({
      title: `确认移出「${username}」？`,
      content: '该成员将从队伍中移除。',
      okText: '移出',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        try {
          await teamApi.removeMember(id, userId)
          message.success('成员已移除')
          load()
        } catch {
          /* ignore */
        }
      },
    })
  }

  const transferLeader = (userId: number, username: string) => {
    modal.confirm({
      title: `把队长转让给「${username}」？`,
      content: '转让后你将变为普通成员，此操作不可撤销。',
      okText: '确认转让',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        try {
          await teamApi.transferLeader(id, userId)
          message.success('队长已转让')
          load()
        } catch {
          /* ignore */
        }
      },
    })
  }

  const leave = () => {
    modal.confirm({
      title: '确认退出队伍？',
      content: '退出后需要重新申请或被邀请才能加入。',
      okText: '退出',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        try {
          await teamApi.leave(id)
          message.success('已退出队伍')
          navigate('/my-teams')
        } catch {
          /* ignore */
        }
      },
    })
  }

  const dissolve = () => {
    modal.confirm({
      title: '确认解散队伍？',
      content: '队伍将被永久删除，所有成员都会被移出。此操作不可恢复。',
      okText: '解散',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        try {
          await teamApi.remove(id)
          message.success('队伍已解散')
          navigate('/my-teams')
        } catch {
          /* ignore */
        }
      },
    })
  }

  const createInvite = async () => {
    try {
      const res: any = await teamApi.createInvite(id, { expires_hours: 24 })
      const code = res?.invite_code || res?.code
      if (code) {
        await navigator.clipboard?.writeText(code).catch(() => {})
        message.success(`邀请码 ${code} 已生成并复制到剪贴板`)
      } else {
        message.success('邀请码已生成')
      }
      setInviteOpen(false)
      load()
    } catch {
      /* ignore */
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code).then(
      () => message.success('已复制'),
      () => message.warning('复制失败，请手动选择'),
    )
  }

  if (loading) return <Loading />
  if (!team) {
    return (
      <Card>
        <Empty description="队伍不存在或已被解散">
          <Link to="/my-teams">
            <Button type="primary">返回我的队伍</Button>
          </Link>
        </Empty>
      </Card>
    )
  }

  const pendingRequests = requests.filter((r) => r.status === 'pending')

  return (
    <div>
      <PageHeader
        title={
          <Space>
            <TeamOutlined />
            {team.name}
            {isLeader && <Tag color="gold">我是队长</Tag>}
          </Space>
        }
        description={
          <Space size={8}>
            <Link to={`/competitions/${team.competition_id}`}>
              {team.competition_name || `竞赛 #${team.competition_id}`}
            </Link>
            <Text type="secondary">· 成员 {members.length} 人</Text>
          </Space>
        }
        extra={
          <Space size={8}>
            <Link to={`/teams/${id}/forum`}>
              <Button icon={<FormOutlined />}>队伍讨论</Button>
            </Link>
            <Link to={`/teams/${id}/kanban`}>
              <Button icon={<ProjectOutlined />}>任务看板</Button>
            </Link>
            {isLeader ? (
              <>
                <Button icon={<UsergroupAddOutlined />} onClick={() => setInviteOpen(true)}>
                  邀请码
                </Button>
                <Button danger icon={<DeleteOutlined />} onClick={dissolve}>
                  解散队伍
                </Button>
              </>
            ) : isMember ? (
              <Button danger icon={<LogoutOutlined />} onClick={leave}>
                退出队伍
              </Button>
            ) : (
              <Button type="primary" icon={<PlusOutlined />} onClick={apply}>
                申请加入
              </Button>
            )}
          </Space>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="队伍信息">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="队伍名称">{team.name}</Descriptions.Item>
              <Descriptions.Item label="参加竞赛">
                <Link to={`/competitions/${team.competition_id}`}>
                  {team.competition_name || `#${team.competition_id}`}
                </Link>
              </Descriptions.Item>
              <Descriptions.Item label="队长">
                {members.find((m) => m.user_id === team.leader_id)?.username || `用户 #${team.leader_id}`}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">{team.created_at || '-'}</Descriptions.Item>
              <Descriptions.Item label="队伍简介">
                <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                  {team.description || '队长还没有填写简介'}
                </Paragraph>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {isLeader && pendingRequests.length > 0 && (
            <Card
              title={`加入申请 (${pendingRequests.length})`}
              style={{ marginTop: 16 }}
              extra={<Tag color="orange">待处理</Tag>}
            >
              <List
                dataSource={pendingRequests}
                renderItem={(r) => (
                  <List.Item
                    actions={[
                      <Button key="a" type="link" size="small" onClick={() => review(r.id, 'approve')}>
                        通过
                      </Button>,
                      <Button key="r" type="link" size="small" danger onClick={() => review(r.id, 'reject')}>
                        拒绝
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={r.username || `用户 #${r.user_id}`}
                      description={r.message || '申请加入队伍'}
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}

          {isLeader && (
            <Card title="邀请码管理" style={{ marginTop: 16 }}>
              {invites.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="还没有生成邀请码">
                  <Button type="primary" onClick={() => setInviteOpen(true)}>
                    生成邀请码
                  </Button>
                </Empty>
              ) : (
                <Table
                  rowKey="id"
                  size="small"
                  pagination={false}
                  dataSource={invites}
                  columns={[
                    {
                      title: '邀请码',
                      dataIndex: 'invite_code',
                      render: (code: string) => (
                        <Space>
                          <Text code>{code}</Text>
                          <Tooltip title="复制">
                            <Button type="text" size="small" icon={<CopyOutlined />} onClick={() => copyCode(code)} />
                          </Tooltip>
                        </Space>
                      ),
                    },
                    { title: '已使用', dataIndex: 'use_count', width: 80, render: (v: number) => v ?? 0 },
                    { title: '上限', dataIndex: 'max_uses', width: 80, render: (v: number) => v ?? '不限' },
                    { title: '过期时间', dataIndex: 'expires_at', width: 170 },
                    {
                      title: '操作',
                      width: 80,
                      render: (_: any, r: any) => (
                        <Button
                          type="link"
                          size="small"
                          danger
                          onClick={async () => {
                            await teamApi.revokeInvite(id, r.id)
                            message.success('已删除')
                            load()
                          }}
                        >
                          删除
                        </Button>
                      ),
                    },
                  ]}
                />
              )}
            </Card>
          )}
        </Col>

        <Col xs={24} lg={8}>
          <Card title={`队伍成员 (${members.length})`}>
            {members.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无成员" />
            ) : (
              <List
                dataSource={members}
                renderItem={(m) => (
                  <List.Item
                    actions={
                      isLeader && m.user_id !== team.leader_id
                        ? [
                            <Tooltip key="t" title="转让队长">
                              <Button
                                type="text"
                                size="small"
                                icon={<CrownOutlined />}
                                onClick={() => transferLeader(m.user_id, m.username || `用户 #${m.user_id}`)}
                              />
                            </Tooltip>,
                            <Tooltip key="r" title="移出队伍">
                              <Button
                                type="text"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => removeMember(m.user_id, m.username || `用户 #${m.user_id}`)}
                              />
                            </Tooltip>,
                          ]
                        : []
                    }
                  >
                    <List.Item.Meta
                      avatar={<Avatar src={m.avatar_url || undefined} icon={<UserOutlined />} />}
                      title={
                        <Space size={6}>
                          <Link to={`/users/${m.user_id}`}>{m.username || `用户 #${m.user_id}`}</Link>
                          {m.user_id === team.leader_id && <Tag color="gold">队长</Tag>}
                        </Space>
                      }
                      description={<Text type="secondary" style={{ fontSize: 12 }}>加入于 {m.joined_at || '-'}</Text>}
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title="生成邀请码"
        open={inviteOpen}
        onCancel={() => setInviteOpen(false)}
        onOk={createInvite}
        okText="生成"
        destroyOnClose
      >
        <Paragraph>生成一个 24 小时内有效的邀请码，把它发给队友即可让他们直接加入队伍。</Paragraph>
        <Text type="secondary" style={{ fontSize: 12 }}>
          生成后会自动复制到剪贴板。
        </Text>
      </Modal>
    </div>
  )
}
