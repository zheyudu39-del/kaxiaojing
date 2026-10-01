import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Button, Card, Col, Empty, Form, Input, Modal, Row, Select, Space, Tag, Typography, App,
} from 'antd'
import { PlusOutlined, TeamOutlined, UserAddOutlined } from '@ant-design/icons'
import { teamApi } from '@/api/teams'
import { competitionApi } from '@/api/competitions'
import { Loading, PageHeader } from '@/components/common'
import { useAuthStore } from '@/stores/auth'
import type { Team, Competition } from '@/types'

const { Text, Paragraph } = Typography

export default function MyTeams() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const [teams, setTeams] = useState<Team[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [createForm] = Form.useForm()
  const [joinForm] = Form.useForm()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const list = await teamApi.my()
      setTeams(list)
    } catch {
      setTeams([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    competitionApi
      .list({ pageSize: 200 })
      .then((r) => setCompetitions(r?.competitions ?? []))
      .catch(() => {})
  }, [load])

  const createTeam = async (values: any) => {
    setSubmitting(true)
    try {
      const team: any = await teamApi.create({
        competitionId: values.competitionId,
        name: values.name,
        description: values.description,
      })
      message.success('队伍创建成功')
      setCreateOpen(false)
      createForm.resetFields()
      if (team?.id) navigate(`/teams/${team.id}`)
      else load()
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false)
    }
  }

  const joinByCode = async (values: { invite_code: string }) => {
    setSubmitting(true)
    try {
      const res = await teamApi.joinByCode(values.invite_code.trim())
      message.success(res?.message || `已加入「${res?.team_name}」`)
      setJoinOpen(false)
      joinForm.resetFields()
      if (res?.team_id) navigate(`/teams/${res.team_id}`)
      else load()
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="我的队伍"
        description="你创建或加入的所有队伍"
        extra={
          <Space size={8}>
            <Button icon={<UserAddOutlined />} onClick={() => setJoinOpen(true)}>
              用邀请码加入
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
              创建队伍
            </Button>
          </Space>
        }
      />

      {loading ? (
        <Loading />
      ) : teams.length === 0 ? (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Paragraph>你还没有加入任何队伍</Paragraph>
                <Space>
                  <Button type="primary" onClick={() => setCreateOpen(true)}>
                    创建队伍
                  </Button>
                  <Link to="/competitions">
                    <Button>先去逛逛竞赛</Button>
                  </Link>
                </Space>
              </div>
            }
          />
        </Card>
      ) : (
        <Row gutter={[12, 12]}>
          {teams.map((t) => (
            <Col key={t.id} xs={24} sm={12} lg={8}>
              <Link to={`/teams/${t.id}`}>
                <Card
                  hoverable
                  size="small"
                  styles={{ body: { padding: 16 } }}
                  title={
                    <Space>
                      <TeamOutlined />
                      <span className="text-ellipsis" style={{ maxWidth: 160 }}>
                        {t.name}
                      </span>
                    </Space>
                  }
                  extra={t.leader_id === user?.id ? <Tag color="gold">我是队长</Tag> : <Tag>成员</Tag>}
                >
                  <div style={{ fontSize: 13, color: '#595959', marginBottom: 6 }}>
                    竞赛：{t.competition_name || `#${t.competition_id}`}
                  </div>
                  {t.description && (
                    <div className="clamp-2" style={{ fontSize: 12, color: '#8c8c8c', minHeight: 36 }}>
                      {t.description}
                    </div>
                  )}
                  <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
                    成员 {t.member_count ?? 1}
                    {t.max_members ? ` / ${t.max_members}` : ''} 人
                  </div>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title="创建队伍"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={() => createForm.submit()}
        confirmLoading={submitting}
        destroyOnHidden
      >
        <Form form={createForm} layout="vertical" onFinish={createTeam}>
          <Form.Item
            name="competitionId"
            label="参加哪个竞赛"
            rules={[{ required: true, message: '请选择竞赛' }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="搜索并选择竞赛"
              options={competitions.map((c) => ({ label: c.name, value: c.id }))}
            />
          </Form.Item>
          <Form.Item name="name" label="队伍名称" rules={[{ required: true, message: '请输入队伍名称' }]}>
            <Input placeholder="给队伍起个名字" maxLength={30} />
          </Form.Item>
          <Form.Item name="description" label="队伍简介">
            <Input.TextArea rows={3} maxLength={200} showCount placeholder="介绍队伍目标、需要的队友等" />
          </Form.Item>
          <Text type="secondary" style={{ fontSize: 12 }}>
            创建后你就是队长，可以生成邀请码邀请队友。
          </Text>
        </Form>
      </Modal>

      <Modal
        title="用邀请码加入队伍"
        open={joinOpen}
        onCancel={() => setJoinOpen(false)}
        onOk={() => joinForm.submit()}
        confirmLoading={submitting}
        destroyOnHidden
      >
        <Form form={joinForm} layout="vertical" onFinish={joinByCode}>
          <Form.Item name="invite_code" label="邀请码" rules={[{ required: true, message: '请输入邀请码' }]}>
            <Input placeholder="输入队长分享的邀请码" style={{ textTransform: 'uppercase' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
